import ApiProvider from "./ApiProvider";

export interface MGIDApplyJSON {
    data_title: string;
    author_name: string;
    author_organization: string;
    abstract: string;
    source_type: string;
    data_url: string;
    custom_field: string;
    MGID_submitter: string;
    create_timestamp: string;
    user_comment: string;
    MGID: string;
}

export interface MGIDApply {
    id: string;
    template_id: string;
    json_data: MGIDApplyJSON;
}

export interface MGIDResponse {
    status: number;
    data: MGIDApply[];
}

export interface MGIDApplyGet {
    type: string;
    data: MGIDApply;
}

const getMGID = async (MGID: string): Promise<MGIDApplyGet> => {
    try {
        const response = await ApiProvider.get(`/api/get_MGID/${MGID}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getMGIDList = async (start: number, size: number): Promise<MGIDResponse> => {
    try {
        const response = await ApiProvider.post("/api/MGID_list", {
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
        const response = await ApiProvider.get("/api/MGID_count");
        const responseData = await response.json();
        return responseData["count"];
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export default {
    getMGIDList,
    getMGIDCount,
    getMGID,
};