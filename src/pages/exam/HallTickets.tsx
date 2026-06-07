import { useState } from "react";
import { PortalPage } from "@/components/portal/PortalPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer } from "lucide-react";
import { HallTicketPreview } from "@/components/exam/HallTicketPreview";
import { hallTickets } from "@/data/exam/hallTickets";

export default function HallTickets() {
  const [studentId, setStudentId] = useState(hallTickets[0]?.studentId ?? "");
  const ticket = hallTickets.find((t) => t.studentId === studentId) ?? hallTickets[0];

  return (
    <PortalPage
      title="Hall Tickets"
      description="Generate student admit cards with QR verification"
      actions={<Button className="gap-1" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / PDF</Button>}
    >
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Select Student</CardTitle></CardHeader>
        <CardContent>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger className="w-full sm:w-72"><SelectValue /></SelectTrigger>
            <SelectContent>{hallTickets.map((t) => <SelectItem key={t.id} value={t.studentId}>{t.studentName} · {t.rollNo}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>
      {ticket && <HallTicketPreview ticket={ticket} />}
    </PortalPage>
  );
}
