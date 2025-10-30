const DEV_SERVER_PORTS = new Set(["3000", "3001", "5173", "4173"]);

function normalizeBase(base: string): string {
  return base.replace(/\/$/, "");
}

function computeBaseFromWindow(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const { protocol, hostname, port } = window.location;

  if (DEV_SERVER_PORTS.has(port)) {
    return "";
  }

  if (port) {
    return normalizeBase(`${protocol}//${hostname}:${port}`);
  }

  return normalizeBase(`${protocol}//${hostname}`);
}

const rawEnvBase = (process.env.REACT_APP_API_URL || "").trim();
const API_BASE = rawEnvBase ? normalizeBase(rawEnvBase) : computeBaseFromWindow();

export function resolveApiUrl(path: string): string {
  if (!API_BASE || /^https?:\/\//i.test(path)) {
    return path;
  }

  if (API_BASE.endsWith("/api") && path.startsWith("/api/")) {
    return `${API_BASE}${path.substring(4)}`;
  }

  if (path.startsWith("/")) {
    return `${API_BASE}${path}`;
  }

  return `${API_BASE}/${path}`;
}

export function getApiBaseUrl(): string {
  return API_BASE;
}
