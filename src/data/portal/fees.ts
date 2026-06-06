// Fees dataset: fee heads, payment status, receipts and payment history.

export type FeeStatus = "paid" | "pending" | "overdue";

export interface FeeItem {
  id: string;
  studentId: string;
  head: string;
  term: string;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paidDate?: string;
  receiptNo?: string;
  method?: string;
}

export const feeItems: FeeItem[] = [
  { id: "F001", studentId: "STU001", head: "Tuition Fee", term: "Term 1", amount: 25000, dueDate: "2024-07-10", status: "paid", paidDate: "2024-07-05", receiptNo: "RCP-2024-1011", method: "UPI" },
  { id: "F002", studentId: "STU001", head: "Transport Fee", term: "Term 1", amount: 8000, dueDate: "2024-07-10", status: "paid", paidDate: "2024-07-05", receiptNo: "RCP-2024-1012", method: "UPI" },
  { id: "F003", studentId: "STU001", head: "Tuition Fee", term: "Term 2", amount: 25000, dueDate: "2025-01-10", status: "paid", paidDate: "2025-01-08", receiptNo: "RCP-2025-2044", method: "Net Banking" },
  { id: "F004", studentId: "STU001", head: "Transport Fee", term: "Term 2", amount: 8000, dueDate: "2025-06-10", status: "pending" },
  { id: "F005", studentId: "STU001", head: "Lab & Library", term: "Term 2", amount: 4500, dueDate: "2025-06-10", status: "pending" },
  { id: "F006", studentId: "STU001", head: "Exam Fee", term: "Term 2", amount: 2000, dueDate: "2025-05-20", status: "overdue" },
  { id: "F007", studentId: "STU002", head: "Tuition Fee", term: "Term 2", amount: 18000, dueDate: "2025-06-10", status: "pending" },
];

export function getFeesByStudent(studentId: string): FeeItem[] {
  return feeItems.filter((f) => f.studentId === studentId);
}
