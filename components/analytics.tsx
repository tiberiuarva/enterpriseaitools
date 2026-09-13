"use client";

import Script from "next/script";
import { useCallback, useSyncExternalStore } from "react";
import {
  ANALYTICS_CONSENT_EVENT,
  buildGtagInitScript,
  gtagScriptSrc,
  measurementId,
  readStoredConsent,
  storeConsent,
  type ConsentChoice,
  type ConsentState,
} from "@/lib/analytics";
import { withBasePath } from "@/lib/site";

/**
 * `"ssr"` marks the server-rendered pass. Returning a distinct snapshot there
 * keeps the consent banner out of the exported HTML entirely — it must never be
 * crawled as page content, and it must not flash for a visitor who already
 * answered. React swaps to the real browser snapshot right after hydration.
 */
type ConsentSnapshot = ConsentState | "ssr";

function subscribe(onStoreChange: () => void) {
  // The in-page event covers the "change my mind" control; `storage` covers the
  // same site open in another tab.
  window.addEventListener(ANALYTICS_CONSENT_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(ANALYTICS_CONSENT_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): ConsentSnapshot {
  return readStoredConsent();
}

function getServerSnapshot(): ConsentSnapshot {
  return "ssr";
}

const BUTTON_BASE =
  "rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";

export function Analytics() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const choose = useCallback((choice: ConsentChoice) => {
    storeConsent(choice);
    window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
  }, []);

  // No measurement ID configured for this build: no tag, no banner, nothing.
  if (!measurementId || consent === "ssr" || consent === "denied") {
    return null;
  }

  if (consent === "granted") {
    return (
      <>
        <Script id="ga-consent-init" strategy="afterInteractive">
          {buildGtagInitScript(measurementId)}
        </Script>
        <Script src={gtagScriptSrc(measurementId)} strategy="afterInteractive" />
      </>
    );
  }

  return (
    <div
      role="dialog"
      aria-labelledby="analytics-consent-heading"
      aria-describedby="analytics-consent-body"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="card-flat mx-auto flex max-w-3xl flex-col gap-3 p-4 shadow-lg sm:p-5">
        <div>
          <h2
            id="analytics-consent-heading"
            className="text-sm font-semibold text-[var(--color-text-primary)]"
          >
            Analytics cookies
          </h2>
          <p
            id="analytics-consent-body"
            className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]"
          >
            We would like to use Google Analytics to count page views and see which comparisons are
            useful. Nothing is loaded and no cookie is set unless you accept. No advertising, no
            profiling, no data sold.{" "}
            <a
              href={withBasePath("/privacy")}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              Read the privacy note
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose("granted")}
            className={`${BUTTON_BASE} border border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-strong)]`}
          >
            Accept analytics
          </button>
          <button
            type="button"
            onClick={() => choose("denied")}
            className={`${BUTTON_BASE} border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]`}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
