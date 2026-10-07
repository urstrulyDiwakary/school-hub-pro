import { PageHeader } from "@/components/shell/PageHeader";
import { ThreadsPanel, useThreads } from "@/components/messages/MessageThreads";
import { useAuthStore } from "@/lib/auth";

export default function StaffInbox() {
  const user = useAuthStore((s) => s.user);
  const q = useThreads();
  const who =
    user?.role === "teacher" ? "Messages parents sent to the class teacher."
    : user?.role === "accountant" ? "Messages parents sent to the accounts office."
    : "All parent messages, including principal and transport desk.";

  return (
    <div className="space-y-6">
      <PageHeader title="Parent messages" description={who} />
      {!user?.live ? (
        <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          The parent inbox needs a real staff account. Sign in with the account your school admin created for you.
        </p>
      ) : q.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading messages…</p>
      ) : (
        <ThreadsPanel threads={q.data ?? []} emptyText="No parent messages yet." staffView />
      )}
    </div>
  );
}
