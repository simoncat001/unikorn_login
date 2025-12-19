// API 配置
export function resolveApiUrl(path: string): string {
    // 开发环境使用相对路径，由 Vite proxy 处理
    if (import.meta.env.DEV) {
        return path;
    }
    // 生产环境
    const base = import.meta.env.VITE_API_BASE_URL || '';
    return base + path;
}

export function getFileDownloadUrl(path: string): string {
    return resolveApiUrl(`/api/download/${path}`);
}
