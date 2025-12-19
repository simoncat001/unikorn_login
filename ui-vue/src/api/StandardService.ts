import ApiProvider from "./ApiProvider";
import { getAccessToken } from "./AuthService";
import { resolveApiUrl } from "./config";

export interface StandardCreate {
    name_zh: string;
    name_en: string;
    file_url: string;
    review_status?: string;
    owner?: string;
}

export interface Standard {
    id: string;
    name_zh: string;
    name_en: string;
    file_url: string;
    review_status: string;
    owner?: string;
}

const createStandard = async (standard: StandardCreate): Promise<Standard> => {
    try {
        const response = await ApiProvider.post("/api/standards", standard);
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const uploadStandardFile = async (file: File, onProgress?: (percent: number) => void): Promise<any> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = resolveApiUrl("/api/upload");

        xhr.open("POST", url);

        const token = getAccessToken();
        if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        if (onProgress) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    onProgress(percentComplete);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (e) {
                    reject(new Error("Invalid JSON response"));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error("Network error during upload"));
        };

        const formData = new FormData();
        formData.append("file", file);

        xhr.send(formData);
    });
};

const deleteStandardFile = async (filePath: string): Promise<any> => {
    try {
        const response = await ApiProvider.delete(`/api/delete_file/${filePath}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getStandards = async (start: number, size: number): Promise<any> => {
    try {
        // Backend uses skip/limit
        const response = await ApiProvider.get(`/api/standards?skip=${start}&limit=${size}`);
        const data = await response.json();
        // Wrap in expected format if needed, or just return data
        // AdminCollectionView expects { data: [], ... } usually, let's check
        return { data: data, total: 100 }; // Mock total for now as backend doesn't return it yet
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const searchStandards = async (query: string): Promise<Standard[]> => {
    try {
        const response = await ApiProvider.get(`/api/standards/search?q=${encodeURIComponent(query)}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getStandard = async (id: string): Promise<Standard> => {
    try {
        const response = await ApiProvider.get(`/api/standards/${id}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const deleteStandard = async (id: string): Promise<number> => {
    try {
        const response = await ApiProvider.delete(`/api/standards/${id}`);
        const data = await response.json();
        return data.status;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const updateStandardStatus = async (id: string, status: string): Promise<Standard> => {
    try {
        const response = await ApiProvider.put(`/api/standards/${id}/status`, { review_status: status });
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getMyStandards = async (start: number = 0, size: number = 100): Promise<Standard[]> => {
    try {
        const response = await ApiProvider.get(`/api/standards/my?skip=${start}&limit=${size}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getMyStandardsCount = async (): Promise<number> => {
    try {
        const response = await ApiProvider.get("/api/standards/my/count");
        const data = await response.json();
        return data.count;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export default {
    createStandard,
    uploadStandardFile,
    deleteStandardFile,
    getStandards,
    searchStandards,
    getStandard,
    deleteStandard,
    updateStandardStatus,
    getMyStandards,
    getMyStandardsCount
};
