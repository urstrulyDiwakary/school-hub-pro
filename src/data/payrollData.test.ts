import { describe, it, expect } from "vitest";
import {
  payrollData,
  filterPayroll,
  summarizePayroll,
  expenseBreakdown,
  grossPay,
  netPay,
  roundINR,
  formatINR,
  formatCompactINR,
  type PayrollMonth,
  type PayrollTypeFilter,
} from "./payrollData";

describe("payroll per-record math", () => {
  it("gross = basic + hra + allowances for every record", () => {
    for (const r of payrollData) {
      expect(grossPay(r)).toBe(roundINR(r.basicSalary + r.hra + r.allowances));
    }
  });

  it("net = gross - deductions for every record", () => {
    for (const r of payrollData) {
      expect(netPay(r)).toBe(grossPay(r) - r.deductions);
    }
  });
});

describe("summarizePayroll totals match the underlying records", () => {
  it("aggregates each component and reconciles gross/net", () => {
    const summary = summarizePayroll(payrollData);

    const expectedBasic = payrollData.reduce((s, r) => s + r.basicSalary, 0);
    const expectedHra = payrollData.reduce((s, r) => s + r.hra, 0);
    const expectedAllow = payrollData.reduce((s, r) => s + r.allowances, 0);
    const expectedDed = payrollData.reduce((s, r) => s + r.deductions, 0);
    const expectedGross = expectedBasic + expectedHra + expectedAllow;
    const expectedNet = expectedGross - expectedDed;

    expect(summary.count).toBe(payrollData.length);
    expect(summary.totalBasic).toBe(expectedBasic);
    expect(summary.totalHra).toBe(expectedHra);
    expect(summary.totalAllowances).toBe(expectedAllow);
    expect(summary.totalDeductions).toBe(expectedDed);
    expect(summary.totalGross).toBe(expectedGross);
    expect(summary.totalNet).toBe(expectedNet);
  });

  it("totalNet equals the sum of per-record net pay (card number)", () => {
    const summary = summarizePayroll(payrollData);
    const sumOfNet = payrollData.reduce((s, r) => s + netPay(r), 0);
    expect(summary.totalNet).toBe(sumOfNet);
  });

  it("status counts add up to the record count", () => {
    const summary = summarizePayroll(payrollData);
    expect(summary.paidCount + summary.pendingCount + summary.holdCount).toBe(summary.count);
  });
});

describe("expense breakdown reconciles to total payroll", () => {
  it("components sum to gross expense for all filter combinations", () => {
    const months: (PayrollMonth | "all")[] = ["all", "october", "september", "august"];
    const types: PayrollTypeFilter[] = ["all", "teaching", "nonteaching"];
    for (const month of months) {
      for (const type of types) {
        const records = filterPayroll(payrollData, type, month);
        const summary = summarizePayroll(records);
        const breakdown = expenseBreakdown(summary);
        expect(breakdown.componentSum).toBe(summary.totalGross);
        expect(breakdown.reconciles).toBe(true);
      }
    }
  });

  it("percentages sum to ~100 when there is expense", () => {
    const summary = summarizePayroll(payrollData);
    const breakdown = expenseBreakdown(summary);
    const totalPct = breakdown.components.reduce((s, c) => s + c.percent, 0);
    expect(totalPct).toBeCloseTo(100, 5);
  });
});

describe("filters update totals consistently", () => {
  it("teaching + non-teaching totals add back to the all-staff total", () => {
    const all = summarizePayroll(filterPayroll(payrollData, "all", "all"));
    const teaching = summarizePayroll(filterPayroll(payrollData, "teaching", "all"));
    const nonTeaching = summarizePayroll(filterPayroll(payrollData, "nonteaching", "all"));

    expect(teaching.count + nonTeaching.count).toBe(all.count);
    expect(teaching.totalNet + nonTeaching.totalNet).toBe(all.totalNet);
    expect(teaching.totalGross + nonTeaching.totalGross).toBe(all.totalGross);
    expect(teaching.totalDeductions + nonTeaching.totalDeductions).toBe(all.totalDeductions);
  });

  it("per-month totals add back to the all-month total", () => {
    const all = summarizePayroll(filterPayroll(payrollData, "all", "all"));
    const months: PayrollMonth[] = ["october", "september", "august"];
    const monthly = months.map((m) => summarizePayroll(filterPayroll(payrollData, "all", m)));

    expect(monthly.reduce((s, m) => s + m.count, 0)).toBe(all.count);
    expect(monthly.reduce((s, m) => s + m.totalNet, 0)).toBe(all.totalNet);
    expect(monthly.reduce((s, m) => s + m.totalGross, 0)).toBe(all.totalGross);
  });

  it("filtered card numbers match the filtered records", () => {
    const records = filterPayroll(payrollData, "teaching", "october");
    const summary = summarizePayroll(records);
    expect(summary.count).toBe(records.length);
    expect(summary.totalNet).toBe(records.reduce((s, r) => s + netPay(r), 0));
  });
});

describe("INR formatting + rounding rules", () => {
  it("rounds half-up to whole rupees", () => {
    expect(roundINR(76499.4)).toBe(76499);
    expect(roundINR(76499.5)).toBe(76500);
  });

  it("formats full INR with the rupee symbol and no decimals", () => {
    const formatted = formatINR(76500);
    expect(formatted).toContain("₹");
    expect(formatted).not.toContain(".");
    expect(formatted.replace(/[^0-9]/g, "")).toBe("76500");
  });

  it("formats compact INR in lakhs / thousands", () => {
    expect(formatCompactINR(522000)).toBe("₹5.22L");
    expect(formatCompactINR(27900)).toBe("₹27.9K");
    expect(formatCompactINR(540)).toBe("₹540");
  });
});
