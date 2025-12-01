import { refresh, getAccessToken, redirectToLogin } from "./AuthService";
import { LOGIN_PATH } from "../common/Path";
import { resolveApiUrl } from "./config";

type HttpMethod = "GET" | "POST" | "DELETE";

type HeadersRecord = Record<string, string>;

type ExecuteOptions = {
    throwOnError: boolean;
};

type BuildRequestOptions = {
    isFormData?: boolean;
    body?: unknown;
};

function toHeadersRecord(source?: HeadersInit): HeadersRecord {
    if (!source) {
        return {};
    }

    if (typeof Headers !== "undefined" && source instanceof Headers) {
        const headers: HeadersRecord = {};
        source.forEach((value, key) => {
            headers[key] = value;
        });
        return headers;
    }

    if (Array.isArray(source)) {
        const headers: HeadersRecord = {};
        for (const [key, value] of source) {
            headers[key] = value;
        }
        return headers;
    }

    return { ...(source as HeadersRecord) };
}

async function executeWithAuth(
    url: string,
    init: RequestInit,
    options: ExecuteOptions
): Promise<Response> {
    let response = await fetch(url, init);

    if (!response.ok && response.status === 401) {
        try {
            const newToken = await refresh();
            const headers = toHeadersRecord(init.headers);
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
        const redirectedToLogin =
            response.type === "opaqueredirect" &&
            response.url &&
            window.location.pathname !== LOGIN_PATH;

        if (redirectedToLogin) {
            redirectToLogin();
        } else if (options.throwOnError) {
            throw new Error(`${response.status} ${response.statusText}`);
        }
    }

    return response;
}

function buildRequestInit(
    method: HttpMethod,
    config?: RequestInit,
    options: BuildRequestOptions = {}
): RequestInit {
    const requestInit: RequestInit = {
        ...config,
        method,
        redirect: "manual",
        credentials: config?.credentials ?? "include",
        cache: config?.cache ?? "no-store",
    };

    const headers = toHeadersRecord(requestInit.headers);

    const hasCacheControl = Object.keys(headers).some(
        (key) => key.toLowerCase() === "cache-control"
    );

    if (!hasCacheControl) {
        headers["Cache-Control"] = "no-cache";
    }

    const token = getAccessToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (method === "POST") {
        const hasContentType = Object.keys(headers).some(
            (key) => key.toLowerCase() === "content-type"
        );

        if (options.isFormData) {
            if (!hasContentType) {
                // Leave browser to set boundary headers automatically for FormData
                delete headers["Content-Type"];
            }
            if (options.body !== undefined) {
                requestInit.body = options.body as BodyInit;
            }
        } else {
            if (!hasContentType) {
                headers["Content-Type"] = "application/json";
            }
            if (options.body !== undefined) {
                requestInit.body = JSON.stringify(options.body);
            }
        }
    }

    requestInit.headers = headers;

    return requestInit;
}

async function apiProviderGet(url: string, config?: RequestInit): Promise<Response> {
    const requestInit = buildRequestInit("GET", config);

    try {
        return await executeWithAuth(resolveApiUrl(url), requestInit, {
            throwOnError: true,
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function apiProviderPost(
    url: string,
    postData?: unknown,
    isFormData?: boolean,
    config?: RequestInit
): Promise<Response> {
    const requestInit = buildRequestInit(
        "POST",
        config,
        {
            isFormData,
            body: postData,
        }
    );

    try {
        return await executeWithAuth(resolveApiUrl(url), requestInit, {
            throwOnError: false,
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function apiProviderDelete(url: string, config?: RequestInit): Promise<Response> {
    const requestInit = buildRequestInit("DELETE", config);

    try {
        return await executeWithAuth(resolveApiUrl(url), requestInit, {
            throwOnError: false,
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const ApiProvider = {
    apiProviderGet,
    apiProviderPost,
    apiProviderDelete,
};

export default ApiProvider;
export { apiProviderGet, apiProviderPost, apiProviderDelete };

// 通用响应解包工具：后端统一 {status, data, ...extra}
export interface ApiEnvelope<T = unknown> {
    status: number;
    data?: T;
    [k: string]: unknown;
}

export function unwrap<T = unknown>(raw: unknown): T {
    if (raw && typeof raw === "object" && "status" in raw) {
        const envelope = raw as ApiEnvelope<T> & { message?: string };

        if (envelope.status !== 0) {
            throw new Error(envelope.message ?? `api status ${envelope.status}`);
        }

        if ("data" in envelope) {
            return envelope.data as T;
        }
    }

    return raw as T; // 兼容旧接口直接返回结构
}