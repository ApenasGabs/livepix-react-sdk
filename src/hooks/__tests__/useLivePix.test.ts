import { renderHook } from "@testing-library/react";
import axios from "axios";
import { getClientId, getClientSecret } from "../../config";
import useLivePix, {
  buildPublicDonationUrl,
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
  });
});
