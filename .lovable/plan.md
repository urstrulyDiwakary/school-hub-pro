# Parent and Student Live Portals

## What will change
- Expand the parent dashboard with live attendance, exam marks, school announcements, and an actionable list of pending items drawn from the parent's real school activity.
- Give linked students a read-only live view of parent–school message threads, while keeping replies available to parents and authorized staff.
- Keep the parent inbox online and live-updating, with message-level reply actions and staff replies visible to parents and linked students.
- Verify the real student journey: provision a student account, enter attendance and exam marks as school staff, and confirm the student sees the saved records and messages. Remove any temporary test data afterward.
- Securely collect the school's AI service URL and optional key, then connect Support Insights through the existing server-side proxy. Require a signed-in authorized staff account, keep credentials server-side, and stop silently substituting local rules when the service is unavailable.

## Implementation notes
- Extend existing role-aware portal pages, live data hooks, and message components.
- Apply the smallest additive database-policy/function change needed for linked students to read only their own related threads; do not grant students message-writing access.
- Use the secure secret-entry form for the existing `SUPPORT_INSIGHTS_API_URL` and optional `SUPPORT_INSIGHTS_API_KEY` settings; never place credentials in the page or browser code.
- Run the relevant tests, verify the student and parent flows in the preview, and check the latest build/console signals.
