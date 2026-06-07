import { QRCodeSVG } from "qrcode.react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap } from "lucide-react";
import type { HallTicket } from "@/data/exam/hallTickets";

interface HallTicketPreviewProps {
  ticket: HallTicket;
}

/** Printable hall ticket / admit card with QR verification + instructions. */
export function HallTicketPreview({ ticket }: HallTicketPreviewProps) {
  return (
    <div className="rounded-xl border bg-card p-5 sm:p-8 space-y-6 print:shadow-none">
      <div className="flex items-start justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">EduTrack Pro School</h2>
            <p className="text-xs text-muted-foreground">Hall Ticket · {ticket.examName}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-background p-2">
          <QRCodeSVG value={ticket.verificationCode} size={84} aria-label="Verification QR code" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 text-sm">
        <div className="space-y-1">
          <Field label="Student" value={ticket.studentName} />
          <Field label="Roll No" value={ticket.rollNo} />
          <Field label="Class" value={`${ticket.className} - ${ticket.section}`} />
        </div>
        <div className="space-y-1">
          <Field label="Exam" value={ticket.examName} />
          <Field label="Verification" value={ticket.verificationCode} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Examination Schedule</p>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Hall</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticket.schedule.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="whitespace-nowrap">{s.date}</TableCell>
                  <TableCell className="whitespace-nowrap">{s.startTime} – {s.endTime}</TableCell>
                  <TableCell className="font-medium">{s.subject}</TableCell>
                  <TableCell>{s.hall}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Instructions</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          {ticket.instructions.map((ins, i) => (
            <li key={i}>{ins}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
