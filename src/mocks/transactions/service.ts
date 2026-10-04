import { transactionSteps } from "../../features/transactions";
import { DomainError } from "../core/errors";
import { database, persistDatabase } from "../core/database";
import { snapshot, simulateLatency } from "../core/response";
import { addNotification } from "../notifications/service";
import { findListing } from "../listings/repository";

const INSPECTION_DURATION_MS = 48 * 60 * 60 * 1000;

async function getTransaction(id: string) {
  await simulateLatency();
  const transaction = database.transactions.find((record) => record.id === id);
  if (!transaction) {
    throw new DomainError(
      "NOT_FOUND",
      "Start a purchase to create your transaction.",
    );
  }
  return snapshot(transaction);
}

async function getTransactions() {
  await simulateLatency();
  return snapshot(database.transactions);
}

async function pay(id: string, address: string) {
  await simulateLatency();
  const transaction = database.transactions.find((record) => record.id === id);
  if (!transaction) {
    throw new DomainError("NOT_FOUND", "Transaction not found.");
  }
  if (transaction.status === "payment_pending") {
    transaction.step = 1;
    transaction.status = "active";
    transaction.address = address;
    transaction.events.push({ label: transactionSteps[1], at: Date.now() });
    addNotification(
      "Payment secured. Track your collectible.",
      `/transactions/${id}`,
    );
    persistDatabase();
  }
  return snapshot(transaction);
}

async function advance(id: string) {
  await simulateLatency();
  const transaction = database.transactions.find((record) => record.id === id);
  if (
    !transaction ||
    transaction.status !== "active" ||
    transaction.step < 1 ||
    transaction.step >= 6
  ) {
    throw new DomainError(
      "INVALID_TRANSITION",
      "This transaction cannot advance.",
    );
  }
  transaction.step++;
  if (transaction.step === 6) {
    transaction.inspectionEndsAt = Date.now() + INSPECTION_DURATION_MS;
  }
  transaction.events.push({
    label: transactionSteps[transaction.step],
    at: Date.now(),
  });
  persistDatabase();
  return snapshot(transaction);
}

async function acceptInspection(id: string) {
  await simulateLatency();
  const transaction = database.transactions.find((record) => record.id === id);
  if (
    !transaction ||
    transaction.step !== 6 ||
    transaction.status !== "active"
  ) {
    throw new DomainError("INVALID_TRANSITION", "Inspection is not available.");
  }
  transaction.step = 7;
  transaction.status = "completed";
  findListing(transaction.listingId).status = "sold";
  transaction.events.push({ label: transactionSteps[7], at: Date.now() });
  persistDatabase();
  return snapshot(transaction);
}

async function dispute(id: string, reason: string) {
  await simulateLatency();
  const transaction = database.transactions.find((record) => record.id === id);
  if (
    !transaction ||
    transaction.step !== 6 ||
    transaction.status !== "active"
  ) {
    throw new DomainError(
      "INVALID_TRANSITION",
      "You can report an issue during inspection.",
    );
  }
  if (reason.trim().length < 5) {
    throw new DomainError("INVALID_REASON", "Tell us what went wrong.");
  }
  transaction.status = "disputed";
  transaction.dispute = reason;
  transaction.events.push({
    label: "Dispute opened; settlement paused",
    at: Date.now(),
  });
  persistDatabase();
  return snapshot(transaction);
}

export const mockTransactionsService = {
  getTransaction,
  getTransactions,
  pay,
  advance,
  acceptInspection,
  dispute,
};
