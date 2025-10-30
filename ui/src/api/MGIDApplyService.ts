import ApiProvider from "./ApiProvider";
import { JSONSchema7 } from "json-schema";

export type MGIDApplyJSON = {
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
};

export type MGIDApply = {
  id: string;
  template_id: string;
  json_data: MGIDApplyJSON;
};

export type MGIDApplyGet = {
  type: string;
  data: MGIDApply;
};

export type MGIDApplyCreateInfo = {
  status: number;
  data?: MGIDApply;
};

export interface MGIDListData {
  uuid: string;
  data_title: string;
  author_name: string;
  MGID: string;
  data_url: string;
  pubTime?: string;
}

export type MGIDResponse = {
  status: number;
  data: MGIDApply[];
};

const getMGIDApplyCreateSchema: () => Promise<JSONSchema7> = async () => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/get_MGID_apply_schema"
    );
    const schema: JSONSchema7 = (await response.json()) as JSONSchema7;
    return schema;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const createMGIDApply: (data: string) => Promise<MGIDApplyCreateInfo> = async (
  data
) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/MGID_apply/", {
      json_data: data,
    });
    const MGIDApplyCreateInfoObject: MGIDApplyCreateInfo =
      (await response.json()) as MGIDApplyCreateInfo;
    return MGIDApplyCreateInfoObject;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getMGID: (MGID: string) => Promise<MGIDApplyGet> = async (MGID) => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/get_MGID/".concat(MGID)
    );
    const MGIDObject: MGIDApplyGet = (await response.json()) as MGIDApplyGet;
    return MGIDObject;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getMGIDList: (start: number, size: number) => Promise<MGIDResponse> =
  async (start, size) => {
    try {
      const response = await ApiProvider.apiProviderPost("/api/MGID_list", {
        start: start,
        size: size,
        status_filter: "",
      });
      const responseData = await response.json();
      return responseData as MGIDResponse;
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

const getMGIDCount: () => Promise<number> = async () => {
  try {
    let response = await ApiProvider.apiProviderGet("/api/MGID_count");
    const responseData = await response.json();
    return responseData["count"] as number;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const exportMGIDApply = {
  getMGIDApplyCreateSchema,
  createMGIDApply,
  getMGID,
  getMGIDList,
  getMGIDCount,
};

export default exportMGIDApply;
