import "@testing-library/jest-dom";
import { beforeEach } from "vitest";

// Reset persisted export config/templates between tests so snapshot tests
// that rely on hardcoded defaults aren't polluted by other test files.
beforeEach(() => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("school-export-config:v1");
    window.localStorage.removeItem("export-templates:v1");
  }
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Radix UI uses Pointer Events APIs not implemented in jsdom
if (typeof window !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
