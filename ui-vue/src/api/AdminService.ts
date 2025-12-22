import ApiProvider from "./ApiProvider";
import { WordResponse } from "./WordService";
import { TemplateResponse } from "./TemplateService";
import { DevelopmentDataResponse } from "./DevelopmentDataService";
import { MGIDResponse } from "./MGIDApplyService";

const getWordList = async (
    review_state: string,
    start: number,
    size: number
): Promise<WordResponse> => {
    try {
        const response = await ApiProvider.post("/api/admin/words_list", {
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

const getWordsCount = async (review_state: string): Promise<number> => {
    try {
        const response = await ApiProvider.post("/api/admin/words_count", {
            status_filter: review_state,
        });
        const responseData = await response.json();
        return responseData["count"];
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getTemplateList = async (
    review_state: string,
    start: number,
    size: number
): Promise<TemplateResponse> => {
    try {
        const response = await ApiProvider.post("/api/admin/templates_list", {
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

const getTemplatesCount = async (review_state: string): Promise<number> => {
    try {
        const response = await ApiProvider.post("/api/admin/templates_count", {
            status_filter: review_state,
        });
        const responseData = await response.json();
        return responseData["count"];
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getDataList = async (
    review_state: string,
    start: number,
    size: number
): Promise<DevelopmentDataResponse> => {
    try {
        const response = await ApiProvider.post("/api/admin/data_list", {
            start: start,
            size: size,
            status_filter: review_state,
        });
        const responseData = await response.json();
        if (responseData.status === 0) {
            return { status: 0, data: responseData.data } as DevelopmentDataResponse;
        } else {
            return { status: 1, data: [] } as DevelopmentDataResponse;
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getDataCount = async (review_state: string): Promise<number> => {
    try {
        const response = await ApiProvider.post("/api/admin/data_count", {
            status_filter: review_state,
        });
        const responseData = await response.json();
        if (responseData.status === 0) {
            return responseData.data || 0;
        } else {
            return 0;
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const updateReview = async (
    id: string,
    type: string,
    reviewer: string,
    review_status: string,
    rejected_reason: string
): Promise<number> => {
    try {
        const getURL = (key: string) => {
            switch (key) {
                case "word":
                    return "/api/admin/word_review/";
                case "template":
                    return "/api/admin/template_review/";
                case "data":
                    return "/api/admin/data_review/";
                default:
                    return "/api/admin/word_review/";
            }
        };
        const url = getURL(type);
        const response = await ApiProvider.post(url.concat(id), {
            id: id,
            reviewer: reviewer,
            review_status: review_status,
            rejected_reason: rejected_reason,
        });
        const responseData = await response.json();
        return responseData["status"];
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getMGIDList = async (start: number, size: number): Promise<MGIDResponse> => {
    try {
        const response = await ApiProvider.post("/api/admin/MGID_list", {
            start: start,
            size: size,
            status_filter: "",
        });
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getMGIDCount = async (): Promise<number> => {
    try {
        const response = await ApiProvider.get("/api/admin/MGID_count");
        const responseData = await response.json();
        return responseData["count"];
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const checkAdmin = async (): Promise<boolean> => {
    try {
        const response = await ApiProvider.get("/api/admin/check_admin");
        return await response.json();
    } catch (e) {
        console.error(e);
        return false;
    }
};

const checkSuperAdmin = async (): Promise<boolean> => {
    try {
        const response = await ApiProvider.get("/api/admin/check_superadmin");
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export default {
    getWordList,
    getWordsCount,
    getTemplateList,
    getTemplatesCount,
    getDataList,
    getDataCount,
    updateReview,
    getMGIDList,
    getMGIDCount,
    checkAdmin,
    checkSuperAdmin,
};
