export type Boleto = {
  linhaDigitavel: string;
  valor: number;
  vencimento: Date;
  status?: BoletoStatus;
  debtId: string;
  payer: {
    name: string;
    email: string;
    governmentId: string;
  };
};

export enum BoletoStatus {
  GENERATED,
  SENT
}
