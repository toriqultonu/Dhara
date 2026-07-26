import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import { api, ApiError } from "@/lib/api";

const API_BASE = "http://localhost:8080";

function okResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

function errorResponse(status: number, body: unknown): Response {
  return {
    ok: false,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe("ApiClient", () => {
  let fetchMock: Mock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    api.clearToken();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the Authorization header after setToken", async () => {
    fetchMock.mockResolvedValue(okResponse({ success: true, data: null }));
    api.setToken("jwt-123");
    await api.get("/api/statutes");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE}/api/statutes`);
    expect((options.headers as Record<string, string>).Authorization).toBe(
      "Bearer jwt-123"
    );
  });

  it("omits the Authorization header after clearToken", async () => {
    fetchMock.mockResolvedValue(okResponse({ success: true, data: null }));
    api.setToken("jwt-123");
    api.clearToken();
    await api.get("/api/statutes");

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.headers as Record<string, string>).not.toHaveProperty("Authorization");
  });

  it("returns the parsed ApiResponse body on success", async () => {
    fetchMock.mockResolvedValue(
      okResponse({ success: true, data: { id: 1, titleEn: "Penal Code" } })
    );
    const res = await api.get<{ id: number; titleEn: string }>("/api/statutes/1");
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: 1, titleEn: "Penal Code" });
  });

  it("serializes the body and sets method for post", async () => {
    fetchMock.mockResolvedValue(okResponse({ success: true, data: null }));
    await api.post("/api/search", { query: "মামলা" });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ query: "মামলা" }));
    expect((options.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json"
    );
  });

  it("throws ApiError with status and body message on non-ok responses", async () => {
    fetchMock.mockResolvedValue(errorResponse(404, { error: "Statute not found" }));
    const promise = api.get("/api/statutes/999");
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(api.get("/api/statutes/999")).rejects.toMatchObject({
      status: 404,
      message: "Statute not found",
    });
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("invalid json");
      },
    } as unknown as Response);

    await expect(api.get("/api/broken")).rejects.toMatchObject({
      status: 500,
      message: "Unknown error",
    });
  });

  it("propagates network errors from fetch", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(api.get("/api/statutes")).rejects.toThrow("Failed to fetch");
  });
});
