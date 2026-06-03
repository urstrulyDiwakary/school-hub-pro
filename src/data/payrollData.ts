// Shared payroll dataset + INR formatting / rounding / aggregation helpers.
// Centralising this guarantees the Payroll dashboard cards, table cells,
// summary footers and the audit report all derive their numbers from the
// exact same source and the exact same rounding rules.

export type PayrollStatus = "paid" | "pending" | "hold";
export type PayrollType = "Teaching" | "Non-Teaching";

export interface PayrollRecord {
  id: string;
  name: string;
  type: PayrollType;
  employeeId: string;
  /** Month the salary record belongs to, e.g. "october". */
  month: PayrollMonth;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  status: PayrollStatus;
  /** ISO timestamp of when the status was last changed. */
  statusUpdatedAt: string;
}

export type PayrollMonth = "october" | "september" | "august";

export const MONTH_LABELS: Record<PayrollMonth, string> = {
  october: "October 2024",
  september: "September 2024",
  august: "August 2024",
};

export const payrollData: PayrollRecord[] = [
  { id: "1", name: "Dr. Ramesh Kumar", type: "Teaching", employeeId: "EMP001", month: "october", basicSalary: 65000, hra: 15000, allowances: 5000, deductions: 8500, status: "paid" },
  { id: "2", name: "Priya Sharma", type: "Teaching", employeeId: "EMP002", month: "october", basicSalary: 45000, hra: 10000, allowances: 3000, deductions: 5800, status: "paid" },
  { id: "3", name: "Suresh Patel", type: "Teaching", employeeId: "EMP003", month: "october", basicSalary: 55000, hra: 12000, allowances: 4000, deductions: 7100, status: "pending" },
  { id: "4", name: "Ramesh Yadav", type: "Non-Teaching", employeeId: "NTS001", month: "october", basicSalary: 25000, hra: 5000, allowances: 2000, deductions: 3200, status: "paid" },
  { id: "5", name: "Suresh Kumar", type: "Non-Teaching", employeeId: "NTS002", month: "october", basicSalary: 18000, hra: 3000, allowances: 1500, deductions: 2250, status: "pending" },
  { id: "6", name: "Geeta Devi", type: "Non-Teaching", employeeId: "NTS005", month: "october", basicSalary: 20000, hra: 4000, allowances: 2000, deductions: 2600, status: "hold" },
  { id: "7", name: "Dr. Meena Iyer", type: "Teaching", employeeId: "EMP005", month: "october", basicSalary: 60000, hra: 14000, allowances: 4500, deductions: 7800, status: "paid" },
  { id: "8", name: "Rajesh Nair", type: "Teaching", employeeId: "EMP006", month: "october", basicSalary: 48000, hra: 11000, allowances: 3500, deductions: 6200, status: "paid" },
  { id: "9", name: "Arvind Menon", type: "Teaching", employeeId: "EMP008", month: "october", basicSalary: 58000, hra: 13000, allowances: 4000, deductions: 7500, status: "pending" },
  { id: "10", name: "Mohan Lal", type: "Non-Teaching", employeeId: "NTS003", month: "october", basicSalary: 12000, hra: 2000, allowances: 1000, deductions: 1500, status: "paid" },
  { id: "11", name: "Anita Pawar", type: "Non-Teaching", employeeId: "NTS009", month: "october", basicSalary: 24000, hra: 5000, allowances: 2000, deductions: 3100, status: "paid" },
  { id: "12", name: "Deepak Verma", type: "Non-Teaching", employeeId: "NTS010", month: "october", basicSalary: 18500, hra: 3500, allowances: 1500, deductions: 2350, status: "pending" },
  // September records
  { id: "13", name: "Dr. Ramesh Kumar", type: "Teaching", employeeId: "EMP001", month: "september", basicSalary: 65000, hra: 15000, allowances: 4500, deductions: 8400, status: "paid" },
  { id: "14", name: "Priya Sharma", type: "Teaching", employeeId: "EMP002", month: "september", basicSalary: 45000, hra: 10000, allowances: 2800, deductions: 5750, status: "paid" },
  { id: "15", name: "Ramesh Yadav", type: "Non-Teaching", employeeId: "NTS001", month: "september", basicSalary: 25000, hra: 5000, allowances: 1800, deductions: 3150, status: "paid" },
  { id: "16", name: "Mohan Lal", type: "Non-Teaching", employeeId: "NTS003", month: "september", basicSalary: 12000, hra: 2000, allowances: 800, deductions: 1450, status: "paid" },
  // August records
  { id: "17", name: "Dr. Meena Iyer", type: "Teaching", employeeId: "EMP005", month: "august", basicSalary: 60000, hra: 14000, allowances: 4000, deductions: 7700, status: "paid" },
  { id: "18", name: "Rajesh Nair", type: "Teaching", employeeId: "EMP006", month: "august", basicSalary: 48000, hra: 11000, allowances: 3200, deductions: 6150, status: "paid" },
  { id: "19", name: "Anita Pawar", type: "Non-Teaching", employeeId: "NTS009", month: "august", basicSalary: 24000, hra: 5000, allowances: 1800, deductions: 3050, status: "paid" },
];

/**
 * Round a rupee amount using the single canonical rule for the whole app:
 * round half-up to the nearest whole rupee. All cards, cells and totals use
 * this so displayed values always reconcile.
 */
export function roundINR(amount: number): number {
  return Math.round(amount);
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Format a rupee amount as full INR currency, e.g. ₹76,500. */
export function formatINR(amount: number): string {
  return inrFormatter.format(roundINR(amount));
}

/**
 * Compact INR formatting for stat cards, e.g. ₹5.22L / ₹27.9K / ₹540.
 * Uses lakhs (Indian numbering) for amounts ≥ 1,00,000.
 */
export function formatCompactINR(amount: number): string {
  const rounded = roundINR(amount);
  if (rounded >= 100000) return `₹${(rounded / 100000).toFixed(2)}L`;
  if (rounded >= 1000) return `₹${(rounded / 1000).toFixed(1)}K`;
  return `₹${rounded}`;
}

/** Gross pay for a single record (basic + HRA + allowances). */
export function grossPay(record: PayrollRecord): number {
  return roundINR(record.basicSalary + record.hra + record.allowances);
}

/** Net pay for a single record (gross − deductions). */
export function netPay(record: PayrollRecord): number {
  return roundINR(grossPay(record) - record.deductions);
}

export interface PayrollSummary {
  count: number;
  totalBasic: number;
  totalHra: number;
  totalAllowances: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  paidCount: number;
  pendingCount: number;
  holdCount: number;
}

/** Aggregate a set of records into reconciled totals. */
export function summarizePayroll(records: PayrollRecord[]): PayrollSummary {
  const summary = records.reduce<PayrollSummary>(
    (acc, r) => {
      acc.count += 1;
      acc.totalBasic += r.basicSalary;
      acc.totalHra += r.hra;
      acc.totalAllowances += r.allowances;
      acc.totalDeductions += r.deductions;
      if (r.status === "paid") acc.paidCount += 1;
      else if (r.status === "pending") acc.pendingCount += 1;
      else if (r.status === "hold") acc.holdCount += 1;
      return acc;
    },
    {
      count: 0,
      totalBasic: 0,
      totalHra: 0,
      totalAllowances: 0,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      paidCount: 0,
      pendingCount: 0,
      holdCount: 0,
    },
  );

  summary.totalBasic = roundINR(summary.totalBasic);
  summary.totalHra = roundINR(summary.totalHra);
  summary.totalAllowances = roundINR(summary.totalAllowances);
  summary.totalDeductions = roundINR(summary.totalDeductions);
  summary.totalGross = roundINR(summary.totalBasic + summary.totalHra + summary.totalAllowances);
  summary.totalNet = roundINR(summary.totalGross - summary.totalDeductions);
  return summary;
}

export type PayrollTypeFilter = "all" | "teaching" | "nonteaching";

/** Filter records by staff type and month, matching the dashboard controls. */
export function filterPayroll(
  records: PayrollRecord[],
  typeFilter: PayrollTypeFilter,
  month: PayrollMonth | "all",
): PayrollRecord[] {
  return records.filter((r) => {
    if (month !== "all" && r.month !== month) return false;
    if (typeFilter === "all") return true;
    const normalized = r.type.toLowerCase().replace("-", "");
    return normalized === typeFilter;
  });
}

export interface ExpenseComponent {
  key: "basic" | "hra" | "allowances";
  label: string;
  amount: number;
  /** Share of total gross expense (0–100). */
  percent: number;
}

/**
 * Break down gross salary expense by component and confirm the parts add back
 * up to the total gross (reconciliation flag for the UI).
 */
export function expenseBreakdown(summary: PayrollSummary): {
  components: ExpenseComponent[];
  reconciles: boolean;
  componentSum: number;
} {
  const total = summary.totalGross || 1;
  const components: ExpenseComponent[] = [
    { key: "basic", label: "Basic Salary", amount: summary.totalBasic, percent: (summary.totalBasic / total) * 100 },
    { key: "hra", label: "HRA", amount: summary.totalHra, percent: (summary.totalHra / total) * 100 },
    { key: "allowances", label: "Allowances", amount: summary.totalAllowances, percent: (summary.totalAllowances / total) * 100 },
  ];
  const componentSum = roundINR(summary.totalBasic + summary.totalHra + summary.totalAllowances);
  return { components, componentSum, reconciles: componentSum === summary.totalGross };
}

// ---------------------------------------------------------------------------
// Net-pay status filtering
// ---------------------------------------------------------------------------

export type PayrollStatusFilter = "all" | PayrollStatus;

/** Filter records by their net-pay/payment status. */
export function filterByStatus(
  records: PayrollRecord[],
  statusFilter: PayrollStatusFilter,
): PayrollRecord[] {
  if (statusFilter === "all") return records;
  return records.filter((r) => r.status === statusFilter);
}

// ---------------------------------------------------------------------------
// Role-based scoping
// ---------------------------------------------------------------------------

/**
 * The employee currently signed in to the teacher panel. In a real backend
 * this would come from the authenticated session; here it mirrors the demo
 * teacher identity used across the teacher pages (Dr. Ramesh Kumar).
 */
export const CURRENT_TEACHER_EMPLOYEE_ID = "EMP001";

/**
 * Restrict the payroll dataset to what a given role is permitted to see.
 * Admins get the full report; teachers only ever see their own records.
 */
export function scopeRecordsForRole(
  records: PayrollRecord[],
  role: "admin" | "teacher",
  employeeId: string = CURRENT_TEACHER_EMPLOYEE_ID,
): PayrollRecord[] {
  if (role === "admin") return records;
  return records.filter((r) => r.employeeId === employeeId);
}

// ---------------------------------------------------------------------------
// Month-over-month comparison
// ---------------------------------------------------------------------------

/** Chronological order of months, newest first. */
export const MONTH_ORDER: PayrollMonth[] = ["october", "september", "august"];

/** The month immediately preceding the given one, or null if none exists. */
export function previousMonth(month: PayrollMonth): PayrollMonth | null {
  const idx = MONTH_ORDER.indexOf(month);
  if (idx === -1 || idx === MONTH_ORDER.length - 1) return null;
  return MONTH_ORDER[idx + 1];
}

export interface MetricDelta {
  current: number;
  previous: number;
  /** Absolute change (current − previous). */
  change: number;
  /** Percentage change vs previous (0 when previous is 0). */
  percent: number;
}

export interface PayrollComparison {
  hasPrevious: boolean;
  previousMonth: PayrollMonth | null;
  totalGross: MetricDelta;
  totalDeductions: MetricDelta;
  totalNet: MetricDelta;
}

function delta(current: number, previous: number): MetricDelta {
  const change = roundINR(current - previous);
  const percent = previous === 0 ? 0 : (change / previous) * 100;
  return { current, previous, change, percent };
}

/**
 * Compare a month's payroll totals against the previous month. Both sides are
 * filtered with the same type filter so the comparison stays apples-to-apples.
 */
export function comparePayrollToPreviousMonth(
  records: PayrollRecord[],
  month: PayrollMonth,
  typeFilter: PayrollTypeFilter = "all",
): PayrollComparison {
  const prev = previousMonth(month);
  const currentSummary = summarizePayroll(filterPayroll(records, typeFilter, month));
  const previousSummary = prev
    ? summarizePayroll(filterPayroll(records, typeFilter, prev))
    : summarizePayroll([]);
  return {
    hasPrevious: prev !== null,
    previousMonth: prev,
    totalGross: delta(currentSummary.totalGross, previousSummary.totalGross),
    totalDeductions: delta(currentSummary.totalDeductions, previousSummary.totalDeductions),
    totalNet: delta(currentSummary.totalNet, previousSummary.totalNet),
  };
}
