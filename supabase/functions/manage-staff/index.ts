// Lets the school admin create login accounts for teachers and the accounts office.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  fullName: z.string().trim().min(1).max(100),
  role: z.enum(["teacher", "accountant", "school_admin"]),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, service);

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ error: "Please sign in." }, 401);
  const { data: u, error: uErr } = await admin.auth.getUser(token);
  if (uErr || !u.user) return json({ error: "Please sign in." }, 401);
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "school_admin" });
  if (!isAdmin) return json({ error: "Only the school admin can add staff." }, 403);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Check the name, email and password (8+ characters)." }, 400);
  const { email, password, fullName, role } = parsed.data;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
    app_metadata: { staff_role: role },
  });
  if (error) return json({ error: error.message }, 400);
  return json({ id: data.user?.id, email });
});
