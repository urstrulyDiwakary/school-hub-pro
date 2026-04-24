import { expect, type Mock } from "vitest";

/**
 * Shared helpers for asserting export toast behavior across CSV / PDF /
 * fallback flows. Centralizing the message strings keeps tests in lockstep
 * with the user-visible copy, so a single typo update only needs one edit.
 */

export interface ToastSpies {
  success: Mock;
  warning: Mock;
  error: Mock;
}

export const EXPORT_TOAST_MESSAGES = {
  csvSuccess: "CSV downloaded",
  csvFailure: "Failed to generate CSV",
  pdfSuccess: "PDF downloaded",
  pdfFallbackWarning: "PDF generation failed — downloaded HTML report as fallback",
  pdfHardFailure: "Failed to generate report",
} as const;

export type ExportToastKind = keyof typeof EXPORT_TOAST_MESSAGES;

const KIND_TO_LEVEL: Record<ExportToastKind, keyof ToastSpies> = {
  csvSuccess: "success",
  csvFailure: "error",
  pdfSuccess: "success",
  pdfFallbackWarning: "warning",
  pdfHardFailure: "error",
};

/**
 * Assert that EXACTLY ONE toast of the given kind was emitted, with the
 * canonical message, and no other toast levels fired.
 */
export function expectExportToast(toast: ToastSpies, kind: ExportToastKind) {
  const level = KIND_TO_LEVEL[kind];
  const message = EXPORT_TOAST_MESSAGES[kind];

  expect(toast[level], `expected toast.${level}("${message}")`).toHaveBeenCalledWith(message);
  expect(toast[level]).toHaveBeenCalledTimes(1);

  // Ensure no other level fired — keeps tests strict against drift.
  (Object.keys(toast) as Array<keyof ToastSpies>).forEach((other) => {
    if (other !== level) {
      expect(toast[other], `unexpected toast.${other} call`).not.toHaveBeenCalled();
    }
  });
}

/** Assert no toast of any level was emitted (e.g. blocked actions). */
export function expectNoExportToast(toast: ToastSpies) {
  expect(toast.success).not.toHaveBeenCalled();
  expect(toast.warning).not.toHaveBeenCalled();
  expect(toast.error).not.toHaveBeenCalled();
}
