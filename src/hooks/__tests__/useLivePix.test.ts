import { renderHook } from "@testing-library/react";
import axios from "axios";
import {
  getClientId,
  getClientSecret,
  hasValidCredentials,
} from "../../config";
import useLivePix, {
  assertSafeRedirectUrl,
  buildPublicDonationUrl,
  isSafeHttpUrl,
  resolveBffPaymentEndpoint,
} from "../useLivePix";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

type GlobalWithRuntime = typeof globalThis & {
  __LIVEPIX_RUNTIME__?: "browser" | "server";
};

describe("useLivePix & Dual Runtime Security", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, NODE_ENV: "test" };
    delete (globalThis as GlobalWithRuntime).__LIVEPIX_RUNTIME__;
  });

  afterAll(() => {
    process.env = originalEnv;
    delete (globalThis as GlobalWithRuntime).__LIVEPIX_RUNTIME__;
  });

  describe("Environment and Secret Isolation", () => {
    it("blocks VITE_LIVEPIX_CLIENT_SECRET in browser runtime and emits security warning", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      process.env.VITE_LIVEPIX_CLIENT_SECRET = "leaked_browser_secret";

      (globalThis as GlobalWithRuntime).__LIVEPIX_RUNTIME__ = "browser";
      const secret = getClientSecret();

      expect(secret).toBe("");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[LivePix Security Warning]")
      );

      warnSpy.mockRestore();
    });

    it("reads LIVEPIX_CLIENT_ID and LIVEPIX_CLIENT_SECRET in server runtime (Node.js)", () => {
      process.env.LIVEPIX_CLIENT_ID = "server_client_id";
      process.env.LIVEPIX_CLIENT_SECRET = "server_client_secret";

      (globalThis as GlobalWithRuntime).__LIVEPIX_RUNTIME__ = "server";

      expect(getClientId()).toBe("server_client_id");
      expect(getClientSecret()).toBe("server_client_secret");
    });

    it("does not fall back to LIVEPIX_CLIENT_ID in browser runtime", () => {
      const globalWithImportMeta = globalThis as typeof globalThis & {
        import?: { meta?: { env?: Record<string, string | undefined> } };
      };
      const prevViteClientId =
        globalWithImportMeta.import?.meta?.env?.VITE_LIVEPIX_CLIENT_ID;
      if (globalWithImportMeta.import?.meta?.env) {
        delete globalWithImportMeta.import.meta.env.VITE_LIVEPIX_CLIENT_ID;
      }
      delete process.env.VITE_LIVEPIX_CLIENT_ID;
      delete process.env.REACT_APP_LIVEPIX_CLIENT_ID;
      process.env.LIVEPIX_CLIENT_ID = "server_only_client_id";
      (globalThis as GlobalWithRuntime).__LIVEPIX_RUNTIME__ = "browser";

      try {
        expect(getClientId()).toBe("");
      } finally {
        if (
          globalWithImportMeta.import?.meta?.env &&
          prevViteClientId !== undefined
        ) {
          globalWithImportMeta.import.meta.env.VITE_LIVEPIX_CLIENT_ID =
            prevViteClientId;
        }
      }
    });
  });

  describe("URL & Endpoint Helpers", () => {
    it("resolves BFF paymentEndpoint and proxyUrl properly", () => {
      expect(resolveBffPaymentEndpoint("/api/pay", "/proxy")).toBe("/api/pay");
      expect(resolveBffPaymentEndpoint(undefined, "/api/livepix/")).toBe(
        "/api/livepix/payments"
      );
      expect(resolveBffPaymentEndpoint(undefined, "/api/livepix/payments")).toBe(
        "/api/livepix/payments"
      );
    });

    it("builds public donation URL from username or redirectUrl", () => {
      expect(buildPublicDonationUrl("@criador")).toBe(
        "https://livepix.gg/criador"
      );
      expect(
        buildPublicDonationUrl(undefined, "https://livepix.gg/checkout/123")
      ).toBe("https://livepix.gg/checkout/123");
      expect(
        buildPublicDonationUrl(undefined, "javascript:alert(1)")
      ).toBe("");
      expect(isSafeHttpUrl("https://livepix.gg/checkout/123")).toBe(true);
      expect(isSafeHttpUrl("http://localhost:3000/pay")).toBe(true);
      expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
      expect(isSafeHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(
        false
      );
      expect(() => assertSafeRedirectUrl("javascript:alert(1)")).toThrow(
        /protocolo de url de redirecionamento não permitido/i
      );
      expect(() => assertSafeRedirectUrl("not-a-valid-url")).toThrow(
        /url de redirecionamento inválida/i
      );
      expect(isSafeHttpUrl("")).toBe(false);
      expect(isSafeHttpUrl("   ")).toBe(false);
      expect(isSafeHttpUrl("not-a-valid-url")).toBe(false);
      expect(buildPublicDonationUrl("@")).toBe("");
      expect(resolveBffPaymentEndpoint()).toBe("");
    });

    it("validates credentials per runtime in hasValidCredentials", () => {
      const globalWithImportMeta = globalThis as typeof globalThis & {
        import?: { meta?: { env?: Record<string, string | undefined> } };
      };
      const prevViteClientId =
        globalWithImportMeta.import?.meta?.env?.VITE_LIVEPIX_CLIENT_ID;

      (globalThis as GlobalWithRuntime).__LIVEPIX_RUNTIME__ = "browser";
      expect(hasValidCredentials()).toBe(false);
      process.env.VITE_LIVEPIX_USERNAME = "apenasgabs";
      expect(hasValidCredentials()).toBe(true);
      delete process.env.VITE_LIVEPIX_USERNAME;

      (globalThis as GlobalWithRuntime).__LIVEPIX_RUNTIME__ = "server";
      process.env.LIVEPIX_CLIENT_ID = "seu_client_id_aqui";
      process.env.LIVEPIX_CLIENT_SECRET = "seu_client_secret_aqui";
      expect(hasValidCredentials()).toBe(false);

      process.env.LIVEPIX_CLIENT_ID = "real_id";
      process.env.LIVEPIX_CLIENT_SECRET = "real_secret";
      expect(hasValidCredentials()).toBe(true);

      if (
        globalWithImportMeta.import?.meta?.env &&
        prevViteClientId !== undefined
      ) {
        globalWithImportMeta.import.meta.env.VITE_LIVEPIX_CLIENT_ID =
          prevViteClientId;
      }
    });
  });

  describe("useLivePix Hook", () => {
    it("initializes in BFF mode and creates payment via backend endpoint", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            redirectUrl: "https://livepix.gg/checkout/hook-bff",
            reference: "ref_hook_1",
          },
        },
      });

      const { result } = renderHook(() =>
        useLivePix({ paymentEndpoint: "/api/livepix/payments" })
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.livePix?.mode).toBe("bff");

      const payment = await result.current.createPayment(
        2500,
        "BRL",
        "https://example.com/ok"
      );

      expect(payment).toEqual({
        redirectUrl: "https://livepix.gg/checkout/hook-bff",
        reference: "ref_hook_1",
      });
      expect(mockedAxios.post).toHaveBeenCalledWith("/api/livepix/payments", {
        amount: 2500,
        currency: "BRL",
        redirectUrl: "https://example.com/ok",
      });
    });

    it("initializes in public mode with username", async () => {
      const { result } = renderHook(() =>
        useLivePix({ username: "apenasgabs" })
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.livePix?.mode).toBe("public");
      expect(result.current.getPublicUrl()).toBe(
        "https://livepix.gg/apenasgabs"
      );

      const payment = await result.current.createPayment();
      expect(payment.redirectUrl).toBe("https://livepix.gg/apenasgabs");
    });

    it("rejects clientSecret in browser with security warning and error", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const { result } = renderHook(() =>
        useLivePix({
          clientId: "bad-id",
          clientSecret: "bad-secret",
        })
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[LivePix Security Warning]")
      );
      expect(result.current.livePix).toBeNull();
      expect(result.current.error?.message).toMatch(/clientSecret não é permitido/i);

      warnSpy.mockRestore();
    });

    it("rejects unsafe non-HTTP(S) redirectUrl returned by BFF", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          redirectUrl: "javascript:alert('xss')",
          reference: "ref_xss",
        },
      });

      const { result } = renderHook(() =>
        useLivePix({ paymentEndpoint: "/api/livepix/payments" })
      );

      await expect(result.current.createPayment(1500)).rejects.toThrow(
        /protocolo de url de redirecionamento não permitido/i
      );
    });

    it("throws when BFF response omits redirectUrl", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          reference: "ref_missing_url",
        },
      });

      const { result } = renderHook(() =>
        useLivePix({ paymentEndpoint: "/api/livepix/payments" })
      );

      await expect(result.current.createPayment(1500)).rejects.toThrow(
        /URL de redirecionamento não retornada pelo servidor/i
      );
    });

    it("supports public mode via redirectUrl alone and delegates livePix.payments.createPayment", async () => {
      const { result } = renderHook(() =>
        useLivePix({ redirectUrl: "https://livepix.gg/checkout/direct" })
      );

      expect(result.current.livePix?.mode).toBe("public");
      expect(result.current.livePix?.getPublicUrl()).toBe(
        "https://livepix.gg/checkout/direct"
      );

      const payment = await result.current.livePix?.payments.createPayment();
      expect(payment).toEqual({
        redirectUrl: "https://livepix.gg/checkout/direct",
        reference: "public_redirect",
      });
    });

    it("sets error and throws on createPayment when completely unconfigured", async () => {
      const { result } = renderHook(() => useLivePix());

      expect(result.current.loading).toBe(false);
      expect(result.current.livePix).toBeNull();
      expect(result.current.getPublicUrl()).toBeNull();
      expect(result.current.error?.message).toMatch(
        /Configuração do LivePix não encontrada/i
      );

      await expect(result.current.createPayment()).rejects.toThrow(
        /Configuração do LivePix ausente no cliente/i
      );
    });
  });
});
