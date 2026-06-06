import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth";
import { ROLE_HOME, ROLE_LABELS, type Role } from "@/lib/auth/types";
import { demoCredentialsByRole } from "@/lib/auth/mockUsers";

const QUICK_ROLES: Role[] = [
  "super_admin",
  "school_admin",
  "teacher",
  "parent",
  "student",
  "accountant",
];

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolCode: "DEMO001",
    email: "",
    password: "",
  });

  const completeLogin = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const user = login(email, password);
    if (user) {
      toast({ title: "Welcome back!", description: `Signed in as ${ROLE_LABELS[user.role]}.` });
      navigate(ROLE_HOME[user.role], { replace: true });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Try a demo account below.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeLogin(formData.email, formData.password);
  };

  const quickLogin = (role: Role) => {
    const { email, password } = demoCredentialsByRole[role];
    setFormData((f) => ({ ...f, email, password }));
    completeLogin(email, password);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between bg-sidebar p-8 xl:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-primary">EduTrack Pro</span>
        </div>

        <div className="space-y-4 xl:space-y-6">
          <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold leading-tight text-sidebar-primary">
            Complete School
            <br />
            Management System
          </h1>
          <p className="max-w-lg text-base xl:text-lg text-sidebar-foreground">
            One platform for admins, teachers, accountants, parents and students — admissions to
            academics, fees to communication.
          </p>

          <div className="grid gap-3 xl:gap-4 pt-4 xl:pt-8 grid-cols-2">
            {[
              { label: "Student Management", value: "5000+" },
              { label: "Staff Records", value: "250+" },
              { label: "Fee Collection", value: "₹2Cr+" },
              { label: "Daily Reports", value: "100+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3 xl:p-4"
              >
                <p className="text-xl xl:text-2xl font-bold text-sidebar-primary">{stat.value}</p>
                <p className="text-xs xl:text-sm text-sidebar-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-sidebar-muted">© 2024 EduTrack Pro. All rights reserved.</p>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full items-center justify-center bg-background px-4 py-8 sm:px-6 lg:w-1/2 xl:w-[45%]">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">EduTrack Pro</span>
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolCode">School Code</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="schoolCode"
                  type="text"
                  placeholder="Enter school code"
                  className="pl-10"
                  value={formData.schoolCode}
                  onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@edutrack.in"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Quick demo role login */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Quick demo login</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ROLES.map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => quickLogin(role)}
                  className="justify-start"
                >
                  {ROLE_LABELS[role]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
