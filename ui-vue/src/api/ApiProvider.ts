import { getAccessToken, logout } from "./AuthService";
import { resolveApiUrl } from "./config";

type HttpMethod = "GET" | "POST" | "DELETE" | "PUT";

interface RequestOptions {
    method?: HttpMethod;
    body?: any;
    headers?: Record<string, string>;
    isFormData?: boolean;
}

async function apiRequest(path: string, options: RequestOptions = {}): Promise<Response> {
    const url = resolveApiUrl(path);
    const token = getAccessToken();

    const headers: Record<string, string> = {
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (!options.isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const config: RequestInit = {
        method: options.method || "GET",
        headers,
    };

    if (options.body) {
        config.body = options.isFormData ? options.body : JSON.stringify(options.body);
    }

    let response = await fetch(url, config);

    if (response.status === 401) {
        // Token expired or invalid
        // In a real app, we might try to refresh the token here
        // For now, just logout and redirect
        await logout();
        window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    return response;
}

export const ApiProvider = {
    get: (path: string) => apiRequest(path, { method: "GET" }),
    post: (path: string, body: any) => apiRequest(path, { method: "POST", body }),
    postFormData: (path: string, formData: FormData) => apiRequest(path, { method: "POST", body: formData, isFormData: true }),
    delete: (path: string) => apiRequest(path, { method: "DELETE" }),
    put: (path: string, body: any) => apiRequest(path, { method: "PUT", body }),
};

export default ApiProvider;
