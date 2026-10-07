import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PENDING_CODE_KEY } from "@/services/schoolService";

export default function Signup() {
  const [params] = useSearchParams();
  const setupAdmin = params.get("setup") === "admin";
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", code: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (setupAdmin) supabase.rpc("school_has_admin").then(({ data }) => setHasAdmin(!!data));
  }, [setupAdmin]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (!setupAdmin && form.code.trim().length < 6) return setError("Enter the child code from the school.");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: form.name.trim(), ...(setupAdmin ? { setup_admin: "true" } : {}) },
      },
    });
    setBusy(false);
    if (error) return setError(error.message);
    if (!setupAdmin) localStorage.setItem(PENDING_CODE_KEY, form.code.trim().toUpperCase());
    setDone(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold">EduTrack Pro</span>
          </div>
          <CardTitle>{setupAdmin ? "Create the school admin account" : "Create a parent account"}</CardTitle>
        </CardHeader>
        <CardContent>
          {setupAdmin && hasAdmin ? (
            <p className="text-sm text-muted-foreground">
              Your school already has an admin. Ask them to add your staff account.{" "}
              <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
            </p>
          ) : done ? (
            <p className="text-sm text-muted-foreground">
              Check your email to confirm your account, then{" "}
              <Link to="/login" className="text-primary hover:underline">sign in</Link>.
              {!setupAdmin && " Your child will be linked the first time you sign in."}
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5"><Label htmlFor="su-name">Full name</Label>
                <Input id="su-name" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="su-email">Email</Label>
                <Input id="su-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="su-pw">Password</Label>
                <Input id="su-pw" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              {!setupAdmin && (
                <div className="space-y-1.5"><Label htmlFor="su-code">Child code (from the school)</Label>
                  <Input id="su-code" required maxLength={12} className="uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating..." : "Create account"}</Button>
              <p className="text-center text-sm text-muted-foreground">
                Have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
