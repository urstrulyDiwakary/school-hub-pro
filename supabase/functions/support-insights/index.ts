import { createOpenAI } from "npm:@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "npm:ai";
import { z } from "npm:zod";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};
const RUN = "X-Lovable-AIG-Run-ID";
const MODEL = "openai/gpt-6-astra";

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, ...extra, "Content-Type": "application/json" } });

const risk = z.enum(["high", "medium", "low"]);
const schema = z.object({
  summary: z.string(),
  flagged: z.array(
    z.object({
      studentId: z.string(),
      studentName: z.string(),
      rollNo: z.string(),
      risk,
      percentage: z.number(),
      weakSubjects: z.array(z.string()),
      reasons: z.array(z.string()),
      suggestion: z.string(),
    }),
  ),
  interventions: z.array(
    z.object({ title: z.string(), focus: z.string(), detail: z.string(), priority: risk }),
  ),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured." }, 500);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  if (!Array.isArray(body?.students) || body.students.length === 0 || body.students.length > 200) {
    return json({ error: "Provide between 1 and 200 students." }, 400);
  }

  let runId = req.headers.get(RUN)?.trim() || undefined;
  let upstreamStatus = 0;
  let upstreamMessage = "";
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN)?.trim() || undefined;
      if (!res.ok) {
        upstreamStatus = res.status;
        upstreamMessage = await res.clone().text().catch(() => "");
      }
      return res;
    },
  });

  const system = `You are an experienced Indian school academic counsellor. Given exam marks and attendance for one class, identify students who may need academic support and suggest practical class-level interventions.
Rules:
- Passing threshold is ${Number(body.passingPercent) || 33}% per subject.
- Flag only students at high or medium risk (use "low" only if clearly borderline). Use the exact studentId, studentName and rollNo given.
- percentage = overall marks percentage rounded to 1 decimal.
- reasons: 1-3 short factual bullets. suggestion: one concrete, supportive action (no labels or blame).
- interventions: 2-5 class-wide actions with priority.
- summary: one sentence.
Keep all text concise.`;

  const result = streamText({
    model: provider.responses(MODEL),
    system,
    prompt: JSON.stringify({ exam: body.examName, class: body.className, students: body.students }),
    output: Output.object({ schema }),
    abortSignal: req.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    const output = await result.output;
    return json(output, 200, runId ? { [RUN]: runId } : {});
  } catch (e) {
    if (req.signal.aborted) return json({ error: "Request cancelled." }, 499);
    if (upstreamStatus) {
      let message = "";
      try {
        const p = JSON.parse(upstreamMessage);
        message = p?.message ?? p?.error?.message ?? "";
      } catch { /* ignore */ }
      console.error("gateway error", upstreamStatus, upstreamMessage.slice(0, 500));
      const fallback =
        upstreamStatus === 402 ? "AI credits are exhausted. Please add credits to continue."
        : upstreamStatus === 429 ? "Too many requests right now. Please try again in a minute."
        : "AI analysis failed.";
      return json({ error: message || fallback, message: message || fallback }, upstreamStatus);
    }
    if (NoObjectGeneratedError.isInstance(e)) {
      console.error("no object", e.text?.slice(0, 500));
      return json({ error: "The AI returned an unexpected format. Please try again." }, 502);
    }
    console.error(e);
    return json({ error: "AI analysis failed." }, 500);
  }
});
