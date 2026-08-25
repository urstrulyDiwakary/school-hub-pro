import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AUDIENCE_LABELS,
  CATEGORY_LABELS,
  type Announcement,
} from "@/lib/announcementStore";
import { categoryMeta, formatWhen } from "./meta";
import { cn } from "@/lib/utils";

interface Props {
  announcement: Announcement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnnouncementDetailDialog({ announcement, open, onOpenChange }: Props) {
  if (!announcement) return null;
  const Meta = categoryMeta[announcement.category];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", Meta.chip)}>
              <Meta.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <Badge variant="secondary" className="border-0">
              {CATEGORY_LABELS[announcement.category]}
            </Badge>
          </div>
          <DialogTitle className="text-left">{announcement.title}</DialogTitle>
          <DialogDescription className="text-left">
            {announcement.createdBy} · {formatWhen(announcement.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm leading-relaxed text-foreground">{announcement.message}</p>

        <div className="mt-2 space-y-2 text-xs text-muted-foreground">
          {announcement.effectiveDate && (
            <p>
              <span className="font-medium text-foreground">Date: </span>
              {new Date(announcement.effectiveDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-foreground">Sent to:</span>
            {announcement.audiences.map((a) => (
              <Badge key={a} variant="outline" className="text-[10px]">
                {AUDIENCE_LABELS[a]}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-foreground">Channels:</span>
            {announcement.channels.map((c) => (
              <Badge key={c} variant="outline" className="text-[10px] uppercase">
                {c.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
