import { refresh, getAccessToken, redirectToLogin } from "./AuthService";
import { LOGIN_PATH } from "../common/Path";

const apiProviderGet: (url: string, config?: RequestInit) => Promise<Response> =
  async (url, config) => {
    try {
      var fetchConfig: RequestInit = {};
      if (config !== null && config !== undefined) {
        fetchConfig = config;
      }
      fetchConfig.method = "GET";
      fetchConfig.redirect = "manual";
      if (!fetchConfig.credentials) {
        fetchConfig.credentials = "include";
      }
      const fetchHeadersInit: HeadersInit = {};
      fetchConfig.headers = fetchHeadersInit;
      
      const token = getAccessToken();
      if (token) {
        fetchConfig.headers["Authorization"] = `Bearer ${token}`;
      }
      
      let fetchResponse = await fetch(url, fetchConfig);
      if (!fetchResponse.ok) {
        if (fetchResponse.status === 401) {
          try {
            const newToken = await refresh();
            // retry once
            fetchConfig.headers["Authorization"] = `Bearer ${newToken}`;
            fetchResponse = await fetch(url, fetchConfig);
          } catch (e) {
            if (window.location.pathname !== LOGIN_PATH) {
              redirectToLogin();
            }
          }
        }
        if (!fetchResponse.ok) {
          if (
            fetchResponse.type === "opaqueredirect" &&
            fetchResponse.url &&
            window.location.pathname !== LOGIN_PATH
          ) {
            redirectToLogin();
          } else {
            throw new Error(
              fetchResponse.status + " " + fetchResponse.statusText
            );
          }
        }
      }
      return fetchResponse;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

const apiProviderPost: (
  url: string,
  postData?: any,
  isFormData?: boolean,
  config?: RequestInit
) => Promise<Response> = async (url, postData, isFormData, config) => {
  try {
    var fetchConfig: RequestInit = {};
    if (config !== null && config !== undefined) {
      fetchConfig = config;
    }
    fetchConfig.method = "POST";
    fetchConfig.redirect = "manual";
    if (!fetchConfig.credentials) {
      fetchConfig.credentials = "include";
    }
    const fetchHeadersInit: HeadersInit = {};
    fetchConfig.headers = fetchHeadersInit;
    if (isFormData !== true) {
      fetchConfig.headers["Content-Type"] = "application/json";
    }
    
    const token = getAccessToken();
    if (token) {
      fetchConfig.headers["Authorization"] = `Bearer ${token}`;
    }
    
    if (isFormData === true) {
      fetchConfig.body = postData;
    } else {
      fetchConfig.body = JSON.stringify(postData);
    }
    
    let fetchResponse = await fetch(url, fetchConfig);
    if (!fetchResponse.ok) {
      if (fetchResponse.status === 401) {
        try {
          const newToken = await refresh();
          fetchConfig.headers["Authorization"] = `Bearer ${newToken}`;
          fetchResponse = await fetch(url, fetchConfig);
        } catch (e) {
          if (window.location.pathname !== LOGIN_PATH) {
            redirectToLogin();
          }
        }
      }
      if (!fetchResponse.ok) {
        if (
          fetchResponse.type === "opaqueredirect" &&
          fetchResponse.url &&
          window.location.pathname !== LOGIN_PATH
        ) {
          redirectToLogin();
        }
      }
    }
    return fetchResponse;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const exportApiProvider = {
  apiProviderGet,
  apiProviderPost,
};

export default exportApiProvider;

// 通用响应解包工具：后端统一 {status, data, ...extra}
export interface ApiEnvelope<T = any> { status: number; data?: T;[k: string]: any }
export function unwrap<T = any>(raw: any): T {
  if (raw && typeof raw === 'object' && 'status' in raw) {
    if (raw.status !== 0) throw new Error(raw.message || `api status ${raw.status}`);
    if ('data' in raw) return raw.data as T;
  }
  return raw as T; // 兼容旧接口直接返回结构
}