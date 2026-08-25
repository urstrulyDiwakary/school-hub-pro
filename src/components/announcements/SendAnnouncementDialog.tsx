import { useState, type ReactNode } from "react";
import { Megaphone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth/types";
import {
  AUDIENCE_LABELS,
  CATEGORY_LABELS,
  announcementStore,
  type AnnouncementAudience,
  type AnnouncementCategory,
  type AnnouncementChannel,
} from "@/lib/announcementStore";

const AUDIENCES: AnnouncementAudience[] = ["all", "teachers", "parents", "students", "staff"];
const CHANNELS: { id: AnnouncementChannel; label: string }[] = [
  { id: "in_app", label: "In-app" },
  { id: "sms", label: "SMS" },
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
];

/**
 * Composer used by management & teachers to broadcast holidays, alerts,
 * events and notices to any audience. Publishes into the shared
 * announcement store so banners, feeds and the header bell update live.
 */
export function SendAnnouncementDialog({ trigger }: { trigger?: ReactNode }) {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<AnnouncementCategory>("holiday");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [audiences, setAudiences] = useState<AnnouncementAudience[]>(["all"]);
  const [channels, setChannels] = useState<AnnouncementChannel[]>(["in_app"]);

  const toggle = <T,>(list: T[], value: T, set: (v: T[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const reset = () => {
    setCategory("holiday");
    setTitle("");
    setMessage("");
    setEffectiveDate("");
    setAudiences(["all"]);
    setChannels(["in_app"]);
  };

  const submit = () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "Title and message are required", variant: "destructive" });
      return;
    }
    if (audiences.length === 0) {
      toast({ title: "Pick at least one audience", variant: "destructive" });
      return;
    }
    announcementStore.publish({
      category,
      title: title.trim(),
      message: message.trim(),
      audiences,
      channels: channels.length ? channels : ["in_app"],
      createdBy: user ? `${user.name} (${ROLE_LABELS[user.role]})` : "School Office",
      effectiveDate: effectiveDate || undefined,
      pinned: category === "holiday" || category === "alert",
    });
    toast({
      title: "Announcement sent",
      description: `${CATEGORY_LABELS[category]} delivered to ${audiences
        .map((a) => AUDIENCE_LABELS[a])
        .join(", ")}.`,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <Megaphone className="h-4 w-4" /> Send announcement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send announcement</DialogTitle>
          <DialogDescription>
            Broadcast a holiday, alert or notice — it appears instantly in the notice ticker and
            every recipient's notifications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ann-category">Type</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as AnnouncementCategory)}>
                <SelectTrigger id="ann-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as AnnouncementCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ann-date">Date (optional)</Label>
              <Input
                id="ann-date"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ann-title">Title</Label>
            <Input
              id="ann-title"
              placeholder="Holiday — Independence Day"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ann-message">Message</Label>
            <Textarea
              id="ann-message"
              rows={4}
              placeholder="School will remain closed on…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Audience</legend>
            <div className="flex flex-wrap gap-3">
              {AUDIENCES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={audiences.includes(a)}
                    onCheckedChange={() => toggle(audiences, a, setAudiences)}
                    aria-label={AUDIENCE_LABELS[a]}
                  />
                  {AUDIENCE_LABELS[a]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Channels</legend>
            <div className="flex flex-wrap gap-3">
              {CHANNELS.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={channels.includes(c.id)}
                    onCheckedChange={() => toggle(channels, c.id, setChannels)}
                    aria-label={c.label}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} className="gap-2">
            <Send className="h-4 w-4" /> Send now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
