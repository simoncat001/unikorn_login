import ApiProvider from "./ApiProvider";
import { getAccessToken } from "./AuthService";
import { resolveApiUrl } from "./config";

export interface DevelopmentDataCreateInfo {
    status: number;
    data?: any;
}

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
    deleteFile
};
