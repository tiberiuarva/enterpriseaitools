import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  buildGtagInitScript,
  clearAnalyticsCookies,
  clearStoredConsent,
  gaDisableFlag,
  gtagScriptSrc,
  normalizeMeasurementId,
  parseConsent,
  readStoredConsent,
  reinstateAnalytics,
  revokeAnalytics,
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

  it("starts undecided and keeps the answer when storage throws", () => {
    withFakeStorage(() => {
      clearStoredConsent();
      assert.equal(readStoredConsent(), "unknown");

      // Storage is blocked, so the write cannot persist — but the choice must
      // still apply to this page view, or the banner buttons look inert and the
      // visitor can neither accept nor dismiss it.
      storeConsent("granted");
      assert.equal(readStoredConsent(), "granted");

      storeConsent("denied");
      assert.equal(readStoredConsent(), "denied");

      clearStoredConsent();
      assert.equal(readStoredConsent(), "unknown");
    }, true);
  });

  it("keeps the answer when the storage API is missing entirely", () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    Reflect.deleteProperty(globalThis, "localStorage");

    try {
      clearStoredConsent();
      assert.equal(readStoredConsent(), "unknown");
      storeConsent("granted");
      assert.equal(readStoredConsent(), "granted");
    } finally {
      clearStoredConsent();
      if (original) {
        Object.defineProperty(globalThis, "localStorage", original);
      }
    }
  });

  it("lets a readable stored value win, so another tab's choice propagates", () => {
    withFakeStorage((store) => {
      storeConsent("denied");
      store.set(ANALYTICS_CONSENT_STORAGE_KEY, "granted");
      assert.equal(readStoredConsent(), "granted");
      clearStoredConsent();
    });
  });
});

describe("withdrawing analytics", () => {
  const ID = "G-JR4SJGCHKF";

  function withFakeDocument(run: (calls: unknown[][], cookieWrites: string[]) => void) {
    const calls: unknown[][] = [];
    const cookieWrites: string[] = [];
    const saved = ["gtag", "document", "location", gaDisableFlag(ID)].map(
      (key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const,
    );

    Object.defineProperty(globalThis, "gtag", {
      value: (...args: unknown[]) => calls.push(args),
      configurable: true,
    });
    Object.defineProperty(globalThis, "document", {
      value: {
        get cookie() {
          return "_ga=GA1.1.x; _ga_JR4SJGCHKF=GS1.1.y; theme=dark";
        },
        set cookie(value: string) {
          cookieWrites.push(value);
        },
      },
      configurable: true,
    });
    Object.defineProperty(globalThis, "location", {
      value: { hostname: "www.enterpriseai.tools" },
      configurable: true,
    });

    try {
      run(calls, cookieWrites);
    } finally {
      for (const [key, descriptor] of saved) {
        if (descriptor) {
          Object.defineProperty(globalThis, key, descriptor);
        } else {
          Reflect.deleteProperty(globalThis, key);
        }
      }
    }
  }

  it("sets GA's kill switch and denies the consent signal", () => {
    withFakeDocument((calls) => {
      revokeAnalytics(ID);

      assert.equal((globalThis as Record<string, unknown>)[gaDisableFlag(ID)], true);
      assert.deepEqual(calls.at(0), [
        "consent",
        "update",
        { analytics_storage: "denied" },
      ]);
    });
  });

  it("expires only the GA cookies, across the host and its parent domain", () => {
    withFakeDocument((_calls, cookieWrites) => {
      revokeAnalytics(ID);

      assert.ok(cookieWrites.length > 0, "expected cookie writes");
      assert.ok(cookieWrites.every((write) => write.startsWith("_ga")), "touched a non-GA cookie");
      assert.ok(cookieWrites.some((write) => write.includes("domain=.enterpriseai.tools")));
      assert.ok(cookieWrites.every((write) => write.includes("Max-Age=0")));
      assert.ok(!cookieWrites.some((write) => write.startsWith("theme=")));
    });
  });

  it("re-enables analytics when the visitor accepts again", () => {
    withFakeDocument((calls) => {
      revokeAnalytics(ID);
      reinstateAnalytics(ID);

      assert.equal((globalThis as Record<string, unknown>)[gaDisableFlag(ID)], false);
      assert.deepEqual(calls.at(-1), [
        "consent",
        "update",
        { analytics_storage: "granted" },
      ]);
    });
  });

  it("is safe to call before gtag has ever loaded", () => {
    const saved = Object.getOwnPropertyDescriptor(globalThis, "gtag");
    Reflect.deleteProperty(globalThis, "gtag");

    try {
      assert.doesNotThrow(() => revokeAnalytics(ID));
      assert.doesNotThrow(() => reinstateAnalytics(ID));
      assert.doesNotThrow(() => clearAnalyticsCookies());
    } finally {
      if (saved) {
        Object.defineProperty(globalThis, "gtag", saved);
      }
    }
  });
});
