// Student master dataset. API-ready: swap this array for a fetch later
// without changing any consuming component.

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface AcademicInfo {
  rollNo: number;
  admissionNo: string;
  className: string;
  section: string;
  house: string;
  classTeacher: string;
  academicYear: string;
}

export interface Student {
  id: string;
  name: string;
  gender: "Male" | "Female";
  dob: string;
  bloodGroup: string;
  aadhaar: string;
  photo?: string;
  phone: string;
  email: string;
  address: string;
  parentId: string;
  emergencyContacts: EmergencyContact[];
  academic: AcademicInfo;
}

export const students: Student[] = [
  {
    id: "STU001",
    name: "Aarav Sharma",
    gender: "Male",
    dob: "2012-04-18",
    bloodGroup: "B+",
    aadhaar: "XXXX XXXX 4821",
    phone: "+91 98765 43210",
    email: "aarav.sharma@edutrack.in",
    address: "12, Green Park Colony, New Delhi - 110016",
    parentId: "PAR001",
    emergencyContacts: [
      { name: "Sunita Sharma", relation: "Mother", phone: "+91 98111 22334" },
      { name: "Rohit Sharma", relation: "Father", phone: "+91 98111 55667" },
    ],
    academic: {
      rollNo: 14,
      admissionNo: "ADM-2019-0142",
      className: "Class 7",
      section: "A",
      house: "Emerald",
      classTeacher: "Mrs. Anjali Verma",
      academicYear: "2024-25",
    },
  },
  {
    id: "STU002",
    name: "Diya Sharma",
    gender: "Female",
    dob: "2015-09-02",
    bloodGroup: "O+",
    aadhaar: "XXXX XXXX 9930",
    phone: "+91 98765 43210",
    email: "diya.sharma@edutrack.in",
    address: "12, Green Park Colony, New Delhi - 110016",
    parentId: "PAR001",
    emergencyContacts: [
      { name: "Sunita Sharma", relation: "Mother", phone: "+91 98111 22334" },
      { name: "Rohit Sharma", relation: "Father", phone: "+91 98111 55667" },
    ],
    academic: {
      rollNo: 8,
      admissionNo: "ADM-2021-0233",
      className: "Class 4",
      section: "B",
      house: "Sapphire",
      classTeacher: "Ms. Pooja Nair",
      academicYear: "2024-25",
    },
  },
];

export function getStudentById(id: string): Student | undefined {
  return students.find((s) => s.id === id);
}

export function getStudentsByParent(parentId: string): Student[] {
  return students.filter((s) => s.parentId === parentId);
}
