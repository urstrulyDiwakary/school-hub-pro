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
