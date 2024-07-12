import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import multer from 'multer';
import { BillingService } from './billing.service';

@Controller('billing')
@ApiTags('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('charge')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage()
    })
  )
  @ApiOperation({
    summary: 'Create a charge from a CSV file.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  async charge(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'csv'
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
    )
    file: Express.Multer.File
  ) {
    this.billingService.receiveFile(file);
  }
}
