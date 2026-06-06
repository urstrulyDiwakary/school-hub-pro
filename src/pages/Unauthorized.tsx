import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { ROLE_HOME, ROLE_LABELS } from "@/lib/auth/types";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const home = user ? ROLE_HOME[user.role] : "/login";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <ShieldAlert className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-foreground">Access denied</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {user
          ? `Your ${ROLE_LABELS[user.role]} account doesn't have permission to view this page.`
          : "You need to sign in to view this page."}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to={home}>Go to my dashboard</Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Switch account
        </Button>
      </div>
    </div>
  );
}
