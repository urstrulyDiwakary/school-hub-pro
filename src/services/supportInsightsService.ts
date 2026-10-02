// Support insights: identifies students who may need academic support and
// suggests class-level interventions.
//
// Integration point: set VITE_SUPPORT_INSIGHTS_ENDPOINT to your server-side
// AI endpoint (e.g. a backend function that calls the AI Gateway). The API key
// must stay on that server — never in this client. Until the endpoint is set,
// a local rule-based analyzer returns the same response shape.

export interface MarksInput {
  studentId: string;
  studentName: string;
  rollNo: string;
  attendance?: number;
  subjects: { subject: string; marks: number; maxMarks: number }[];
}

export interface AnalyzeRequest {
  examName: string;
  className: string;
  passingPercent: number;
  students: MarksInput[];
}

export type RiskLevel = "high" | "medium" | "low";

export interface StudentFlag {
  studentId: string;
  studentName: string;
  rollNo: string;
  risk: RiskLevel;
  percentage: number;
  weakSubjects: string[];
  reasons: string[];
  suggestion: string;
}

export interface ClassIntervention {
  title: string;
  focus: string;
  detail: string;
  priority: RiskLevel;
}

export interface AnalyzeResponse {
  source: "ai" | "local";
  summary: string;
  flagged: StudentFlag[];
  interventions: ClassIntervention[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
export const SUPPORT_INSIGHTS_ENDPOINT =
  (import.meta.env.VITE_SUPPORT_INSIGHTS_ENDPOINT as string | undefined) ??
  (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/support-insights` : undefined);

const pct = (m: number, max: number) => (max > 0 ? (m / max) * 100 : 0);

function analyzeLocally(req: AnalyzeRequest): AnalyzeResponse {
  const pass = req.passingPercent;
  const flagged: StudentFlag[] = [];
  const subjectFails = new Map<string, number>();
  const subjectAvg = new Map<string, { sum: number; n: number }>();

  for (const s of req.students) {
    const total = s.subjects.reduce((a, x) => a + x.marks, 0);
    const max = s.subjects.reduce((a, x) => a + x.maxMarks, 0);
    const overall = Math.round(pct(total, max) * 10) / 10;
    const weak = s.subjects.filter((x) => pct(x.marks, x.maxMarks) < pass + 10).map((x) => x.subject);
    const failed = s.subjects.filter((x) => pct(x.marks, x.maxMarks) < pass);
    s.subjects.forEach((x) => {
      const a = subjectAvg.get(x.subject) ?? { sum: 0, n: 0 };
      a.sum += pct(x.marks, x.maxMarks);
      a.n += 1;
      subjectAvg.set(x.subject, a);
      if (pct(x.marks, x.maxMarks) < pass) subjectFails.set(x.subject, (subjectFails.get(x.subject) ?? 0) + 1);
    });

    const reasons: string[] = [];
    if (overall < pass) reasons.push(`Overall ${overall}% is below passing (${pass}%)`);
    if (failed.length) reasons.push(`Below passing in ${failed.map((f) => f.subject).join(", ")}`);
    if (s.attendance !== undefined && s.attendance < 75) reasons.push(`Attendance ${s.attendance}% (below 75%)`);

    let risk: RiskLevel | null = null;
    if (overall < pass || failed.length >= 2) risk = "high";
    else if (failed.length === 1 || overall < pass + 15 || (s.attendance ?? 100) < 75) risk = "medium";
    if (!risk) continue;
    if (!reasons.length) reasons.push(`Overall ${overall}% is close to the passing line`);

    flagged.push({
      studentId: s.studentId,
      studentName: s.studentName,
      rollNo: s.rollNo,
      risk,
      percentage: overall,
      weakSubjects: weak,
      reasons,
      suggestion:
        risk === "high"
          ? `Schedule a parent meeting and enrol in remedial classes${weak.length ? ` for ${weak.slice(0, 2).join(" & ")}` : ""}.`
          : `Assign a peer mentor and weekly practice worksheets${weak.length ? ` in ${weak[0]}` : ""}.`,
    });
  }

  flagged.sort((a, b) => (a.risk === b.risk ? a.percentage - b.percentage : a.risk === "high" ? -1 : 1));

  const interventions: ClassIntervention[] = [];
  const n = req.students.length || 1;
  [...subjectAvg.entries()]
    .map(([subject, { sum, n: c }]) => ({ subject, avg: sum / c, fails: subjectFails.get(subject) ?? 0 }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3)
    .forEach(({ subject, avg, fails }) => {
      if (avg >= pass + 25 && fails === 0) return;
      interventions.push({
        title: `Revision block: ${subject}`,
        focus: subject,
        priority: fails / n > 0.25 ? "high" : "medium",
        detail: `Class average ${Math.round(avg)}%, ${fails} student(s) below passing. Add 2 extra periods per week on core concepts and a short diagnostic test after 2 weeks.`,
      });
    });

  const high = flagged.filter((f) => f.risk === "high").length;
  if (high > 0)
    interventions.push({
      title: "Small-group remedial batch",
      focus: "High-risk students",
      priority: "high",
      detail: `Group the ${high} high-risk student(s) into an after-school batch with a dedicated teacher and fortnightly progress reviews shared with parents.`,
    });
  if (req.students.some((s) => (s.attendance ?? 100) < 75))
    interventions.push({
      title: "Attendance follow-up",
      focus: "Attendance",
      priority: "medium",
      detail: "Send attendance alerts to parents of students under 75% and have the class teacher check in weekly.",
    });

  return {
    source: "local",
    summary: `${flagged.length} of ${req.students.length} students in ${req.className} may need support (${high} high risk) after ${req.examName}.`,
    flagged,
    interventions,
  };
}

export const supportInsightsService = {
  isAiConnected: () => Boolean(SUPPORT_INSIGHTS_ENDPOINT),

  async analyze(req: AnalyzeRequest): Promise<AnalyzeResponse> {
    if (!SUPPORT_INSIGHTS_ENDPOINT) {
      await new Promise((r) => setTimeout(r, 600));
      return analyzeLocally(req);
    }
    const res = await fetch(SUPPORT_INSIGHTS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SUPABASE_KEY ? { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } : {}),
      },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (res.status === 402) throw new Error(body.message ?? "AI credits are exhausted. Please top up to continue.");
      if (res.status === 429) throw new Error("Too many requests right now. Please try again in a minute.");
      throw new Error(body.message ?? body.error ?? `Analysis failed (${res.status}).`);
    }
    const data = (await res.json()) as Omit<AnalyzeResponse, "source">;
    return { ...data, source: "ai" };
  },
};
