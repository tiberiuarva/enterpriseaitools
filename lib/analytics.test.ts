import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  buildGtagInitScript,
  clearStoredConsent,
  gtagScriptSrc,
  normalizeMeasurementId,
  parseConsent,
  readStoredConsent,
  storeConsent,
} from "./analytics.ts";

describe("normalizeMeasurementId", () => {
  it("accepts a well-formed GA4 measurement ID", () => {
    assert.equal(normalizeMeasurementId("G-JR4SJGCHKF"), "G-JR4SJGCHKF");
  });

  it("trims surrounding whitespace", () => {
    assert.equal(normalizeMeasurementId("  G-ABCD1234  "), "G-ABCD1234");
  });

  it("returns null when the variable is unset or blank", () => {
    assert.equal(normalizeMeasurementId(undefined), null);
    assert.equal(normalizeMeasurementId(null), null);
    assert.equal(normalizeMeasurementId(""), null);
    assert.equal(normalizeMeasurementId("   "), null);
  });

  it("rejects malformed IDs rather than emitting a broken tag", () => {
    assert.equal(normalizeMeasurementId("UA-12345-1"), null);
    assert.equal(normalizeMeasurementId("GTM-ABCD12"), null);
    assert.equal(normalizeMeasurementId("g-abcd1234"), null);
    assert.equal(normalizeMeasurementId("G-AB"), null);
    assert.equal(normalizeMeasurementId("G-ABCD1234'});evil()"), null);
  });
});

describe("parseConsent", () => {
  it("narrows the two valid stored choices", () => {
    assert.equal(parseConsent("granted"), "granted");
    assert.equal(parseConsent("denied"), "denied");
  });

  it("treats anything else as an undecided visitor", () => {
    assert.equal(parseConsent(null), "unknown");
    assert.equal(parseConsent(undefined), "unknown");
    assert.equal(parseConsent(""), "unknown");
    assert.equal(parseConsent("true"), "unknown");
    assert.equal(parseConsent("GRANTED"), "unknown");
  });
});

describe("gtagScriptSrc", () => {
  it("points at the gtag.js endpoint for the given ID", () => {
    assert.equal(
      gtagScriptSrc("G-JR4SJGCHKF"),
      "https://www.googletagmanager.com/gtag/js?id=G-JR4SJGCHKF",
    );
  });
});

describe("buildGtagInitScript", () => {
  it("configures the given measurement ID", () => {
    const script = buildGtagInitScript("G-JR4SJGCHKF");
    assert.match(script, /gtag\('config', 'G-JR4SJGCHKF'\);/);
    assert.match(script, /gtag\('js', new Date\(\)\);/);
  });

  it("keeps every advertising consent signal denied", () => {
    const script = buildGtagInitScript("G-JR4SJGCHKF");
    assert.match(script, /'ad_storage':'denied'/);
    assert.match(script, /'ad_user_data':'denied'/);
    assert.match(script, /'ad_personalization':'denied'/);
    assert.match(script, /'analytics_storage':'granted'/);
  });
});

describe("consent storage", () => {
  function withFakeStorage(run: (store: Map<string, string>) => void, broken = false) {
    const store = new Map<string, string>();
    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

    const fake = {
      getItem: (key: string) => (broken ? raise() : (store.get(key) ?? null)),
      setItem: (key: string, value: string) => (broken ? raise() : void store.set(key, value)),
      removeItem: (key: string) => (broken ? raise() : void store.delete(key)),
    };

    function raise(): never {
      throw new Error("storage blocked");
    }

    Object.defineProperty(globalThis, "localStorage", { value: fake, configurable: true });

    try {
      run(store);
    } finally {
      if (original) {
        Object.defineProperty(globalThis, "localStorage", original);
      } else {
        Reflect.deleteProperty(globalThis, "localStorage");
      }
    }
  }

  it("round-trips a stored choice", () => {
    withFakeStorage(() => {
      assert.equal(readStoredConsent(), "unknown");
      storeConsent("granted");
      assert.equal(readStoredConsent(), "granted");
      storeConsent("denied");
      assert.equal(readStoredConsent(), "denied");
      clearStoredConsent();
      assert.equal(readStoredConsent(), "unknown");
    });
  });

  it("writes under the documented key", () => {
    withFakeStorage((store) => {
      storeConsent("granted");
      assert.equal(store.get(ANALYTICS_CONSENT_STORAGE_KEY), "granted");
    });
  });

  it("falls back to undecided when storage throws", () => {
    withFakeStorage(() => {
      assert.equal(readStoredConsent(), "unknown");
      // Must not throw — a blocked-storage browser still has to render.
      storeConsent("granted");
      clearStoredConsent();
      assert.equal(readStoredConsent(), "unknown");
    }, true);
  });

  it("treats a missing storage API as undecided", () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    Reflect.deleteProperty(globalThis, "localStorage");

    try {
      assert.equal(readStoredConsent(), "unknown");
      storeConsent("granted");
      assert.equal(readStoredConsent(), "unknown");
    } finally {
      if (original) {
        Object.defineProperty(globalThis, "localStorage", original);
      }
    }
  });
});
