import ApiProvider from "./ApiProvider";

export interface TemplateNameData {
    name_list: string[];
    name_dict: { [key: string]: string };
}

export interface TemplateFileSubmitResponse {
    status: number;
    data: any;
}

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

export default {
    getTemplateListWithBegin,
    getTemplateSchemaWithId,
    getTemplateWordOrderWithId,
    getEmptyTemplateWithId,
};
