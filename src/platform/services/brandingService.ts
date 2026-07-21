// Branding engine. Applies a tenant/campus BrandingConfig to the
// document root by writing CSS variables that Tailwind's HSL tokens
// already consume. Everything is one-way — the DOM is a projection
// of tenant state.

import type { BrandingConfig } from "../types";

export const brandingService = {
  apply(cfg: BrandingConfig) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--primary", cfg.primaryColor);
    root.style.setProperty("--secondary", cfg.secondaryColor);
    if (cfg.fontFamily) root.style.setProperty("--app-font", cfg.fontFamily);
    if (cfg.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = cfg.faviconUrl;
    }
    document.title = cfg.schoolName;
  },
  merge(base: BrandingConfig, override?: Partial<BrandingConfig>): BrandingConfig {
    return { ...base, ...(override ?? {}) };
  },
};
