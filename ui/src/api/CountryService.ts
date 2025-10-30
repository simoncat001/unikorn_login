import ApiProvider from "./ApiProvider";

export type Country = {
  id: string;
  name: string;
};

export type CountryResponse = {
  status: number;
  data: Country[];
};

const getCountryList: (
  review_state: string,
  start: number,
  size: number
) => Promise<CountryResponse> = async (review_state, start, size) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/admin/country_list",
      {
        start: start,
        size: size,
        status_filter: review_state,
      }
    );
    const countryList: CountryResponse =
      (await response.json()) as CountryResponse;
    return countryList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getCountryCount: (review_state: string) => Promise<number> = async (
  review_state
) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/admin/country_count",
      {
        status_filter: review_state,
      }
    );
    const responseData = await response.json();
    const countryCount: number = responseData["count"];
    return countryCount;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const deleteCountry: (uuid: string) => Promise<number> = async (uuid) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/admin/delete_country/".concat(uuid)
    );
    const responseData = await response.json();
    return responseData["status"];
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const insertCountryExcel: (file: File) => Promise<number> = async (file) => {
  try {
    let uploadFile = new FormData();
    uploadFile.append("file", file);
    let response = await ApiProvider.apiProviderPost(
      "/api/create_country/",
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

const exportCountry = {
  deleteCountry,
  insertCountryExcel,
  getCountryList,
  getCountryCount,
};

export default exportCountry;
