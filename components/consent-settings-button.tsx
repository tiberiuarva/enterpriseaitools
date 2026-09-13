"use client";

import { ANALYTICS_CONSENT_EVENT, clearStoredConsent, measurementId } from "@/lib/analytics";

/**
 * Footer control that re-opens the consent banner so a visitor can change or
 * withdraw a previous answer. Renders nothing when the build carries no
 * measurement ID, because then there is no choice to revisit.
 */
type ConsentSettingsButtonProps = {
  label?: string;
  className?: string;
};

const DEFAULT_CLASS =
  "text-left text-body-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";

export function ConsentSettingsButton({
  label = "Analytics cookie settings",
  className = DEFAULT_CLASS,
}: ConsentSettingsButtonProps) {
  if (!measurementId) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        // Drop the stored answer first so the banner re-opens undecided rather
        // than re-rendering the previous choice.
        clearStoredConsent();
        window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
      }}
      className={className}
    >
      {label}
    </button>
  );
}
