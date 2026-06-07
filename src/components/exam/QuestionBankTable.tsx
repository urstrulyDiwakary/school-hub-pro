import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { difficultyLevels, type Difficulty, type Question } from "@/data/exam/questionBank";
import { subjectList } from "@/data/exam/exams";

const diffTone: Record<Difficulty, string> = {
  Easy: "bg-success/10 text-success",
  Medium: "bg-warning/10 text-warning",
  Hard: "bg-destructive/10 text-destructive",
};

interface QuestionBankTableProps {
  questions: Question[];
}

/** Filterable question bank table (subject, difficulty, search). */
export function QuestionBankTable({ questions }: QuestionBankTableProps) {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((item) => {
      if (subject !== "all" && item.subject !== subject) return false;
      if (difficulty !== "all" && item.difficulty !== difficulty) return false;
      if (q && !item.question.toLowerCase().includes(q) && !item.chapter.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [questions, search, subject, difficulty]);

  return (
    <div className="space-y-3">
      <div className="filter-container">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions or chapters…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search questions"
          />
        </div>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjectList.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {difficultyLevels.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">Showing {filtered.length} of {questions.length} questions</p>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[260px]">Question</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="hidden md:table-cell">Class</TableHead>
              <TableHead className="hidden lg:table-cell">Chapter</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-center">Marks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">{q.question}</TableCell>
                <TableCell>{q.subject}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{q.className}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{q.chapter}</TableCell>
                <TableCell><Badge variant="outline">{q.type}</Badge></TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("border-0", diffTone[q.difficulty])}>{q.difficulty}</Badge>
                </TableCell>
                <TableCell className="text-center">{q.marks}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No questions match your filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
