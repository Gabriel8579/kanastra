export type BillingFile = {
  name: string;
  governmentId: string;
  email: string;
  debtAmount: string;
  debtDueDate: string;
  debtId: string;
};

export type BillingJob = {
  bills: BillingFile[];
};
