import { refresh, getAccessToken, redirectToLogin } from "./AuthService";
import { LOGIN_PATH } from "../common/Path";

type HttpMethod = "GET" | "POST" | "DELETE";

const API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

const resolveUrl = (url: string) => {
  if (!API_BASE || /^https?:\/\//i.test(url)) {
    return url;
  }

  if (API_BASE.endsWith("/api") && url.startsWith("/api/")) {
    return `${API_BASE}${url.substring(4)}`;
  }

  if (url.startsWith("/")) {
    return `${API_BASE}${url}`;
  }

  return `${API_BASE}/${url}`;
};

function createHeaders(source?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {};

  if (!source) {
    return headers;
  }

  if (typeof Headers !== "undefined" && source instanceof Headers) {
    source.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  if (Array.isArray(source)) {
    source.forEach(([key, value]) => {
      headers[key] = value;
    });
    return headers;
  }

  return { ...source } as Record<string, string>;
}

async function executeWithAuth(
  url: string,
  init: RequestInit,
  { throwOnError }: { throwOnError: boolean }
): Promise<Response> {
  let response = await fetch(url, init);

  if (!response.ok && response.status === 401) {
    try {
      const newToken = await refresh();
      const headers = createHeaders(init.headers);
      headers["Authorization"] = `Bearer ${newToken}`;
      init.headers = headers;
      response = await fetch(url, init);
    } catch (error) {
      if (window.location.pathname !== LOGIN_PATH) {
        redirectToLogin();
      }
      throw error;
    }
  }

  if (!response.ok) {
    if (
      response.type === "opaqueredirect" &&
      response.url &&
      window.location.pathname !== LOGIN_PATH
    ) {
      redirectToLogin();
    } else if (throwOnError) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  }

  return response;
}

function buildRequestInit(
  method: HttpMethod,
  config?: RequestInit,
  options?: { isFormData?: boolean; body?: any }
): RequestInit {
  const baseConfig: RequestInit = {
    ...config,
    method,
    redirect: "manual",
  };

  if (!baseConfig.credentials) {
    baseConfig.credentials = "include";
  }

  const headers = createHeaders(baseConfig.headers);

  if (options?.isFormData !== true && method === "POST") {
    const hasContentType = Object.keys(headers).some(
      (key) => key.toLowerCase() === "content-type"
    );
    if (!hasContentType) {
      headers["Content-Type"] = "application/json";
    }
  }

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  baseConfig.headers = headers;

  if (method === "POST") {
    if (options?.isFormData === true) {
      if (options.body !== undefined) {
        baseConfig.body = options.body;
      }
    } else if (options && options.body !== undefined) {
      baseConfig.body = JSON.stringify(options.body);
    }
  }

  return baseConfig;
}

async function apiProviderGet(url: string, config?: RequestInit): Promise<Response> {
  try {
    const requestInit = buildRequestInit("GET", config);
    return await executeWithAuth(resolveUrl(url), requestInit, {
      throwOnError: true,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function apiProviderPost(
  url: string,
  postData?: any,
  isFormData?: boolean,
  config?: RequestInit
): Promise<Response> {
  try {
    const requestInit = buildRequestInit("POST", config, {
      isFormData,
      body: postData,
    });
    return await executeWithAuth(resolveUrl(url), requestInit, {
      throwOnError: false,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function apiProviderDelete(url: string, config?: RequestInit): Promise<Response> {
  try {
    const requestInit = buildRequestInit("DELETE", config);
    return await executeWithAuth(resolveUrl(url), requestInit, {
      throwOnError: false,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

const exportApiProvider = {
  apiProviderGet,
  apiProviderPost,
  apiProviderDelete,
};

export default exportApiProvider;

// 通用响应解包工具：后端统一 {status, data, ...extra}
export interface ApiEnvelope<T = any> {
  status: number;
  data?: T;
  [k: string]: any;
}
export function unwrap<T = any>(raw: any): T {
  if (raw && typeof raw === "object" && "status" in raw) {
    if (raw.status !== 0) throw new Error(raw.message || `api status ${raw.status}`);
    if ("data" in raw) return raw.data as T;
  }
  return raw as T; // 兼容旧接口直接返回结构
}
