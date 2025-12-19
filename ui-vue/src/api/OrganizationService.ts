import ApiProvider from "./ApiProvider";

export interface Organization {
  id: string;
  name: string;
}

export interface OrganizationResponse {
  status: number;
  data: Organization[];
}

const getOrganizationListListWithBegin = async (
  beginWord: string
): Promise<string[]> => {
  try {
    let response = await ApiProvider.get(
      "/api/organization_list/".concat(beginWord)
    );
    const organizationList: string[] = (await response.json()) as string[];
    return organizationList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const insertOrganizationExcel = async (
  file: File
): Promise<number> => {
  try {
    let uploadFile = new FormData();
    uploadFile.append("file", file);
    let response = await ApiProvider.postFormData(
      "/api/create_organization/",
      uploadFile
    );
    const insertResult = await response.json();
    return insertResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getOrganizationList = async (
  review_state: string,
  start: number,
  size: number
): Promise<OrganizationResponse> => {
    try {
        let response = await ApiProvider.post(
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

const getOrganizationCount = async (
    review_state: string
  ): Promise<number> => {
    try {
      let response = await ApiProvider.post(
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

const OrganizationService = {
    getOrganizationListListWithBegin,
    insertOrganizationExcel,
    getOrganizationList,
    getOrganizationCount
};

export default OrganizationService;
