export const classStudents = [
  { id: "1", name: "Arjun Sharma", rollNo: "01" },
  { id: "2", name: "Priya Patel", rollNo: "02" },
  { id: "3", name: "Rahul Kumar", rollNo: "03" },
  { id: "4", name: "Sneha Reddy", rollNo: "04" },
  { id: "5", name: "Amit Singh", rollNo: "05" },
  { id: "6", name: "Kavya Nair", rollNo: "06" },
  { id: "7", name: "Rohan Gupta", rollNo: "07" },
  { id: "8", name: "Ananya Verma", rollNo: "08" },
  { id: "9", name: "Vikram Reddy", rollNo: "09" },
  { id: "10", name: "Meera Iyer", rollNo: "10" },
  { id: "11", name: "Aditya Joshi", rollNo: "11" },
  { id: "12", name: "Shreya Das", rollNo: "12" },
];

export const assignedClasses = [
  { id: "1", name: "Class 10-A", subject: "Mathematics" },
  { id: "2", name: "Class 10-B", subject: "Mathematics" },
  { id: "3", name: "Class 9-A", subject: "Mathematics" },
];

export type AttendanceStatus = "present" | "absent" | "late" | "unmarked";

export interface AttendanceRecord {
  date: string;
  classId: string;
  className: string;
  records: {
    studentId: string;
    studentName: string;
    rollNo: string;
    status: AttendanceStatus;
  }[];
}

// Mock historical attendance data
export const attendanceHistory: AttendanceRecord[] = [
  {
    date: "2026-02-06",
    classId: "1",
    className: "Class 10-A",
    records: classStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      rollNo: s.rollNo,
      status: ["present", "present", "absent", "present", "late", "present", "present", "absent", "present", "present", "late", "present"][parseInt(s.id) - 1] as AttendanceStatus,
    })),
  },
  {
    date: "2026-02-05",
    classId: "1",
    className: "Class 10-A",
    records: classStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      rollNo: s.rollNo,
      status: ["present", "absent", "present", "present", "present", "late", "present", "present", "present", "absent", "present", "present"][parseInt(s.id) - 1] as AttendanceStatus,
    })),
  },
  {
    date: "2026-02-04",
    classId: "1",
    className: "Class 10-A",
    records: classStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      rollNo: s.rollNo,
      status: ["present", "present", "present", "absent", "present", "present", "late", "present", "present", "present", "present", "absent"][parseInt(s.id) - 1] as AttendanceStatus,
    })),
  },
  {
    date: "2026-02-03",
    classId: "1",
    className: "Class 10-A",
    records: classStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      rollNo: s.rollNo,
      status: ["present", "present", "present", "present", "absent", "present", "present", "present", "late", "present", "absent", "present"][parseInt(s.id) - 1] as AttendanceStatus,
    })),
  },
  {
    date: "2026-02-06",
    classId: "2",
    className: "Class 10-B",
    records: classStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      rollNo: s.rollNo,
      status: ["present", "late", "present", "present", "present", "present", "absent", "present", "present", "present", "present", "late"][parseInt(s.id) - 1] as AttendanceStatus,
    })),
  },
  {
    date: "2026-02-05",
    classId: "2",
    className: "Class 10-B",
    records: classStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      rollNo: s.rollNo,
      status: ["absent", "present", "present", "late", "present", "present", "present", "present", "absent", "present", "present", "present"][parseInt(s.id) - 1] as AttendanceStatus,
    })),
  },
];

// Teacher payslip data
export interface PayslipData {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  bankAccount: string;
  panNumber: string;
  month: string;
  year: number;
  basicSalary: number;
  hra: number;
  da: number;
  medicalAllowance: number;
  transportAllowance: number;
  specialAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  professionalTax: number;
  loanDeduction: number;
  leaveDeduction: number;
  totalWorkingDays: number;
  daysWorked: number;
  leaveTaken: number;
}

export const teacherPayslipData: PayslipData = {
  employeeId: "EMP001",
  name: "Dr. Ramesh Kumar",
  designation: "Senior Mathematics Teacher",
  department: "Mathematics",
  bankAccount: "XXXX XXXX 4521",
  panNumber: "ABCDE1234F",
  month: "January",
  year: 2026,
  basicSalary: 45000,
  hra: 18000,
  da: 9000,
  medicalAllowance: 3000,
  transportAllowance: 2400,
  specialAllowance: 5000,
  pfDeduction: 5400,
  taxDeduction: 4500,
  professionalTax: 200,
  loanDeduction: 2000,
  leaveDeduction: 0,
  totalWorkingDays: 26,
  daysWorked: 24,
  leaveTaken: 2,
};

export const payslipMonths = [
  { value: "january-2026", label: "January 2026" },
  { value: "december-2025", label: "December 2025" },
  { value: "november-2025", label: "November 2025" },
  { value: "october-2025", label: "October 2025" },
];

// Year-to-date salary summary (April 2025 – January 2026 = 10 months)
export interface YtdSummaryData {
  financialYear: string;
  monthsCounted: number;
  totalBasic: number;
  totalHRA: number;
  totalDA: number;
  totalMedical: number;
  totalTransport: number;
  totalSpecial: number;
  totalGrossEarnings: number;
  totalPF: number;
  totalTDS: number;
  totalProfessionalTax: number;
  totalLoanRecovery: number;
  totalLeaveDeduction: number;
  totalDeductions: number;
  totalNetPaid: number;
}

export const ytdSummaryData: YtdSummaryData = {
  financialYear: "2025-26",
  monthsCounted: 10,
  totalBasic: 450000,
  totalHRA: 180000,
  totalDA: 90000,
  totalMedical: 30000,
  totalTransport: 24000,
  totalSpecial: 50000,
  totalGrossEarnings: 824000,
  totalPF: 54000,
  totalTDS: 45000,
  totalProfessionalTax: 2000,
  totalLoanRecovery: 20000,
  totalLeaveDeduction: 3462,
  totalDeductions: 124462,
  totalNetPaid: 699538,
};

// Tax computation breakdown
export interface TaxComputationData {
  grossSalaryAnnual: number;
  standardDeduction: number;
  hraExemption: number;
  professionalTax: number;
  section80C_PF: number;
  section80C_Others: number;
  section80D_Medical: number;
  totalExemptions: number;
  taxableIncome: number;
  taxSlabs: { slab: string; rate: string; tax: number }[];
  totalTaxLiability: number;
  educationCess: number;
  totalTaxPayable: number;
  tdsPaidYTD: number;
  remainingTax: number;
}

export const taxComputationData: TaxComputationData = {
  grossSalaryAnnual: 988800,
  standardDeduction: 75000,
  hraExemption: 96000,
  professionalTax: 2400,
  section80C_PF: 64800,
  section80C_Others: 50000,
  section80D_Medical: 25000,
  totalExemptions: 313200,
  taxableIncome: 675600,
  taxSlabs: [
    { slab: "Up to ₹3,00,000", rate: "Nil", tax: 0 },
    { slab: "₹3,00,001 – ₹7,00,000", rate: "5%", tax: 18780 },
    { slab: "₹7,00,001 – ₹10,00,000", rate: "10%", tax: 0 },
    { slab: "₹10,00,001 – ₹12,00,000", rate: "15%", tax: 0 },
    { slab: "₹12,00,001 – ₹15,00,000", rate: "20%", tax: 0 },
    { slab: "Above ₹15,00,000", rate: "30%", tax: 0 },
  ],
  totalTaxLiability: 18780,
  educationCess: 751,
  totalTaxPayable: 19531,
  tdsPaidYTD: 45000,
  remainingTax: 0,
};
