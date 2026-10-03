// Forwards the class marks to the school's own AI service.
// Secrets: SUPPORT_INSIGHTS_API_URL (required), SUPPORT_INSIGHTS_API_KEY (optional, sent as Bearer).
// The service must accept the same JSON body and return { summary, flagged[], interventions[] }.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPPORT_INSIGHTS_API_URL");
  if (!url) return json({ error: "not_configured", message: "Your AI service is not connected yet." }, 503);
  const key = Deno.env.get("SUPPORT_INSIGHTS_API_KEY");

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  if (!Array.isArray(body?.students) || body.students.length === 0 || body.students.length > 200) {
    return json({ error: "Provide between 1 and 200 students." }, 400);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
      body: JSON.stringify(body),
      signal: req.signal,
    });
    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { /* not json */ }
    if (!res.ok) {
      console.error("ai service error", res.status, text.slice(0, 500));
      const message = data?.message ?? data?.error ?? `Your AI service returned an error (${res.status}).`;
      return json({ error: message, message }, res.status);
    }
    if (!data || typeof data.summary !== "string" || !Array.isArray(data.flagged) || !Array.isArray(data.interventions)) {
      return json({ error: "Your AI service returned an unexpected format." }, 502);
    }
    return json({ summary: data.summary, flagged: data.flagged, interventions: data.interventions });
  } catch (e) {
    if (req.signal.aborted) return json({ error: "Request cancelled." }, 499);
    console.error(e);
    return json({ error: "Could not reach your AI service." }, 502);
  }
});
