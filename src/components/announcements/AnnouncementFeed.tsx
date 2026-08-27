import { useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/lib/auth";
import {
  CATEGORY_LABELS,
  canBroadcast,
  useAnnouncements,
  type Announcement,
} from "@/lib/announcementStore";
import { AnnouncementDetailDialog } from "./AnnouncementDetailDialog";
import { SendAnnouncementDialog } from "./SendAnnouncementDialog";
import { categoryMeta, formatWhen } from "./meta";
import { cn } from "@/lib/utils";

/**
 * Scrollable announcement feed for home/dashboard pages. Management &
 * teachers also get the composer inline.
 */
export function AnnouncementFeed({
  title = "Announcements & Alerts",
  maxHeight = 340,
  className,
}: {
  title?: string;
  maxHeight?: number;
  className?: string;
}) {
  const { user } = useAuthStore();
  const { items, unreadCount, isRead, markRead, markAllRead, remove } = useAnnouncements(user?.role);
  const [active, setActive] = useState<Announcement | null>(null);
  const canSend = canBroadcast(user?.role);

  const open = (a: Announcement) => {
    markRead(a.id);
    setActive(a);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" aria-hidden="true" /> {title}
          {unreadCount > 0 && (
            <Badge variant="secondary" className="border-0 bg-primary/10 text-primary">
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
          {canSend && <SendAnnouncementDialog />}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No announcements yet.</p>
        ) : (
          <ScrollArea style={{ maxHeight }} className="pr-3">
            <ul className="space-y-2">
              {items.map((a) => {
                const Meta = categoryMeta[a.category];
                const unread = !isRead(a.id);
                return (
                  <li key={a.id}>
                    <div
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50",
                        unread && "border-primary/30 bg-primary/[0.03]",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => open(a)}
                        className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                        aria-label={`Open ${CATEGORY_LABELS[a.category]}: ${a.title}`}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            Meta.chip,
                          )}
                          aria-hidden="true"
                        >
                          <Meta.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold">{a.title}</span>
                            {a.pinned && (
                              <Badge variant="outline" className="shrink-0 text-[10px]">
                                Pinned
                              </Badge>
                            )}
                          </span>
                          <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                            {a.message}
                          </span>
                          <span className="mt-1 block text-[11px] text-muted-foreground">
                            {a.createdBy} · {formatWhen(a.createdAt)}
                          </span>
                        </span>
                      </button>
                      {canSend && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => remove(a.id)}
                          aria-label={`Delete announcement ${a.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>

      <AnnouncementDetailDialog
        announcement={active}
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
      />
    </Card>
  );
}
