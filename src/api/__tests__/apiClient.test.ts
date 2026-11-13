import axios from "axios";
import { createApiClient, unwrapResponse } from "../apiClient";
import { CONFIG } from "../../config";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("CONFIG - LivePix v2 Contracts", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, NODE_ENV: "test" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should have official LivePix v2 tokenUrl default", () => {
    delete process.env.VITE_LIVEPIX_TOKEN_URL;
    delete process.env.REACT_APP_LIVEPIX_TOKEN_URL;
    delete process.env.LIVEPIX_TOKEN_URL;
    expect(CONFIG.auth.tokenUrl()).toBe("https://oauth.livepix.gg/oauth2/token");
  });

  it("should have official LivePix v2 scope list default", () => {
    delete process.env.VITE_LIVEPIX_SCOPE;
    delete process.env.REACT_APP_LIVEPIX_SCOPE;
    delete process.env.LIVEPIX_SCOPE;
    const expectedScope =
      "payments:read payments:write offline account:read currencies:read rewards:read rewards:write messages:read messages:write subscriptions:read subscriptions:write subscription-plans:read subscription-plans:write wallet:read webhooks controls";
    expect(CONFIG.auth.scope()).toBe(expectedScope);
  });
});

describe("unwrapResponse", () => {
  it("should unwrap envelope { data: T }", () => {
    const raw = { data: { data: { id: "payment_123", amount: 1000 } } };
    expect(unwrapResponse(raw)).toEqual({ id: "payment_123", amount: 1000 });
  });

  it("should return direct data if no inner data envelope exists", () => {
    const raw = { data: { access_token: "token_abc" } };
    expect(unwrapResponse(raw)).toEqual({ access_token: "token_abc" });
  });

  it("should handle null or empty response body safely", () => {
    expect(unwrapResponse({ data: null })).toBeNull();
    expect(unwrapResponse({ data: undefined })).toBeUndefined();
  });
});

describe("apiClient", () => {
  const mockConfig = {
    clientId: "mock_client_id",
    clientSecret: "mock_client_secret",
    tokenUrl: "https://oauth.livepix.gg/oauth2/token",
    baseUrl: "https://api.livepix.gg",
    scope: "payments:read payments:write",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAccessToken with OAuth2 and urlencoded payload", () => {
    it("should request token using application/x-www-form-urlencoded and URLSearchParams", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: "mock_access_token_1",
          token_type: "Bearer",
          expires_in: 3600,
        },
      });

      const client = createApiClient(mockConfig);
      const token = await client.getAccessToken();

      expect(token).toBe("mock_access_token_1");
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      const [calledUrl, calledData, calledConfig] = mockedAxios.post.mock.calls[0];
      expect(calledUrl).toBe("https://oauth.livepix.gg/oauth2/token");
      expect(calledConfig?.headers?.["Content-Type"]).toBe(
        "application/x-www-form-urlencoded"
      );

      // Verify that calledData is URLSearchParams with expected params
      expect(calledData).toBeInstanceOf(URLSearchParams);
      const params = calledData as URLSearchParams;
      expect(params.get("grant_type")).toBe("client_credentials");
      expect(params.get("client_id")).toBe("mock_client_id");
      expect(params.get("client_secret")).toBe("mock_client_secret");
      expect(params.get("scope")).toBe("payments:read payments:write");
    });

    it("should reuse cached token if valid and not forceRefresh", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: "cached_token",
          token_type: "Bearer",
          expires_in: 3600,
        },
      });

      const client = createApiClient(mockConfig);
      const token1 = await client.getAccessToken();
      const token2 = await client.getAccessToken(false);

      expect(token1).toBe("cached_token");
      expect(token2).toBe("cached_token");
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it("should fetch a new token when forceRefresh is true", async () => {
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            access_token: "first_token",
            token_type: "Bearer",
            expires_in: 3600,
          },
        })
        .mockResolvedValueOnce({
          data: {
            access_token: "second_token",
            token_type: "Bearer",
            expires_in: 3600,
          },
        });

      const client = createApiClient(mockConfig);
      const token1 = await client.getAccessToken();
      const token2 = await client.getAccessToken(true);

      expect(token1).toBe("first_token");
      expect(token2).toBe("second_token");
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  describe("HTTP methods and response envelope unwrapping", () => {
    it("get() should unwrap response.data.data", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: "token_123", expires_in: 3600 },
      });
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: {
            id: "acc_456",
            username: "criador",
          },
        },
      });

      const client = createApiClient(mockConfig);
      const result = await client.get<{ id: string; username: string }>("/v2/account");

      expect(result).toEqual({ id: "acc_456", username: "criador" });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.livepix.gg/v2/account",
        {
          headers: { Authorization: "Bearer token_123" },
        }
      );
    });

    it("post() should unwrap response.data.data", async () => {
      mockedAxios.post
        .mockResolvedValueOnce({
          data: { access_token: "token_123", expires_in: 3600 },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              redirectUrl: "https://livepix.gg/pay/xyz",
              reference: "ref_789",
            },
          },
        });

      const client = createApiClient(mockConfig);
      const result = await client.post<{ redirectUrl: string; reference: string }>(
        "/v2/payments",
        { amount: 500 }
      );

      expect(result).toEqual({
        redirectUrl: "https://livepix.gg/pay/xyz",
        reference: "ref_789",
      });
      expect(mockedAxios.post).toHaveBeenLastCalledWith(
        "https://api.livepix.gg/v2/payments",
        { amount: 500 },
        {
          headers: { Authorization: "Bearer token_123" },
        }
      );
    });

    it("delete() should unwrap response.data.data or return response.data", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: "token_123", expires_in: 3600 },
      });
      mockedAxios.delete.mockResolvedValueOnce({
        data: {
          data: { success: true },
        },
      });

      const client = createApiClient(mockConfig);
      const result = await client.delete<{ success: boolean }>("/v2/webhooks/hook_1");

      expect(result).toEqual({ success: true });
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "https://api.livepix.gg/v2/webhooks/hook_1",
        {
          headers: { Authorization: "Bearer token_123" },
        }
      );
    });

    it("put() and patch() should work with envelope unwrapping", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: "token_123", expires_in: 3600 },
      });
      mockedAxios.put.mockResolvedValueOnce({
        data: { data: { updated: true } },
      });
      mockedAxios.patch.mockResolvedValueOnce({
        data: { data: { patched: true } },
      });

      const client = createApiClient(mockConfig);
      const putRes = await client.put<{ updated: boolean }>("/v2/test", { a: 1 });
      const patchRes = await client.patch<{ patched: boolean }>("/v2/test", { b: 2 });

      expect(putRes).toEqual({ updated: true });
      expect(patchRes).toEqual({ patched: true });
    });
  });

  describe("Transparent retry on HTTP 401 with forceRefresh: true", () => {
    it("should retry once with forceRefresh on HTTP 401 and succeed", async () => {
      // 1. Initial token request
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: "expired_token", expires_in: 3600 },
      });

      // 2. GET request fails with HTTP 401
      const error401 = {
        name: "AxiosError",
        message: "Request failed with status code 401",
        response: { status: 401, data: { message: "Unauthorized" } },
      };
      mockedAxios.get.mockRejectedValueOnce(error401);

      // 3. Retry token request (forceRefresh)
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: "fresh_new_token", expires_in: 3600 },
      });

      // 4. Retry GET request succeeds with fresh token
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { message: "Success after retry" } },
      });

      const client = createApiClient(mockConfig);
      const result = await client.get<{ message: string }>("/v2/protected");

      expect(result).toEqual({ message: "Success after retry" });
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);

      // First call used expired_token
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        "https://api.livepix.gg/v2/protected",
        { headers: { Authorization: "Bearer expired_token" } }
      );

      // Second call used fresh_new_token
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        2,
        "https://api.livepix.gg/v2/protected",
        { headers: { Authorization: "Bearer fresh_new_token" } }
      );
    });

    it("should throw error if retry also fails with 401 (preventing infinite loop)", async () => {
      // 1. Initial token
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: "bad_token_1", expires_in: 3600 },
      });

      // 2. First call 401
      const error401 = {
        name: "AxiosError",
        message: "Unauthorized",
        response: { status: 401, data: { message: "Unauthorized" } },
      };
      mockedAxios.get.mockRejectedValueOnce(error401);

      // 3. Refresh token
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: "bad_token_2", expires_in: 3600 },
      });

      // 4. Second call also 401
      mockedAxios.get.mockRejectedValueOnce(error401);

      const client = createApiClient(mockConfig);

      await expect(client.get("/v2/protected")).rejects.toMatchObject({
        response: { status: 401 },
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it("should not retry on non-401 HTTP errors (e.g. 404)", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: "valid_token", expires_in: 3600 },
      });

      const error404 = {
        name: "AxiosError",
        message: "Not Found",
        response: { status: 404, data: { message: "Not Found" } },
      };
      mockedAxios.get.mockRejectedValueOnce(error404);

      const client = createApiClient(mockConfig);

      await expect(client.get("/v2/missing")).rejects.toMatchObject({
        response: { status: 404 },
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });
});
