import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import csv from 'csvtojson';

const SPLIT_SIZE = 500;

@Injectable()
export class BillingService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue('billing') private readonly billingQueue: Queue
  ) {}

  async receiveFile(file: Express.Multer.File) {
    await this.processFile(file);
  }
  private async processFile(file: Express.Multer.File) {
    const fileHash = await this.generateFileHash(file);
    const fileStatus = await this.cacheManager.get<FileStatus>(fileHash);
    let startPoint = 0;

    if (fileStatus && fileStatus.status === EFileStatus.PROCESSING) {
      startPoint = fileStatus.lastCheckpoint;
    }

    if (fileStatus && fileStatus.status === EFileStatus.CONSUMED) {
      Logger.log(`File ${fileHash} has been consumed`);
      return;
    }

    const billingFile: BillingFile[] = [];

    csv()
      .fromString(file.buffer.toString())
      .subscribe(
        async (jsonObj: BillingFile, lineNumber) => {
          if (lineNumber < startPoint) {
            return;
          }

          billingFile.push(jsonObj);

          if (billingFile.length === SPLIT_SIZE) {
            await this.pushToQueue(billingFile, fileHash);
            await this.cacheManager.set(
              fileHash,
              {
                status: EFileStatus.PROCESSING,
                lastCheckpoint: lineNumber
              } as FileStatus,
              24 * 60 * 60 * 1000
            );
            billingFile.length = 0;
          }
        },
        (err) => {
          Logger.error(err);
        },
        async () => {
          if (billingFile.length > 0) {
            await this.pushToQueue(billingFile, fileHash);
            billingFile.length = 0;
          }
          await this.cacheManager.set(
            fileHash,
            {
              status: EFileStatus.CONSUMED
            } as FileStatus,
            24 * 60 * 60 * 1000
          );
          Logger.log(`File ${fileHash} has been consumed`);
        }
      );
  }

  private async generateFileHash(file: Express.Multer.File) {
    // use md5 to generate a hash for the file
    return crypto.createHash('md5').update(file.buffer).digest('hex');
  }

  private async pushToQueue(object: BillingFile[], fileHash: string) {
    Logger.verbose(
      `Pushing ${object.length} items to the queue for file ${fileHash}`
    );
    await this.billingQueue.add(
      'emitCharge',
      {
        bills: object
      },
      {
        removeOnComplete: 1000,
        removeOnFail: 1000,
        attempts: 3
      }
    );
  }
}

enum EFileStatus {
  RECEIVED,
  CONSUMED,
  PROCESSING,
  FINISHED_NO_ERRORS,
  FINISHED_WITH_ERRORS,
  STUCK
}

type FileStatus = {
  status: EFileStatus;
  lastCheckpoint: number;
};

type BillingFile = {
  name: string;
  governmentId: string;
  email: string;
  debtAmount: string;
  debtDueDate: string;
  debtId: string;
};
