// Centralized file/asset service. Today it wraps FileReader + object URLs;
// tomorrow it points at S3 / Supabase Storage / GCS. Consumers get a
// stable `StoredFile` regardless of backend.

import type { StoredFile, FileCategory, TenantID } from "../types";

const registry = new Map<string, StoredFile>();

export const fileService = {
  async upload(params: {
    tenantId: TenantID;
    category: FileCategory;
    file: File;
    uploadedBy: string;
  }): Promise<StoredFile> {
    const url = URL.createObjectURL(params.file);
    const record: StoredFile = {
      id: `fil_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tenantId: params.tenantId,
      category: params.category,
      name: params.file.name,
      mime: params.file.type,
      sizeBytes: params.file.size,
      url,
      uploadedBy: params.uploadedBy,
      uploadedAt: new Date().toISOString(),
    };
    registry.set(record.id, record);
    return record;
  },
  async get(id: string) { return registry.get(id) ?? null; },
  async remove(id: string) {
    const f = registry.get(id);
    if (f) URL.revokeObjectURL(f.url);
    registry.delete(id);
  },
  list(category?: FileCategory): StoredFile[] {
    const all = [...registry.values()];
    return category ? all.filter((f) => f.category === category) : all;
  },
};
