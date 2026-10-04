import { api } from "../../../mocks/api";

export const transactionsApi = {
  getTransaction: api.getTransaction,
  getTransactions: api.getTransactions,
  pay: api.pay,
  advance: api.advance,
  acceptInspection: api.acceptInspection,
  dispute: api.dispute,
};
