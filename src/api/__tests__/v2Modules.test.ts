import axios from "axios";
import {
  createAlertsApi,
  createControlsApi,
  createLivePix,
  createMessagesApi,
  createRewardsApi,
  createSubscriptionPlansApi,
  createSubscriptionsApi,
} from "../../index";
import { buildQueryPath } from "../../utils/url";
import { ApiClient } from "../apiClient";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const createMockApiClient = (): jest.Mocked<ApiClient> => ({
  requestWithAuth: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  getAccessToken: jest.fn(),
});

describe("buildQueryPath", () => {
  it("returns basePath when params are omitted or all undefined/null", () => {
    expect(buildQueryPath("/v2/messages")).toBe("/v2/messages");
    expect(
      buildQueryPath("/v2/messages", {
        proof: undefined,
        reference: null,
      })
    ).toBe("/v2/messages");
  });

  it("serializes defined query parameters in order", () => {
    expect(
      buildQueryPath("/v2/subscriptions", {
        status: "active",
        currency: "BRL",
        page: 2,
        limit: 10,
        ignored: undefined,
      })
    ).toBe("/v2/subscriptions?status=active&currency=BRL&page=2&limit=10");
  });
});

describe("createMessagesApi (/v2/messages)", () => {
  it("calls GET /v2/messages with and without query params", async () => {
    const apiClient = createMockApiClient();
    const messages = [
      {
        id: "msg_1",
        proof: "E123",
        reference: "ref_1",
        username: "Harry",
        message: "Olá!",
        amount: 1000,
        currency: "BRL",
        flagged: false,
        createdAt: "2026-11-16T00:00:00-03:00",
      },
    ];
    apiClient.get.mockResolvedValue(messages);

    const api = createMessagesApi(apiClient);
    await expect(api.getMessages()).resolves.toEqual(messages);
    expect(apiClient.get).toHaveBeenCalledWith("/v2/messages");

    await api.getMessages({
      proof: "E123",
      reference: "ref_1",
      currency: "BRL",
      page: 1,
      limit: 25,
    });
    expect(apiClient.get).toHaveBeenLastCalledWith(
      "/v2/messages?proof=E123&reference=ref_1&currency=BRL&page=1&limit=25"
    );
  });

  it("calls POST /v2/messages and GET /v2/messages/:messageId", async () => {
    const apiClient = createMockApiClient();
    const created = {
      reference: "ref_2",
      redirectUrl: "https://checkout.livepix.gg/ref_2",
    };
    apiClient.post.mockResolvedValueOnce(created);

    const api = createMessagesApi(apiClient);
    const input = {
      username: "harrypotter",
      message: "Ola!",
      amount: 1000,
      currency: "BRL",
      redirectUrl: "https://example.com/callback",
    };

    await expect(api.createMessage(input)).resolves.toEqual(created);
    expect(apiClient.post).toHaveBeenCalledWith("/v2/messages", input);

    await api.getMessage("msg/special");
    expect(apiClient.get).toHaveBeenCalledWith("/v2/messages/msg%2Fspecial");
  });
});

describe("createSubscriptionPlansApi (/v2/subscriptions/plans)", () => {
  it("covers list, create, get, update (PATCH) and delete", async () => {
    const apiClient = createMockApiClient();
    const api = createSubscriptionPlansApi(apiClient);

    apiClient.get.mockResolvedValueOnce([]);
    await api.getSubscriptionPlans();
    expect(apiClient.get).toHaveBeenCalledWith("/v2/subscriptions/plans");

    apiClient.get.mockResolvedValueOnce([]);
    await api.getSubscriptionPlans({ page: 2, limit: 5 });
    expect(apiClient.get).toHaveBeenLastCalledWith(
      "/v2/subscriptions/plans?page=2&limit=5"
    );

    const planInput = {
      slug: "basic",
      name: "Basic",
      description: "Plano básico",
      amount: 1000,
      currency: "BRL",
    };
    apiClient.post.mockResolvedValueOnce({ id: "plan_1" });
    await expect(api.createSubscriptionPlan(planInput)).resolves.toEqual({
      id: "plan_1",
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      "/v2/subscriptions/plans",
      planInput
    );

    apiClient.get.mockResolvedValueOnce({ id: "plan_1", ...planInput });
    await api.getSubscriptionPlan("plan_1");
    expect(apiClient.get).toHaveBeenLastCalledWith(
      "/v2/subscriptions/plans/plan_1"
    );

    apiClient.patch.mockResolvedValueOnce(undefined);
    await api.updateSubscriptionPlan("plan_1", { name: "Pro", amount: 2500 });
    expect(apiClient.patch).toHaveBeenCalledWith(
      "/v2/subscriptions/plans/plan_1",
      { name: "Pro", amount: 2500 }
    );

    apiClient.delete.mockResolvedValueOnce(undefined);
    await api.deleteSubscriptionPlan("plan_1");
    expect(apiClient.delete).toHaveBeenCalledWith(
      "/v2/subscriptions/plans/plan_1"
    );
  });
});

describe("createSubscriptionsApi (/v2/subscriptions)", () => {
  it("covers list, create, get and transactions", async () => {
    const apiClient = createMockApiClient();
    const api = createSubscriptionsApi(apiClient);

    apiClient.get.mockResolvedValueOnce([]);
    await api.getSubscriptions({
      status: "active",
      currency: "BRL",
      page: 1,
      limit: 20,
    });
    expect(apiClient.get).toHaveBeenCalledWith(
      "/v2/subscriptions?status=active&currency=BRL&page=1&limit=20"
    );

    const subInput = {
      planId: "plan_1",
      recurrence: "monthly" as const,
      subscriber: {
        username: "harrypotter",
        email: "harry@example.com",
      },
      redirectUrl: "https://example.com/callback",
    };
    apiClient.post.mockResolvedValueOnce({
      reference: "sub_ref",
      redirectUrl: "https://checkout.livepix.gg/sub_ref",
    });
    await api.createSubscription(subInput);
    expect(apiClient.post).toHaveBeenCalledWith("/v2/subscriptions", subInput);

    apiClient.get.mockResolvedValueOnce({ id: "sub_1" });
    await api.getSubscription("sub_1");
    expect(apiClient.get).toHaveBeenLastCalledWith("/v2/subscriptions/sub_1");

    apiClient.get.mockResolvedValueOnce([]);
    await api.getSubscriptionTransactions("sub_1", {
      proof: "E999",
      page: 1,
      limit: 10,
    });
    expect(apiClient.get).toHaveBeenLastCalledWith(
      "/v2/subscriptions/sub_1/transactions?proof=E999&page=1&limit=10"
    );
  });
});

describe("createRewardsApi (/v2/rewards)", () => {
  it("calls GET /v2/rewards and GET /v2/rewards/:rewardId/grants", async () => {
    const apiClient = createMockApiClient();
    const api = createRewardsApi(apiClient);

    apiClient.get.mockResolvedValueOnce([{ id: "rew_1", title: "VIP" }]);
    await expect(api.getRewards()).resolves.toEqual([
      { id: "rew_1", title: "VIP" },
    ]);
    expect(apiClient.get).toHaveBeenCalledWith("/v2/rewards");

    apiClient.get.mockResolvedValueOnce([{ id: "grant_1" }]);
    await expect(api.getRewardGrants("rew_1")).resolves.toEqual([
      { id: "grant_1" },
    ]);
    expect(apiClient.get).toHaveBeenLastCalledWith("/v2/rewards/rew_1/grants");
  });
});

describe("createControlsApi / createAlertsApi (/v2/controls)", () => {
  it("calls GET, PATCH, skip and replay on /v2/controls", async () => {
    const apiClient = createMockApiClient();
    const api = createControlsApi(apiClient);
    expect(createAlertsApi).toBe(createControlsApi);

    apiClient.get.mockResolvedValueOnce({ autoPlay: true });
    await expect(api.getControls()).resolves.toEqual({ autoPlay: true });
    expect(apiClient.get).toHaveBeenCalledWith("/v2/controls");

    apiClient.patch.mockResolvedValueOnce(undefined);
    await api.updateControls({ autoPlay: false });
    expect(apiClient.patch).toHaveBeenCalledWith("/v2/controls", {
      autoPlay: false,
    });

    apiClient.post.mockResolvedValue(undefined);
    await api.skipAlert();
    expect(apiClient.post).toHaveBeenCalledWith("/v2/controls/skip");

    await api.replayAlert();
    expect(apiClient.post).toHaveBeenLastCalledWith("/v2/controls/replay");
  });
});

describe("createLivePix integration with v2 modules", () => {
  const originalWarn = console.warn;

  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.warn = originalWarn;
  });

  it("exposes all v2 modules and unwraps { data: T } via axios", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: "token_v2",
        token_type: "Bearer",
        expires_in: 3600,
      },
    });
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: { autoPlay: true },
      },
    });

    const sdk = createLivePix("client_id", "client_secret");

    expect(sdk.messages).toBeDefined();
    expect(sdk.subscriptions).toBeDefined();
    expect(sdk.subscriptionPlans).toBeDefined();
    expect(sdk.rewards).toBeDefined();
    expect(sdk.controls).toBeDefined();
    expect(sdk.alerts).toBe(sdk.controls);

    const controlsState = await sdk.alerts.getControls();
    expect(controlsState).toEqual({ autoPlay: true });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.livepix.gg/v2/controls",
      {
        headers: { Authorization: "Bearer token_v2" },
      }
    );
  });
});
