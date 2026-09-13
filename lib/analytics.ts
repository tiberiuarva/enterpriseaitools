/**
 * Consent-gated Google Analytics 4 wiring.
 *
 * The measurement ID is never hardcoded: it is injected at build time from
 * `NEXT_PUBLIC_GA_MEASUREMENT_ID`. When the variable is absent (local builds,
 * forks, preview builds) `measurementId` resolves to `null` and the site ships
 * with no analytics and no consent banner at all.
 *
 * Nothing from googletagmanager.com is requested until a visitor actively
 * accepts. Declining, or ignoring the banner, means zero third-party requests —
 * which is what keeps the privacy claims on /privacy literally true.
 */

export const ANALYTICS_CONSENT_STORAGE_KEY = "enterpriseai.tools-analytics-consent";

/** Window event that re-opens the banner so a choice can be withdrawn. */
export const ANALYTICS_CONSENT_EVENT = "enterpriseai.tools:open-consent";

export type ConsentChoice = "granted" | "denied";
export type ConsentState = ConsentChoice | "unknown";

// GA4 measurement IDs are `G-` followed by an uppercase alphanumeric token.
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,}$/;

/**
 * Accepts a raw environment value and returns a usable GA4 measurement ID, or
 * `null` when unset or malformed. A typo disables analytics rather than
 * emitting a broken tag.
 */
export function normalizeMeasurementId(value: string | undefined | null): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return MEASUREMENT_ID_PATTERN.test(trimmed) ? trimmed : null;
}

/**
 * Next.js only inlines `NEXT_PUBLIC_*` for static member reads, so this must
 * stay a direct `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` reference — a
 * dynamic lookup would silently resolve to `undefined` in the browser bundle.
 */
export const measurementId = normalizeMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

/** Narrows an untrusted stored value to a consent state. */
export function parseConsent(value: string | null | undefined): ConsentState {
  return value === "granted" || value === "denied" ? value : "unknown";
}

/**
 * Consent lives in the visitor's own browser and nowhere else. Every accessor
 * is wrapped: private browsing and storage-blocking extensions make these
 * throw, and the correct fallback is always "undecided", never "granted".
 *
 * These touch `localStorage` only when called, so importing this module stays
 * free of side effects and safe at build time.
 */
export function readStoredConsent(): ConsentState {
  try {
    return parseConsent(globalThis.localStorage?.getItem(ANALYTICS_CONSENT_STORAGE_KEY));
  } catch {
    return "unknown";
  }
}

export function storeConsent(choice: ConsentChoice): void {
  try {
    globalThis.localStorage?.setItem(ANALYTICS_CONSENT_STORAGE_KEY, choice);
  } catch {
    // The choice still applies to this page view; it just cannot be remembered.
  }
}

export function clearStoredConsent(): void {
  try {
    globalThis.localStorage?.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

export function gtagScriptSrc(id: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
}

/**
 * The gtag bootstrap, run only after consent is granted.
 *
 * Consent Mode v2 defaults are declared before `config` so the advertising
 * signals stay denied permanently — this site runs no ads and collects no
 * advertising identifiers. Only `analytics_storage` is granted.
 */
export function buildGtagInitScript(id: string): string {
  return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'granted'});
gtag('js', new Date());
gtag('config', '${id}');`;
}
