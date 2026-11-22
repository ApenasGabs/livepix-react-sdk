import axios from "axios";
import {
  createAccountApi,
  createCurrenciesApi,
  createLivePix,
  createPaymentApi,
  createWalletApi,
  createWebhookApi,
  initDefaultLivePix,
} from "../../index";
import { ApiClient } from "../apiClient";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

type GlobalWithRuntime = typeof globalThis & {
  __LIVEPIX_RUNTIME__?: "browser" | "server";
};

const createMockApiClient = (): jest.Mocked<ApiClient> => ({
  requestWithAuth: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  getAccessToken: jest.fn(),
});

describe("Core LivePix v2 API Modules", () => {
  it("createAccountApi calls GET /v2/account", async () => {
    const apiClient = createMockApiClient();
    const account = {
      id: "acc_1",
      email: "creator@example.com",
      username: "apenasgabs",
      displayName: "Gabriel",
      avatar: null,
    };
    apiClient.get.mockResolvedValueOnce(account);

    const api = createAccountApi(apiClient);
    await expect(api.getAccount()).resolves.toEqual(account);
    expect(apiClient.get).toHaveBeenCalledWith("/v2/account");
  });

  it("createCurrenciesApi calls GET /v2/currencies", async () => {
    const apiClient = createMockApiClient();
    const currencies = [{ symbol: "BRL", minimumAmount: 100, decimals: 2 }];
    apiClient.get.mockResolvedValueOnce(currencies);

    const api = createCurrenciesApi(apiClient);
    await expect(api.getCurrencies()).resolves.toEqual(currencies);
    expect(apiClient.get).toHaveBeenCalledWith("/v2/currencies");
  });

  it("createPaymentApi covers createPayment, getPayments, and getPayment", async () => {
    const apiClient = createMockApiClient();
    const api = createPaymentApi(apiClient);

    const created = {
      redirectUrl: "https://livepix.gg/checkout/pay_1",
      reference: "ref_1",
    };
    apiClient.post.mockResolvedValueOnce(created);
    await expect(
      api.createPayment(1500, "BRL", "https://example.com/ok")
    ).resolves.toEqual(created);
    expect(apiClient.post).toHaveBeenCalledWith("/v2/payments", {
      amount: 1500,
      currency: "BRL",
      redirectUrl: "https://example.com/ok",
    });

    const list = [{ id: "pay_1", currency: "BRL", amount: 1500, proof: "E123" }];
    apiClient.get.mockResolvedValueOnce(list);
    await expect(api.getPayments()).resolves.toEqual(list);
    expect(apiClient.get).toHaveBeenCalledWith("/v2/payments");

    const single = { id: "pay_1", currency: "BRL", amount: 1500, proof: "E123" };
    apiClient.get.mockResolvedValueOnce(single);
    await expect(api.getPayment("pay_1")).resolves.toEqual(single);
    expect(apiClient.get).toHaveBeenLastCalledWith("/v2/payments/pay_1");
  });

  it("createWalletApi covers balance, transactions, and receivables", async () => {
    const apiClient = createMockApiClient();
    const api = createWalletApi(apiClient);

    const balances = [
      { currency: "BRL", balance: 5000, balanceHeld: 0, balancePending: 100 },
    ];
    apiClient.get.mockResolvedValueOnce(balances);
    await expect(api.getWalletBalance()).resolves.toEqual(balances);
    expect(apiClient.get).toHaveBeenCalledWith("/v2/wallet");

    const txs = [
      { proof: "E1", amount: 1000, balance: 5000, releaseAt: 0, timestamp: 1 },
    ];
    apiClient.get.mockResolvedValueOnce(txs);
    await expect(api.getWalletTransactions("BRL")).resolves.toEqual(txs);
    expect(apiClient.get).toHaveBeenLastCalledWith(
      "/v2/wallet/BRL/transactions"
    );

    apiClient.get.mockResolvedValueOnce(txs);
    await expect(api.getWalletReceivables("BRL")).resolves.toEqual(txs);
    expect(apiClient.get).toHaveBeenLastCalledWith(
      "/v2/wallet/BRL/receivables"
    );
  });

  it("createWebhookApi covers list, create, and delete", async () => {
    const apiClient = createMockApiClient();
    const api = createWebhookApi(apiClient);

    const hooks = [{ id: "wh_1", url: "https://example.com/hook" }];
    apiClient.get.mockResolvedValueOnce(hooks);
    await expect(api.getWebhooks()).resolves.toEqual(hooks);
    expect(apiClient.get).toHaveBeenCalledWith("/v2/webhooks");

    const created = { id: "wh_2", url: "https://example.com/hook2" };
    apiClient.post.mockResolvedValueOnce(created);
    await expect(
      api.createWebhook("https://example.com/hook2")
    ).resolves.toEqual(created);
    expect(apiClient.post).toHaveBeenCalledWith("/v2/webhooks", {
      url: "https://example.com/hook2",
    });

    apiClient.delete.mockResolvedValueOnce(undefined);
    await expect(api.deleteWebhook("wh_2")).resolves.toBeUndefined();
    expect(apiClient.delete).toHaveBeenCalledWith("/v2/webhooks/wh_2");
  });
});

describe("createLivePix & initDefaultLivePix", () => {
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

  it("throws descriptive error when credentials are missing", () => {
    (globalThis as GlobalWithRuntime).__LIVEPIX_RUNTIME__ = "server";
    const globalWithImportMeta = globalThis as typeof globalThis & {
      import?: { meta?: { env?: Record<string, string | undefined> } };
    };
    const prevViteClientId =
      globalWithImportMeta.import?.meta?.env?.VITE_LIVEPIX_CLIENT_ID;
    if (globalWithImportMeta.import?.meta?.env) {
      delete globalWithImportMeta.import.meta.env.VITE_LIVEPIX_CLIENT_ID;
    }
    delete process.env.LIVEPIX_CLIENT_ID;
    delete process.env.LIVEPIX_CLIENT_SECRET;
    delete process.env.VITE_LIVEPIX_CLIENT_ID;
    delete process.env.REACT_APP_LIVEPIX_CLIENT_ID;

    try {
      expect(() => createLivePix()).toThrow(
        /Credenciais da API não configuradas para uso Server-Side/i
      );
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

  it("warns when createLivePix is invoked in browser runtime", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    (globalThis as GlobalWithRuntime).__LIVEPIX_RUNTIME__ = "browser";

    const sdk = createLivePix("browser_id", "browser_secret");
    expect(sdk.account).toBeDefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[LivePix Security Warning] (createLivePix)")
    );

    warnSpy.mockRestore();
  });

  it("initDefaultLivePix creates SDK from server env vars", async () => {
    (globalThis as GlobalWithRuntime).__LIVEPIX_RUNTIME__ = "server";
    process.env.LIVEPIX_CLIENT_ID = "env_client_id";
    process.env.LIVEPIX_CLIENT_SECRET = "env_client_secret";

    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: "env_token", expires_in: 3600 },
    });
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: {
          id: "acc_env",
          email: "env@example.com",
          username: "envuser",
          displayName: "Env User",
          avatar: null,
        },
      },
    });

    const sdk = initDefaultLivePix();
    const account = await sdk.account.getAccount();
    expect(account.username).toBe("envuser");
  });
});
