import ApiProvider from "./ApiProvider";
import { getAccessToken } from "./AuthService";
import { resolveApiUrl } from "./config";

export type ElementType = {
    title?: string;
    type?: string;
    unit?: string;
    order?: ElementType[];
    element_type?: ElementType;
};

export type NumberRange = {
    start: string;
    end: string;
};

export type UserFile = {
    name: string;
    sha256: string;
};

export type DataContent = {
    type: string;
    title: string;
    content:
    | string
    | number
    | DataContent[]
    | (string | number)[]
    | NumberRange
    | UserFile
    | null;
    element_type?: ElementType;
    unit?: string;
};

export interface DevelopmentDataCreateInfo {
    status: number;
    data?: any;
}

export interface DevelopmentDataJSON {
    template_name: string;
    data_generate_method: string;
    institution: string;
    template_type: string;
    data_content: any[];
    word_order?: any[];
    origin_post_data: any;
    author: string;
    create_timestamp: string;
    reviewer: string;
    review_status: string;
    rejected_reason: string;
    MGID: string;
    title: string;
    citation_template: string;
}

export interface DevelopmentData {
    id: string;
    template_id: string;
    json_data: DevelopmentDataJSON;
}

export interface DevelopmentDataResponse {
    status: number;
    data: DevelopmentData[];
}

const getDataList = async (review_state: string, start: number, size: number): Promise<DevelopmentDataResponse> => {
    try {
        const response = await ApiProvider.post("/api/dev_data_list", {
            start: start,
            size: size,
            status_filter: review_state,
        });
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getDataCount = async (review_state: string): Promise<number> => {
    try {
        const response = await ApiProvider.post("/api/dev_data_count", {
            start: 0,
            size: 0,
            status_filter: review_state,
        });
        const responseData = await response.json();
        return responseData["count"];
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const deleteData = async (uuid: string): Promise<number> => {
    try {
        const response = await ApiProvider.post("/api/delete_data", {
            id: uuid,
        });
        const responseData = await response.json();
        return responseData["status"];
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getDevData = async (id: string): Promise<DevelopmentData> => {
    try {
        const response = await ApiProvider.get(`/api/dev_data/${id}`);
        const responseData = await response.json();
        if (responseData && responseData.data) {
            return responseData.data;
        } else {
            throw new Error('API response missing data field');
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const createDevelopmentData = async (
    templateId: string,
    jsonData: string,
    reviewStatus: string
): Promise<DevelopmentDataCreateInfo> => {
    try {
        const response = await ApiProvider.post("/api/development_data/web_submit", {
            template_id: templateId,
            json_data: jsonData,
            review_status: reviewStatus,
        });
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const createDevelopmentDataFromFile = async (
    templateId: string,
    jsonData: string,
    reviewStatus: string
): Promise<DevelopmentDataCreateInfo> => {
    try {
        const response = await ApiProvider.post("/api/development_data/web_submit", {
            template_id: templateId,
            json_data: jsonData,
            review_status: reviewStatus,
        });
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const uploadFile = async (file: File, onProgress?: (percent: number) => void): Promise<any> => {
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
                    reject(e);
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

const deleteFile = async (fileUrl: string): Promise<any> => {
    try {
        // Extract filename from URL (e.g. /api/download/filename.ext -> filename.ext)
        const filename = fileUrl.split('/').pop();
        if (!filename) return;

        const response = await ApiProvider.delete(`/api/delete_file/${filename}`);
        return await response.json();
    } catch (e) {
        console.error("Failed to delete file:", e);
        throw e;
    }
};

export default {
    createDevelopmentData,
    createDevelopmentDataFromFile,
    uploadFile,
    deleteFile,
    getDataList,
    getDataCount,
    deleteData,
    getDevData,
};
