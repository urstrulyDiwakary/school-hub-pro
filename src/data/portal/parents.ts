// Parent / guardian dataset linked to students.

export interface Parent {
  id: string;
  name: string;
  relation: "Mother" | "Father" | "Guardian";
  email: string;
  phone: string;
  occupation: string;
  address: string;
  childrenIds: string[];
}

export const parents: Parent[] = [
  {
    id: "PAR001",
    name: "Sunita Sharma",
    relation: "Mother",
    email: "parent@edutrack.in",
    phone: "+91 98111 22334",
    occupation: "Software Engineer",
    address: "12, Green Park Colony, New Delhi - 110016",
    childrenIds: ["STU001", "STU002"],
  },
];

export function getParentById(id: string): Parent | undefined {
  return parents.find((p) => p.id === id);
}
