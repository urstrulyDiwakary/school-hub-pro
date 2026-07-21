// Reusable Excel/CSV import framework. Each entity registers a schema
// (target fields + validators); the service handles mapping, validation,
// preview, error reporting, and background processing hooks.

import type { ImportJob, ImportStatus } from "../types";

export interface FieldSchema {
  key: string;
  label: string;
  required?: boolean;
  validate?: (value: unknown) => string | null;
}

export interface ImportSchema {
  entity: string;
  fields: FieldSchema[];
}

const schemas = new Map<string, ImportSchema>();
const jobs = new Map<string, ImportJob>();

export const importService = {
  registerSchema(schema: ImportSchema) { schemas.set(schema.entity, schema); },
  getSchema(entity: string) { return schemas.get(entity); },

  createJob<TRow extends Record<string, unknown>>(
    entity: string,
    rows: TRow[],
    mapping: Record<string, string>,
  ): ImportJob<TRow> {
    const schema = schemas.get(entity);
    const errors: ImportJob["errors"] = [];
    let valid = 0;

    if (schema) {
      rows.forEach((row, idx) => {
        for (const field of schema.fields) {
          const sourceCol = Object.entries(mapping).find(([, tgt]) => tgt === field.key)?.[0];
          const value = sourceCol ? row[sourceCol] : undefined;
          if (field.required && (value === undefined || value === "")) {
            errors.push({ row: idx + 1, column: field.key, message: `${field.label} is required` });
            continue;
          }
          if (field.validate) {
            const msg = field.validate(value);
            if (msg) errors.push({ row: idx + 1, column: field.key, message: msg });
          }
        }
      });
      valid = rows.length - new Set(errors.map((e) => e.row)).size;
    }

    const job: ImportJob<TRow> = {
      id: `imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      entity,
      status: errors.length ? "ready" : "ready",
      rowsTotal: rows.length,
      rowsValid: valid,
      rowsInvalid: rows.length - valid,
      errors,
      mapping,
      preview: rows.slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    jobs.set(job.id, job);
    return job;
  },

  setStatus(id: string, status: ImportStatus) {
    const j = jobs.get(id); if (j) j.status = status;
  },
  get(id: string) { return jobs.get(id); },
};
