// Grade system datasets and board presets for EduTrack Pro.
//
// Supports CBSE, ICSE, State Board and private/custom grading. A grade scale is
// an ordered list of bands; helpers resolve a percentage to a band + GPA.

export type BoardType = "CBSE" | "ICSE" | "STATE" | "CUSTOM";

export interface GradeBand {
  /** Grade label, e.g. "A+". */
  grade: string;
  /** Inclusive lower bound (percentage). */
  min: number;
  /** Inclusive upper bound (percentage). */
  max: number;
  /** Grade point used for GPA computation. */
  gpa: number;
  /** Human description shown in report cards. */
  description: string;
}

export interface GradeScale {
  id: string;
  board: BoardType;
  name: string;
  /** Pass mark percentage for the scale. */
  passPercentage: number;
  bands: GradeBand[];
}

/** Canonical CBSE-style 7-band scale (default for the module). */
export const cbseBands: GradeBand[] = [
  { grade: "A+", min: 90, max: 100, gpa: 10, description: "Outstanding" },
  { grade: "A", min: 80, max: 89, gpa: 9, description: "Excellent" },
  { grade: "B+", min: 70, max: 79, gpa: 8, description: "Very Good" },
  { grade: "B", min: 60, max: 69, gpa: 7, description: "Good" },
  { grade: "C", min: 50, max: 59, gpa: 6, description: "Satisfactory" },
  { grade: "D", min: 33, max: 49, gpa: 5, description: "Needs Improvement" },
  { grade: "F", min: 0, max: 32, gpa: 0, description: "Fail" },
];

const icseBands: GradeBand[] = [
  { grade: "A+", min: 90, max: 100, gpa: 10, description: "Distinction" },
  { grade: "A", min: 80, max: 89, gpa: 9, description: "Excellent" },
  { grade: "B+", min: 70, max: 79, gpa: 8, description: "Very Good" },
  { grade: "B", min: 60, max: 69, gpa: 7, description: "Good" },
  { grade: "C", min: 50, max: 59, gpa: 6, description: "Credit" },
  { grade: "D", min: 40, max: 49, gpa: 5, description: "Pass" },
  { grade: "F", min: 0, max: 39, gpa: 0, description: "Fail" },
];

const stateBands: GradeBand[] = [
  { grade: "A+", min: 91, max: 100, gpa: 10, description: "Outstanding" },
  { grade: "A", min: 81, max: 90, gpa: 9, description: "Excellent" },
  { grade: "B+", min: 71, max: 80, gpa: 8, description: "Very Good" },
  { grade: "B", min: 61, max: 70, gpa: 7, description: "Good" },
  { grade: "C", min: 51, max: 60, gpa: 6, description: "Average" },
  { grade: "D", min: 35, max: 50, gpa: 5, description: "Below Average" },
  { grade: "F", min: 0, max: 34, gpa: 0, description: "Fail" },
];

export const gradeScalePresets: Record<BoardType, GradeScale> = {
  CBSE: { id: "scale-cbse", board: "CBSE", name: "CBSE Standard", passPercentage: 33, bands: cbseBands },
  ICSE: { id: "scale-icse", board: "ICSE", name: "ICSE Standard", passPercentage: 40, bands: icseBands },
  STATE: { id: "scale-state", board: "STATE", name: "State Board", passPercentage: 35, bands: stateBands },
  CUSTOM: { id: "scale-custom", board: "CUSTOM", name: "Custom Scale", passPercentage: 40, bands: cbseBands },
};

export const defaultGradeScale = gradeScalePresets.CBSE;
