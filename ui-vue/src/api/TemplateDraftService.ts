import ApiProvider from "./ApiProvider";

export interface TemplateDraftPayload {
    basicInfo: any;
    templateData: any;
}

export interface TemplateDraft {
    id: string;
    owner: string;
    title: string;
    json_data: TemplateDraftPayload;
    status: string;
    created_at: string;
    updated_at: string;
}

export type TemplateDraftUpsert = {
    title: string;
    payload: TemplateDraftPayload;
};

export type TemplateDraftListResponse = {
    status: number;
    data: TemplateDraft[];
};

export type TemplateDraftCountResponse = {
    status: number;
    count: number;
};

export type TemplateDraftCreateResponse = {
    status: number;
    data?: TemplateDraft;
    message?: string;
};

const createDraft = async (draft: TemplateDraftUpsert): Promise<TemplateDraftCreateResponse> => {
    const res = await ApiProvider.post("/api/template_drafts", draft);
    return await res.json();
};

const updateDraft = async (id: string, draft: TemplateDraftUpsert): Promise<{ status: number; message?: string }> => {
    const res = await ApiProvider.put(`/api/template_drafts/${id}`, draft);
    return await res.json();
};

const getDraft = async (id: string): Promise<{ status: number; data?: TemplateDraft }> => {
    const res = await ApiProvider.get(`/api/template_drafts/${id}`);
    return await res.json();
};

const deleteDraft = async (id: string): Promise<{ status: number; message?: string }> => {
    const res = await ApiProvider.delete(`/api/template_drafts/${id}`);
    return await res.json();
};

const listDrafts = async (start = 0, size = 20): Promise<TemplateDraftListResponse> => {
    const res = await ApiProvider.get(`/api/template_drafts?start=${start}&size=${size}`);
    return await res.json();
};

const countDrafts = async (): Promise<TemplateDraftCountResponse> => {
    const res = await ApiProvider.get(`/api/template_drafts/count`);
    return await res.json();
};

export default {
    createDraft,
    updateDraft,
    getDraft,
    deleteDraft,
    listDrafts,
    countDrafts,
};
