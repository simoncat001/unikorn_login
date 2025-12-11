import { resolveApiUrl } from "./config";

/* 认证服务 - 处理登录、登出、token 管理 */

export type AuthUser = {
    username?: string;
    display_name?: string;
    user_type?: string | null;
    [key: string]: unknown;
};

type LoginResponse = {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    user?: AuthUser | null;
};

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";

let accessToken: string | null = null;
let refreshToken: string | null = null;

// 从 sessionStorage 初始化
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

function setUser(user: AuthUser | undefined) {
    try {
        if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        else sessionStorage.removeItem(USER_KEY);
    } catch { }
}

function getUser(): AuthUser | null {
    try {
        const raw = sessionStorage.getItem(USER_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

async function fetchCurrentUser(): Promise<AuthUser | null> {
    try {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }
        const response = await fetch(resolveApiUrl("/api/userinfo/"), {
            method: "GET",
            credentials: "include",
            headers,
        });
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        const normalized = data && typeof data === "object" ? (data as AuthUser) : null;
        if (normalized) {
            setUser(normalized);
        }
        return normalized;
    } catch {
        return null;
    }
}

function base64UrlDecode(input: string): string {
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
    if (!exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return exp <= now;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
    const body = new URLSearchParams();
    body.set("username", username);
    body.set("password", password);

    const res = await fetch(resolveApiUrl("/api/token"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error(res.status === 401 ? "用户名或密码错误" : `登录失败: ${res.status}`);
    }

    const data = (await res.json()) as LoginResponse;
    if (data && data.access_token) {
        setAccessToken(data.access_token);
        if (data.refresh_token) setRefreshToken(data.refresh_token);
        const profile = data.user ? data.user : await fetchCurrentUser();
        if (profile) {
            setUser(profile);
        }
    }
    return data;
}

export async function logout(): Promise<void> {
    try {
        await fetch(resolveApiUrl("/api/logout"), {
            method: "POST",
            credentials: "include",
        });
    } catch (error) {
        console.warn("登出请求失败", error);
    }
    clearTokens();
}

export function getAccessToken(): string | null {
    return accessToken;
}

export function isLoggedIn(): boolean {
    return !isExpiredOrMissing(accessToken);
}

const AuthService = {
    login,
    logout,
    clearTokens,
    getAccessToken,
    isLoggedIn,
    getUser,
};

export default AuthService;
