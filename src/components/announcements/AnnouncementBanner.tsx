import { useState } from "react";
import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { useAnnouncements, type Announcement } from "@/lib/announcementStore";
import { AnnouncementDetailDialog } from "./AnnouncementDetailDialog";
import { categoryMeta } from "./meta";
import { cn } from "@/lib/utils";

/**
 * Scrolling notification banner shown under the header on every page.
 * Marquee pauses on hover/focus; tapping an item opens the full notice.
 */
export function AnnouncementBanner({ className }: { className?: string }) {
  const { user } = useAuthStore();
  const { items } = useAnnouncements(user?.role);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState<Announcement | null>(null);

  const ticker = items.slice(0, 8);
  if (dismissed || ticker.length === 0) return null;

  const row = (ariaHidden?: boolean) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={ariaHidden}>
      {ticker.map((a) => {
        const Meta = categoryMeta[a.category];
        return (
          <button
            key={(ariaHidden ? "dup-" : "") + a.id}
            type="button"
            tabIndex={ariaHidden ? -1 : 0}
            onClick={() => setActive(a)}
            className="flex items-center gap-2 text-xs font-medium text-foreground/90 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", Meta.dot)} />
            <span className="whitespace-nowrap">{a.title}</span>
            <span className="whitespace-nowrap text-muted-foreground">· {a.message.slice(0, 70)}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "sticky top-16 z-20 flex items-center gap-2 border-b border-border/70 bg-primary/5 px-3 py-2 backdrop-blur lg:px-6",
          className,
        )}
        role="region"
        aria-label="School announcements ticker"
      >
        <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
          <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden xs:inline">Notices</span>
        </span>
        <div className="group relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
            {row()}
            {row(true)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => setDismissed(true)}
          aria-label="Hide announcements ticker"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <AnnouncementDetailDialog
        announcement={active}
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
      />
    </>
  );
}
