/**
 * Lazy singleton Web Worker client for export jobs.
 *
 * Uses Vite's `?worker` import to bundle `exportWorker.ts` as a real Web
 * Worker entry in the browser. In test or SSR environments where Workers
 * are unavailable, `runInWorker` rejects fast so callers can fall back to
 * a synchronous main-thread build.
 */

import type { WorkerInbound, WorkerOutbound, WorkerStudentInput } from "./exportWorker";

let workerRef: Worker | null = null;
let workerInitFailed = false;
const handlers = new Map<string, (msg: WorkerOutbound) => void>();

async function getWorker(): Promise<Worker | null> {
  if (workerInitFailed) return null;
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;
  // Skip worker in test mode — jsdom's Worker stub doesn't actually load
  // module URLs, leaving postMessage promises pending forever.
  if (typeof import.meta !== "undefined" && (import.meta as ImportMeta & { env?: { MODE?: string } }).env?.MODE === "test") {
    workerInitFailed = true;
    return null;
  }
  if (workerRef) return workerRef;
  try {
    const mod = (await import("./exportWorker.ts?worker")) as { default: new () => Worker };
    workerRef = new mod.default();
    workerRef.onmessage = (e: MessageEvent<WorkerOutbound>) => {
      const cb = handlers.get(e.data.id);
      if (cb) cb(e.data);
    };
    return workerRef;
  } catch {
    workerInitFailed = true;
    return null;
  }
}

export interface RunWorkerOptions {
  kind: "csv" | "html";
  payload: WorkerStudentInput;
  onProgress?: (value: number, step?: string) => void;
  signal?: { cancelled: boolean };
}

export async function runInWorker(opts: RunWorkerOptions): Promise<string> {
  const worker = await getWorker();
  if (!worker) {
    throw new Error("Web Worker not available in this environment");
  }
  return new Promise<string>((resolve, reject) => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    handlers.set(id, (msg) => {
      if (opts.signal?.cancelled) {
        handlers.delete(id);
        reject(new Error("Cancelled by user"));
        return;
      }
      if (msg.type === "progress") {
        opts.onProgress?.(msg.value, msg.step);
      } else if (msg.type === "done") {
        handlers.delete(id);
        resolve(msg.result);
      } else if (msg.type === "error") {
        handlers.delete(id);
        reject(new Error(msg.message));
      }
    });
    const inbound: WorkerInbound = { id, kind: opts.kind, payload: opts.payload };
    worker.postMessage(inbound);
  });
}

export function disposeExportWorker() {
  workerRef?.terminate();
  workerRef = null;
  workerInitFailed = false;
  handlers.clear();
}
