import { resolveApiUrl } from "./config";

/* Lightweight auth service for username/password login flow.
 * Stores access_token in sessionStorage + memory; refresh_token stays in HttpOnly cookie (set by server).
 */

type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: { id?: string; name?: string; roles?: string[]; permissions?: string[] };
};

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let isLoggingOut = false;

function initFromStorage() {
  try {
    const t = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (t) accessToken = t;
    const r = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (r) refreshToken = r;
  } catch { }
}
initFromStorage();

function setAccessToken(token: string) {
  accessToken = token;
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch { }
}

function setRefreshToken(token: string | null) {
  refreshToken = token;
  try {
    if (token) sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    else sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch { }
}

function clearAccessToken() {
  accessToken = null;
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch { }
}

export function clearTokens() {
  clearAccessToken();
  setRefreshToken(null);
  setUser(undefined);
}

function setUser(user: any | undefined) {
  try {
    if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(USER_KEY);
  } catch { }
}

function getUser(): any | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function base64UrlDecode(input: string): string {
  // base64url to base64
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return "";
  }
}

function getJwtExp(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    if (typeof payload.exp === "number") return payload.exp;
  } catch { }
  return null;
}

function isExpiredOrMissing(token: string | null): boolean {
  if (!token) return true;
  const exp = getJwtExp(token);
  if (!exp) return false; // cannot determine; assume valid
  const now = Math.floor(Date.now() / 1000);
  return exp <= now;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  isLoggingOut = false;
  // 后端按 OAuth2PasswordRequestForm 规范，使用 x-www-form-urlencoded
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);
  const res = await fetch(resolveApiUrl("/api/token"), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    redirect: "manual",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(res.status === 401 ? "UNAUTHORIZED" : `HTTP_${res.status}`);
  }
  const data = (await res.json()) as LoginResponse;
  if (data && data.access_token) {
    setAccessToken(data.access_token);
    if (data.refresh_token) setRefreshToken(data.refresh_token);
    setUser(data.user);
  }
  return data;
}

export async function refresh(): Promise<string> {
  if (isLoggingOut) {
    throw new Error("LOGGED_OUT");
  }
  const payload = refreshToken ? { refresh_token: refreshToken } : {};
  const res = await fetch(resolveApiUrl("/api/token/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "manual",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("REFRESH_FAILED");
  }
  const data = (await res.json()) as LoginResponse;
  if (!data.access_token) throw new Error("NO_ACCESS_TOKEN");
  setAccessToken(data.access_token);
  if (data.refresh_token) setRefreshToken(data.refresh_token);
  if (data.user) setUser(data.user);
  return data.access_token;
}

export async function logout(): Promise<void> {
  isLoggingOut = true;
  try {
    const response = await fetch(resolveApiUrl("/api/logout"), {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok && response.status !== 404) {
      console.warn("Logout request did not succeed", response.status);
    }
  } catch (error) {
    console.warn("Failed to notify backend about logout", error);
  }
  clearTokens();
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function isLoggedIn(): boolean {
  return !isExpiredOrMissing(accessToken);
}

export function redirectToLogin(next?: string) {
  try {
    const urlNow = new URL(window.location.href);
    let target = next || urlNow.pathname + urlNow.search;
    if (urlNow.pathname === "/login") {
      const curNext = urlNow.searchParams.get("next");
      target = curNext && !/^\/login(\b|\?|$)/.test(curNext) ? curNext : "/";
    }
    if (/^\/login(\b|\?|$)/.test(target)) target = "/";
    const url = `/login?next=${encodeURIComponent(target)}`;
    window.location.assign(url);
  } catch {
    const safe = next && !/^\/login(\b|\?|$)/.test(next) ? next : "/";
    window.location.assign(`/login?next=${encodeURIComponent(safe)}`);
  }
}

const AuthService = {
  login,
  refresh,
  logout,
  clearTokens,
  getAccessToken,
  isLoggedIn,
  getUser,
  redirectToLogin,
};

export default AuthService;