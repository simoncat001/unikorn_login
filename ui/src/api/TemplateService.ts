import { JSONSchema7 } from "json-schema";
import ApiProvider, { unwrap } from "./ApiProvider";
export type LayeredWordOrder = {
  type: string;
  title: string;
  unit?: string;
  order: LayeredWordOrder[];
};

export type templateJSON = {
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
  schema: JSONSchema7;
  citation_count: string;
  template_MGID: string;
  word_order?: LayeredWordOrder[];
  origin_basic_information: JSONSchema7;
  origin_schema_create: JSONSchema7;
};

export type Template = {
  id: string;
  name: string;
  json_schema: templateJSON;
};

export type TemplateCreateInfo = {
  status: number;
  data?: Template;
};

export type TemplateResponse = {
  status: number;
  data: Template[];
};

export type TemplateFileSubmitResponse = {
  status: number;
  data: JSON;
};

export type TemplateSchema = {
  basic_information: JSON;
  schema_create: JSON;
};

export interface TemplateListData {
  uuid: string;
  itemName: string;
  pubTime: string;
  reviewer: string;
  author?: string;
  state: string;
}

export type TemplateNameData = {
  name_list: string[];
  name_dict: { [key: string]: string };
};

const getTemplateList: (
  review_state: string,
  start: number,
  size: number
) => Promise<TemplateResponse> = async (review_state, start, size) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/templates_list", {
      start: start,
      size: size,
      status_filter: review_state,
    });
    const wordList: TemplateResponse =
      (await response.json()) as TemplateResponse;
    return wordList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getTemplatesCount: (review_state: string) => Promise<number> = async (
  review_state
) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/templates_count", {
      start: 0,
      size: 0,
      status_filter: review_state,
    });
    const responseData = await response.json();
    const templates_count: number = responseData["count"];
    return templates_count;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getTemplateSchema: () => Promise<TemplateSchema> = async () => {
  try {
    let response = await ApiProvider.apiProviderGet("/api/get_template_schema");
    const schema: TemplateSchema = (await response.json()) as TemplateSchema;
    return schema;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getPresetWordList: () => Promise<{ [key: string]: string[] }> =
  async () => {
    try {
      let response = await ApiProvider.apiProviderGet(
        "/api/get_preset_word_list"
      );
      const presetWordList: { [key: string]: string[] } = await response.json();
      return presetWordList;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

const createTemplate: (
  name: string,
  basic_information: string,
  schema_create: string
) => Promise<TemplateCreateInfo> = async (
  name,
  basic_information,
  schema_create
) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/templates/", {
      name: name,
      basic_information: basic_information,
      schema_create: schema_create,
    });
    const TemplateCreateInfoObject: TemplateCreateInfo =
      (await response.json()) as TemplateCreateInfo;
    return TemplateCreateInfoObject;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getTemplate: (id: string) => Promise<Template> = async (id) => {
  try {
    const response = await ApiProvider.apiProviderGet(
      "/api/templates/".concat(id)
    );
    const payload = await response.json();
    const template = unwrap<Template>(payload);
    if (!template || typeof template !== "object") {
      throw new Error("template payload missing");
    }
    return template;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const deleteTemplate: (uuid: string) => Promise<number> = async (id) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/delete_template/".concat(id)
    );
    const responseData = await response.json();
    return responseData["status"];
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getTemplateListWithBegin: (
  beginWord: string
) => Promise<TemplateNameData> = async (beginWord) => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/template_list/".concat(beginWord)
    );
    const TemplateNameList: TemplateNameData =
      (await response.json()) as TemplateNameData;
    return TemplateNameList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getApplicationTemplateListWithBegin: (
  beginWord: string
) => Promise<TemplateNameData> = async (beginWord) => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/template_list/application/".concat(beginWord)
    );
    const TemplateNameList: TemplateNameData =
      (await response.json()) as TemplateNameData;
    return TemplateNameList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getTemplateWithName: (templateName: string) => Promise<JSON> = async (
  templateName
) => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/template/".concat(templateName)
    );
    const TemplateNameList: JSON = (await response.json()) as JSON;
    return TemplateNameList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getTemplateSchemaWithId: (id: string) => Promise<JSONSchema7> = async (
  id
) => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/templates_schema/".concat(id)
    );
    const TemplateObject: JSONSchema7 = (await response.json()) as JSONSchema7;
    return TemplateObject;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const updateTemplate: (
  id: string,
  name: string,
  basic_information: string,
  schema_create: string
) => Promise<TemplateCreateInfo> = async (
  id,
  name,
  basic_information,
  schema_create
) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/update_templates/".concat(id),
      {
        name: name,
        basic_information: basic_information,
        schema_create: schema_create,
      }
    );
    const TemplateCreateInfoObject: TemplateCreateInfo =
      (await response.json()) as TemplateCreateInfo;
    return TemplateCreateInfoObject;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getTemplateWordOrderWithId: (id: string) => Promise<LayeredWordOrder[]> =
  async (id) => {
    try {
      let response = await ApiProvider.apiProviderGet(
        "/api/templates_word_order/".concat(id)
      );
      const TemplateWordOrder: LayeredWordOrder[] =
        (await response.json()) as LayeredWordOrder[];
      return TemplateWordOrder;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

const getEmptyTemplateWithId: (
  id: string
) => Promise<TemplateFileSubmitResponse> = async (id) => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/templates_empty/".concat(id)
    );
    const responseData = await response.json();
    return responseData;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const applyPassedReview: (id: string) => Promise<number> = async (id) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/template_apply_passed_preview/".concat(id)
    );
    const responseData = await response.json();
    return responseData["status"];
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const exportObjects = {
  getTemplateList,
  getTemplatesCount,
  getTemplateSchema,
  getPresetWordList,
  createTemplate,
  getTemplate,
  deleteTemplate,
  getTemplateListWithBegin,
  getApplicationTemplateListWithBegin,
  getTemplateWithName,
  getTemplateSchemaWithId,
  updateTemplate,
  getTemplateWordOrderWithId,
  getEmptyTemplateWithId,
  applyPassedReview,
};

export default exportObjects;
