import { mockTransactionsService } from "../../../mocks/transactions/service";

export const transactionsApi = {
  getTransaction: mockTransactionsService.getTransaction,
  getTransactions: mockTransactionsService.getTransactions,
  pay: mockTransactionsService.pay,
  advance: mockTransactionsService.advance,
  acceptInspection: mockTransactionsService.acceptInspection,
  dispute: mockTransactionsService.dispute,
};
