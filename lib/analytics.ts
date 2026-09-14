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
 * The visitor's answer for this document, held in memory as well as in storage.
 *
 * Private browsing and storage-blocking extensions make every `localStorage`
 * call throw. Without this fallback the banner buttons are inert in exactly
 * those browsers: the write fails, the re-read returns "undecided", and the
 * banner never closes — so the visitor can neither accept nor dismiss it.
 */
let inDocumentConsent: ConsentState = "unknown";

/**
 * Consent lives in the visitor's own browser and nowhere else. A readable
 * stored value always wins, so a choice made in another tab still propagates;
 * the in-memory value only covers the case where storage cannot be read.
 *
 * These touch `localStorage` only when called, so importing this module stays
 * free of side effects and safe at build time.
 */
export function readStoredConsent(): ConsentState {
  try {
    const stored = parseConsent(globalThis.localStorage?.getItem(ANALYTICS_CONSENT_STORAGE_KEY));

    if (stored !== "unknown") {
      return stored;
    }
  } catch {
    // Storage unavailable — fall through to the in-document answer.
  }

  return inDocumentConsent;
}

export function storeConsent(choice: ConsentChoice): void {
  inDocumentConsent = choice;

  try {
    globalThis.localStorage?.setItem(ANALYTICS_CONSENT_STORAGE_KEY, choice);
  } catch {
    // The choice still applies to this page view; it just cannot be remembered.
  }
}

export function clearStoredConsent(): void {
  inDocumentConsent = "unknown";

  try {
    globalThis.localStorage?.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

// ── Withdrawal ───────────────────────────────────────────────────────────────
// Un-rendering the <Script> tags does not unload an already-executing gtag.js,
// reset its consent state, or remove its cookies. Withdrawal has to say so
// explicitly or analytics keeps running in the current document after the
// visitor opts out.

type GtagFunction = (...args: unknown[]) => void;

function getGtag(): GtagFunction | null {
  const candidate = (globalThis as { gtag?: unknown }).gtag;

  return typeof candidate === "function" ? (candidate as GtagFunction) : null;
}

/** GA's documented per-property kill switch: `window['ga-disable-G-…'] = true`. */
export function gaDisableFlag(id: string): string {
  return `ga-disable-${id}`;
}

const GA_COOKIE_PREFIX = "_ga";

/**
 * Expires every GA cookie this document can see. GA writes them on the
 * registrable domain, so clearing only the exact hostname would leave the
 * cookie alive; each parent domain is expired too.
 */
export function clearAnalyticsCookies(): void {
  const doc = (globalThis as { document?: { cookie: string } }).document;

  if (!doc) {
    return;
  }

  const names = doc.cookie
    .split(";")
    .map((entry) => entry.split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name) && name.startsWith(GA_COOKIE_PREFIX));

  if (names.length === 0) {
    return;
  }

  const hostname = (globalThis as { location?: { hostname?: string } }).location?.hostname ?? "";
  const domains = new Set<string>([""]);

  if (hostname) {
    domains.add(hostname);
    const labels = hostname.split(".");

    for (let index = 0; index < labels.length - 1; index += 1) {
      domains.add(`.${labels.slice(index).join(".")}`);
    }
  }

  for (const name of names) {
    for (const domain of domains) {
      doc.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

/** Stops analytics in the current document and removes what it already stored. */
export function revokeAnalytics(id: string): void {
  (globalThis as Record<string, unknown>)[gaDisableFlag(id)] = true;
  getGtag()?.("consent", "update", { analytics_storage: "denied" });
  clearAnalyticsCookies();
}

/**
 * Re-enables analytics after a withdrawal. Needed because `next/script` will
 * not re-execute a source it has already loaded, so a second acceptance in the
 * same document would otherwise stay disabled by the flag set above.
 */
export function reinstateAnalytics(id: string): void {
  (globalThis as Record<string, unknown>)[gaDisableFlag(id)] = false;
  getGtag()?.("consent", "update", { analytics_storage: "granted" });
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
