import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AuthProvider from "@/components/providers/AuthProvider";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message);
    }
  },
}));

const mockedPost = vi.mocked(api.post);
const mockedSetToken = vi.mocked(api.setToken);
const mockedClearToken = vi.mocked(api.clearToken);

const authPayload: AuthResponse = {
  accessToken: "access-abc",
  refreshToken: "refresh-xyz",
  user: { id: 1, email: "lawyer@dhara.com", name: "Lawyer", role: "USER" },
};

function Consumer() {
  const { user, isAuthenticated, initializing, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="init">{initializing ? "loading" : "ready"}</span>
      <span data-testid="auth">{isAuthenticated ? "yes" : "no"}</span>
      <span data-testid="email">{user?.email ?? "none"}</span>
      <button onClick={() => void login("lawyer@dhara.com", "secret")}>do-login</button>
      <button onClick={logout}>do-logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts unauthenticated with no stored token", async () => {
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("init")).toHaveTextContent("ready"));
    expect(screen.getByTestId("auth")).toHaveTextContent("no");
    expect(screen.getByTestId("email")).toHaveTextContent("none");
  });

  it("login stores the token, sets the user, and configures the api client", async () => {
    mockedPost.mockResolvedValue({ success: true, data: authPayload });
    renderWithProvider();

    fireEvent.click(screen.getByText("do-login"));

    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("yes"));
    expect(screen.getByTestId("email")).toHaveTextContent("lawyer@dhara.com");
    expect(mockedPost).toHaveBeenCalledWith("/api/auth/login", {
      email: "lawyer@dhara.com",
      password: "secret",
    });
    expect(localStorage.getItem("access_token")).toBe("access-abc");
    expect(JSON.parse(localStorage.getItem("auth_user") ?? "{}")).toMatchObject({
      email: "lawyer@dhara.com",
    });
    expect(mockedSetToken).toHaveBeenCalledWith("access-abc");
  });

  it("logout clears localStorage, the api token, and the user", async () => {
    mockedPost.mockResolvedValue({ success: true, data: authPayload });
    renderWithProvider();

    fireEvent.click(screen.getByText("do-login"));
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("yes"));

    fireEvent.click(screen.getByText("do-logout"));

    expect(screen.getByTestId("auth")).toHaveTextContent("no");
    expect(screen.getByTestId("email")).toHaveTextContent("none");
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("auth_user")).toBeNull();
    expect(mockedClearToken).toHaveBeenCalled();
  });

  it("restores the session from localStorage on mount", async () => {
    localStorage.setItem("access_token", "stored-token");
    localStorage.setItem("auth_user", JSON.stringify(authPayload.user));

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("init")).toHaveTextContent("ready"));
    expect(screen.getByTestId("auth")).toHaveTextContent("yes");
    expect(screen.getByTestId("email")).toHaveTextContent("lawyer@dhara.com");
    expect(mockedSetToken).toHaveBeenCalledWith("stored-token");
  });

  it("rebuilds a minimal user from the JWT when the stored user JSON is missing", async () => {
    // JWT payload: { "sub": "7", "email": "fallback@dhara.com", "role": "USER" }
    const payload = btoa(
      JSON.stringify({ sub: "7", email: "fallback@dhara.com", role: "USER" })
    );
    localStorage.setItem("access_token", `header.${payload}.sig`);

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("init")).toHaveTextContent("ready"));
    expect(screen.getByTestId("auth")).toHaveTextContent("yes");
    expect(screen.getByTestId("email")).toHaveTextContent("fallback@dhara.com");
  });
});
