import { useState } from "react";
import { Bell, Mail, Smartphone, Send, Eye, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { notifyAbsentStudent, dispatchPendingNotifications } from "@/utils/notificationService";

interface CriticalStudent {
  studentId: string;
  studentName: string;
  rollNo: string;
  rate: number;
  absent: number;
  totalDays: number;
}

interface NotifyParentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: CriticalStudent[];
  className?: string;
}

const DEFAULT_SMS_TEMPLATE = `Dear Parent,

This is to inform you that your child {studentName} (Roll No: {rollNo}) has an attendance rate of {rate}% which is below the required 75% threshold.

Total days tracked: {totalDays}
Days absent: {absent}

Please ensure regular attendance. Contact the class teacher for further details.

— EduTrack Pro School`;

const DEFAULT_EMAIL_SUBJECT = "Attendance Alert: {studentName} - Below 75% Threshold";

export default function NotifyParentsDialog({
  open,
  onOpenChange,
  students,
  className = "Current Class",
}: NotifyParentsDialogProps) {
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_SMS_TEMPLATE);
  const [emailSubject, setEmailSubject] = useState(DEFAULT_EMAIL_SUBJECT);
  const [previewStudent, setPreviewStudent] = useState<CriticalStudent | null>(
    students[0] || null
  );

  const renderPreview = (template: string, student: CriticalStudent) => {
    return template
      .replace(/{studentName}/g, student.studentName)
      .replace(/{rollNo}/g, student.rollNo)
      .replace(/{rate}/g, String(student.rate))
      .replace(/{absent}/g, String(student.absent))
      .replace(/{totalDays}/g, String(student.totalDays));
  };

  const handleSend = () => {
    students.forEach((s) => {
      notifyAbsentStudent({
        studentId: s.studentId,
        studentName: s.studentName,
        className,
        date: new Date().toISOString().split("T")[0],
      });
    });
    const count = dispatchPendingNotifications();
    const channels = [smsEnabled && "SMS", emailEnabled && "Email"].filter(Boolean).join(" & ");
    toast.success(`Sent ${count} ${channels} notification(s) to parents of students below 75% attendance`);
    onOpenChange(false);
  };

  const currentPreview = previewStudent || students[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-destructive" />
            Notify Parents — {students.length} Student{students.length > 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Channel toggles */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} id="sms-toggle" />
              <Label htmlFor="sms-toggle" className="flex items-center gap-1.5 cursor-pointer text-sm">
                <Smartphone className="h-4 w-4 text-success" />
                SMS
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} id="email-toggle" />
              <Label htmlFor="email-toggle" className="flex items-center gap-1.5 cursor-pointer text-sm">
                <Mail className="h-4 w-4 text-primary" />
                Email
              </Label>
            </div>
          </div>

          <Separator />

          {/* Student list */}
          <div>
            <Label className="text-xs text-muted-foreground">Recipients ({students.length})</Label>
            <div className="mt-2 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {students.map((s) => (
                <button
                  key={s.studentId}
                  onClick={() => setPreviewStudent(s)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    previewStudent?.studentId === s.studentId
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  }`}
                >
                  {s.rollNo} {s.studentName.split(" ")[0]} — {s.rate}%
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Message template / preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">
                {isEditing ? "Edit Template" : "Message Preview"}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs h-7"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </>
                ) : (
                  <>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </>
                )}
              </Button>
            </div>

            {emailEnabled && (
              <div className="mb-3">
                <Label className="text-xs text-muted-foreground">Subject</Label>
                {isEditing ? (
                  <input
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                ) : (
                  <p className="mt-1 rounded-md bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
                    {currentPreview ? renderPreview(emailSubject, currentPreview) : emailSubject}
                  </p>
                )}
              </div>
            )}

            {isEditing ? (
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Body — use {"{studentName}"}, {"{rollNo}"}, {"{rate}"}, {"{absent}"}, {"{totalDays}"}
                </Label>
                <Textarea
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  rows={8}
                  className="text-sm font-mono"
                />
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                  {currentPreview ? renderPreview(messageTemplate, currentPreview) : messageTemplate}
                </pre>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!smsEnabled && !emailEnabled}
            className="gap-2 w-full sm:w-auto"
            variant="destructive"
          >
            <Send className="h-4 w-4" />
            Send to {students.length} Parent{students.length > 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
