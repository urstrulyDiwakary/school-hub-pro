// Question bank dataset: categories, difficulty, subject mapping.

export type Difficulty = "Easy" | "Medium" | "Hard";
export type QuestionType = "MCQ" | "Short Answer" | "Long Answer" | "True/False";

export interface Question {
  id: string;
  question: string;
  subject: string;
  className: string;
  chapter: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  tags: string[];
}

export const questionCategories = ["MCQ", "Short Answer", "Long Answer", "True/False"] as const;
export const difficultyLevels: Difficulty[] = ["Easy", "Medium", "Hard"];

export const questionBank: Question[] = [
  {
    id: "Q001",
    question: "What is the value of pi up to two decimal places?",
    subject: "Mathematics",
    className: "Class 7",
    chapter: "Circles",
    type: "MCQ",
    difficulty: "Easy",
    marks: 1,
    tags: ["geometry", "constants"],
  },
  {
    id: "Q002",
    question: "Derive the quadratic formula from the standard quadratic equation.",
    subject: "Mathematics",
    className: "Class 10",
    chapter: "Quadratic Equations",
    type: "Long Answer",
    difficulty: "Hard",
    marks: 5,
    tags: ["algebra", "derivation"],
  },
  {
    id: "Q003",
    question: "Photosynthesis occurs in the mitochondria. True or False?",
    subject: "Science",
    className: "Class 8",
    chapter: "Cell Biology",
    type: "True/False",
    difficulty: "Easy",
    marks: 1,
    tags: ["biology", "cells"],
  },
  {
    id: "Q004",
    question: "Explain Newton's three laws of motion with examples.",
    subject: "Science",
    className: "Class 9",
    chapter: "Force and Laws of Motion",
    type: "Long Answer",
    difficulty: "Medium",
    marks: 5,
    tags: ["physics", "mechanics"],
  },
  {
    id: "Q005",
    question: "Identify the synonym of 'benevolent'.",
    subject: "English",
    className: "Class 9",
    chapter: "Vocabulary",
    type: "MCQ",
    difficulty: "Medium",
    marks: 1,
    tags: ["grammar", "vocabulary"],
  },
  {
    id: "Q006",
    question: "Describe the causes of the First World War.",
    subject: "Social Studies",
    className: "Class 10",
    chapter: "World History",
    type: "Long Answer",
    difficulty: "Hard",
    marks: 5,
    tags: ["history", "war"],
  },
  {
    id: "Q007",
    question: "Write the Hindi translation of 'knowledge is power'.",
    subject: "Hindi",
    className: "Class 7",
    chapter: "Translation",
    type: "Short Answer",
    difficulty: "Easy",
    marks: 2,
    tags: ["translation"],
  },
  {
    id: "Q008",
    question: "What is the time complexity of binary search?",
    subject: "Computer Science",
    className: "Class 10",
    chapter: "Algorithms",
    type: "MCQ",
    difficulty: "Medium",
    marks: 1,
    tags: ["algorithms", "complexity"],
  },
  {
    id: "Q009",
    question: "State the Pythagorean theorem.",
    subject: "Mathematics",
    className: "Class 8",
    chapter: "Triangles",
    type: "Short Answer",
    difficulty: "Easy",
    marks: 2,
    tags: ["geometry"],
  },
  {
    id: "Q010",
    question: "Balance the chemical equation for the combustion of methane.",
    subject: "Science",
    className: "Class 10",
    chapter: "Chemical Reactions",
    type: "Short Answer",
    difficulty: "Hard",
    marks: 3,
    tags: ["chemistry", "equations"],
  },
];
