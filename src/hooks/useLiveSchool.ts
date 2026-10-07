import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Student } from "@/data/portal/students";
import type { AttendanceRecord, AttendanceStatus } from "@/data/portal/attendance";
import type { ExamResult, SubjectMark } from "@/data/portal/results";

type StudentRow = { id: string; full_name: string; class_name: string; section: string; roll_no: number | null; class_teacher: string };

export function toPortalStudent(r: StudentRow): Student {
  return {
    id: r.id, name: r.full_name, gender: "Male", dob: "", bloodGroup: "—", aadhaar: "—",
    phone: "", email: "", address: "", parentId: "", emergencyContacts: [],
    academic: {
      rollNo: r.roll_no ?? 0, admissionNo: "—", className: r.class_name, section: r.section,
      house: "—", classTeacher: r.class_teacher || "Class Teacher", academicYear: "",
    },
  };
}

export function useLiveStudents(enabled = true) {
  return useQuery({
    queryKey: ["live-students"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").order("class_name").order("roll_no");
      if (error) throw error;
      return data as StudentRow[];
    },
  });
}

export function useLiveAttendance(studentId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["live-attendance", studentId],
    enabled: enabled && !!studentId,
    queryFn: async (): Promise<AttendanceRecord[]> => {
      const { data, error } = await supabase.from("attendance_records").select("date,status")
        .eq("student_id", studentId!).order("date", { ascending: false }).limit(400);
      if (error) throw error;
      return (data ?? []).map((r) => ({ studentId: studentId!, date: r.date, status: r.status as AttendanceStatus }));
    },
  });
}

const grade = (p: number) => (p >= 90 ? "A+" : p >= 80 ? "A" : p >= 70 ? "B+" : p >= 60 ? "B" : p >= 50 ? "C" : "D");

export function useLiveResults(studentId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["live-results", studentId],
    enabled: enabled && !!studentId,
    queryFn: async (): Promise<ExamResult[]> => {
      const { data, error } = await supabase.from("exam_results").select("*")
        .eq("student_id", studentId!).order("exam_date");
      if (error) throw error;
      return (data ?? []).map((r) => {
        const subjects = ((r.subjects as unknown as { subject: string; marks: number; maxMarks: number }[]) ?? []).map(
          (s): SubjectMark => ({ ...s, grade: grade(s.maxMarks ? (s.marks / s.maxMarks) * 100 : 0) }),
        );
        const total = subjects.reduce((a, s) => a + s.marks, 0);
        const max = subjects.reduce((a, s) => a + s.maxMarks, 0);
        return {
          id: r.id, studentId: r.student_id, examName: r.exam_name, term: r.term, date: r.exam_date,
          subjects, percentage: max ? Math.round((total / max) * 1000) / 10 : 0,
          rank: r.class_rank ?? 0, totalStudents: r.total_students ?? 0,
        };
      });
    },
  });
}

/** Re-fetch the given query keys whenever these tables change. */
export function useRealtimeInvalidate(tables: string[], keys: string[][], enabled = true) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    const ch = supabase.channel(`rt-${tables.join("-")}-${Math.random().toString(36).slice(2)}`);
    tables.forEach((t) =>
      ch.on("postgres_changes", { event: "*", schema: "public", table: t }, () =>
        keys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
      ),
    );
    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tables.join(",")]);
}
