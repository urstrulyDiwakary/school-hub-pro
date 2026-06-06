import { Card, CardContent } from "@/components/ui/card";
import { Bell, FileText, Megaphone, MessageSquare, AlertTriangle } from "lucide-react";
import { notificationService } from "@/services/notificationService";
import type { Audience, NotificationType } from "@/data/portal/notifications";
import { cn } from "@/lib/utils";

const typeMeta: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  alert: { icon: AlertTriangle, cls: "bg-destructive/10 text-destructive" },
  circular: { icon: FileText, cls: "bg-info/10 text-info" },
  announcement: { icon: Megaphone, cls: "bg-warning/10 text-warning" },
  message: { icon: MessageSquare, cls: "bg-primary/10 text-primary" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function NotificationsView({ audience, filterType }: { audience: Exclude<Audience, "all">; filterType?: NotificationType }) {
  const items = filterType
    ? notificationService.getByType(audience, filterType)
    : notificationService.getForAudience(audience);

  if (items.length === 0)
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <Bell className="h-8 w-8" />
          <p className="text-sm">No notifications yet.</p>
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-3">
      {items.map((n) => {
        const Meta = typeMeta[n.type];
        return (
          <Card key={n.id} className={cn(!n.read && "border-primary/30")}>
            <CardContent className="flex gap-3 p-4">
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", Meta.cls)}>
                <Meta.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{n.from} · {fmt(n.date)}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
