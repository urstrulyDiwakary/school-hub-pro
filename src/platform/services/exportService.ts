// Centralized export facade. Existing per-module export utilities
// (see `src/lib/export*`) remain the underlying workers; this service
// provides a single entry point that respects tenant + campus + AY
// context and enforces the `<entity>.export` permission upstream.

import type { ExportFormat, ExportRequest } from "../types";

export interface ExportResult {
  format: ExportFormat;
  filename: string;
  bytes: number;
  requestedAt: string;
}

type Handler = (req: ExportRequest) => Promise<ExportResult>;
const handlers = new Map<string, Handler>();

export const exportService = {
  register(entity: string, handler: Handler) { handlers.set(entity, handler); },
  async run(req: ExportRequest): Promise<ExportResult> {
    const handler = handlers.get(req.entity);
    if (!handler) {
      // Fallback stub — a real handler will wire in module-specific CSV/PDF/XLSX.
      return {
        format: req.format,
        filename: `${req.entity}.${req.format}`,
        bytes: 0,
        requestedAt: new Date().toISOString(),
      };
    }
    return handler(req);
  },
};
