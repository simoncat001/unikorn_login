import ApiProvider from "./ApiProvider";

export type Organization = {
  id: string;
  name: string;
};

export type OrganizationResponse = {
  status: number;
  data: Organization[];
};

const getOrganizationListListWithBegin: (
  beginWord: string
) => Promise<string[]> = async (beginWord) => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/organization_list/".concat(beginWord)
    );
    const organizationList: string[] = (await response.json()) as string[];
    return organizationList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const insertOrganizationExcel: (file: File) => Promise<number> = async (
  file
) => {
  try {
    let uploadFile = new FormData();
    uploadFile.append("file", file);
    let response = await ApiProvider.apiProviderPost(
      "/api/create_organization/",
      uploadFile,
      true
    );
    const insertResult = await response.json();
    return insertResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getOrganizationList: (
  review_state: string,
  start: number,
  size: number
) => Promise<OrganizationResponse> = async (review_state, start, size) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/admin/organization_list",
      {
        start: start,
        size: size,
        status_filter: review_state,
      }
    );
    const organizationList: OrganizationResponse =
      (await response.json()) as OrganizationResponse;
    return organizationList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getOrganizationCount: (review_state: string) => Promise<number> = async (
  review_state
) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/admin/organization_count",
      {
        status_filter: review_state,
      }
    );
    const responseData = await response.json();
    const organizationCount: number = responseData["count"];
    return organizationCount;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const deleteOrganization: (uuid: string) => Promise<number> = async (uuid) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/admin/delete_organization/".concat(uuid)
    );
    const responseData = await response.json();
    return responseData["status"];
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const exportOrganizations = {
  getOrganizationListListWithBegin,
  insertOrganizationExcel,
  getOrganizationList,
  getOrganizationCount,
  deleteOrganization,
};

export default exportOrganizations;
