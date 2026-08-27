import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { navByPortal, resolvePortalFromPath, type NavItem } from "@/lib/navigation";
import { useAuthStore } from "@/lib/auth";
import { Clock, ArrowRight, Compass } from "lucide-react";

const RECENT_KEY = "edutrack.recent-routes";
const MAX_RECENT = 6;

interface Entry {
  title: string;
  href: string;
  group: string;
  icon: NavItem["icon"];
}

function flatten(items: NavItem[]): Entry[] {
  const out: Entry[] = [];
  for (const item of items) {
    if (item.href) out.push({ title: item.title, href: item.href, group: "Navigate", icon: item.icon });
    if (item.children)
      for (const c of item.children)
        out.push({ title: c.title, href: c.href, group: item.title, icon: item.icon });
  }
  return out;
}

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function pushRecent(href: string) {
  const list = readRecent().filter((h) => h !== href);
  list.unshift(href);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const portal = resolvePortalFromPath(location.pathname, user?.role);
  const entries = useMemo(() => flatten(navByPortal[portal]), [portal]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    pushRecent(location.pathname);
  }, [location.pathname]);

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  const recent = readRecent()
    .map((href) => entries.find((e) => e.href === href))
    .filter(Boolean) as Entry[];

  const grouped = entries.reduce<Record<string, Entry[]>>((acc, e) => {
    (acc[e.group] ||= []).push(e);
    return acc;
  }, {});

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, students, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {recent.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recent.slice(0, 5).map((e) => (
                <CommandItem key={`r-${e.href}`} value={`recent ${e.title}`} onSelect={() => go(e.href)}>
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{e.title}</span>
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        {Object.entries(grouped).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((e) => (
              <CommandItem key={e.href} value={`${group} ${e.title}`} onSelect={() => go(e.href)}>
                <e.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{e.title}</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                  {e.href}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Tips">
          <CommandItem disabled>
            <Compass className="mr-2 h-4 w-4" />
            Press ⌘K / Ctrl+K anywhere to open this palette
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function CommandPaletteTrigger({ className }: { className?: string }) {
  const openPalette = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
    );
  };
  return (
    <button
      type="button"
      onClick={openPalette}
      className={
        "group inline-flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring md:w-72 lg:w-96 " +
        (className ?? "")
      }
      aria-label="Open search command palette"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span className="flex-1 truncate text-left">Search or jump to…</span>
      <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-flex">
        ⌘K
      </kbd>
    </button>
  );
}
