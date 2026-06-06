// Fee service: breakdowns, totals, receipts and payment history.
// Reuses the same INR formatter conventions as the rest of EduTrack Pro.

import { getFeesByStudent, type FeeItem } from "@/data/portal/fees";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface FeeSummary {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
}

export const feeService = {
  getAll(studentId: string): FeeItem[] {
    return getFeesByStudent(studentId);
  },

  getSummary(studentId: string): FeeSummary {
    const fees = getFeesByStudent(studentId);
    const sum = (items: FeeItem[]) => items.reduce((s, f) => s + f.amount, 0);
    return {
      total: sum(fees),
      paid: sum(fees.filter((f) => f.status === "paid")),
      pending: sum(fees.filter((f) => f.status === "pending")),
      overdue: sum(fees.filter((f) => f.status === "overdue")),
    };
  },

  getPaid(studentId: string): FeeItem[] {
    return getFeesByStudent(studentId).filter((f) => f.status === "paid");
  },

  getPending(studentId: string): FeeItem[] {
    return getFeesByStudent(studentId).filter((f) => f.status !== "paid");
  },

  /** Payment history (paid items sorted by paid date desc). */
  getPaymentHistory(studentId: string): FeeItem[] {
    return getFeesByStudent(studentId)
      .filter((f) => f.status === "paid")
      .sort((a, b) => ((a.paidDate ?? "") < (b.paidDate ?? "") ? 1 : -1));
  },

  /** Upcoming dues sorted by due date. */
  getUpcomingDues(studentId: string): FeeItem[] {
    return getFeesByStudent(studentId)
      .filter((f) => f.status !== "paid")
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  },

  /** Generate a plain-text receipt for download. */
  buildReceiptText(fee: FeeItem, studentName: string): string {
    return [
      "EduTrack Pro — Fee Receipt",
      "==========================",
      `Receipt No : ${fee.receiptNo ?? "N/A"}`,
      `Student    : ${studentName}`,
      `Fee Head   : ${fee.head} (${fee.term})`,
      `Amount     : ${formatINR(fee.amount)}`,
      `Paid On    : ${fee.paidDate ?? "N/A"}`,
      `Method     : ${fee.method ?? "N/A"}`,
      "==========================",
      "This is a system-generated receipt.",
    ].join("\n");
  },
};
