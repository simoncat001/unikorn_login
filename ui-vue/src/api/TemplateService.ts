import ApiProvider from "./ApiProvider";

export interface TemplateNameData {
    name_list: string[];
    name_dict: { [key: string]: string };
}

export interface TemplateFileSubmitResponse {
    status: number;
    data: any;
}

export interface LayeredWordOrder {
    type: string;
    title: string;
    unit?: string;
    order: LayeredWordOrder[];
}

export interface TemplateJSON {
    title: string;
    data_generate_method: string;
    institution: string;
    template_publish_platform: string;
    source_standard_number: string;
    source_standard_name: string;
    template_type: string;
    author: string;
    create_timestamp: string;
    reviewer: string;
    review_status: string;
    rejected_reason: string;
    schema: any;
    citation_count: string;
    template_MGID: string;
    word_order?: LayeredWordOrder[];
    origin_basic_information: any;
    origin_schema_create: any;
}

export interface Template {
    id: string;
    name: string;
    json_schema: TemplateJSON;
}

export interface TemplateResponse {
    status: number;
    data: Template[];
}

const getTemplateList = async (review_state: string, start: number, size: number): Promise<TemplateResponse> => {
    try {
        const response = await ApiProvider.post("/api/templates_list", {
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
        const response = await ApiProvider.post("/api/templates_count", {
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

const deleteTemplate = async (uuid: string): Promise<number> => {
    try {
        const response = await ApiProvider.post("/api/delete_template", {
            id: uuid,
        });
        const responseData = await response.json();
        return responseData["status"];
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getTemplate = async (id: string): Promise<Template> => {
    try {
        const response = await ApiProvider.get(`/api/templates/${id}`);
        const payload = await response.json();
        // Assuming payload is the template object directly or wrapped in data
        // Based on React code: const template = unwrap<Template>(payload);
        // unwrap usually checks for status and returns data.
        // Let's assume payload.data is the template if status is 0, or payload is the template.
        // React unwrap: if (payload.status !== 0) throw ... return payload.data
        if (payload.status !== undefined && payload.status !== 0) {
            throw new Error(payload.message || "Error fetching template");
        }
        return payload.data || payload;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getTemplateListWithBegin = async (beginWord: string): Promise<TemplateNameData> => {
    try {
        const response = await ApiProvider.get(`/api/template_list/${beginWord}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getTemplateSchemaWithId = async (id: string): Promise<any> => {
    try {
        const response = await ApiProvider.get(`/api/templates_schema/${id}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getTemplateWordOrderWithId = async (id: string): Promise<any> => {
    try {
        const response = await ApiProvider.get(`/api/templates_word_order/${id}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getEmptyTemplateWithId = async (id: string): Promise<TemplateFileSubmitResponse> => {
    try {
        const response = await ApiProvider.get(`/api/templates_empty/${id}`);
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getPresetWordList = async (): Promise<{ [key: string]: string[] }> => {
    try {
        const response = await ApiProvider.get("/api/get_preset_word_list");
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export default {
    getTemplateListWithBegin,
    getTemplateSchemaWithId,
    getTemplateWordOrderWithId,
    getEmptyTemplateWithId,
    getTemplateList,
    getTemplatesCount,
    deleteTemplate,
    getTemplate,
    getPresetWordList,
};
