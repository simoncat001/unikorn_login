import ApiProvider from "./ApiProvider";

export interface Country {
  id: string;
  name: string;
}

export interface CountryResponse {
  status: number;
  data: Country[];
}

const getCountryList = async (
  review_state: string,
  start: number,
  size: number
): Promise<CountryResponse> => {
  try {
    let response = await ApiProvider.post(
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

const getCountryCount = async (
  review_state: string
): Promise<number> => {
  try {
    let response = await ApiProvider.post(
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

const CountryService = {
    getCountryList,
    getCountryCount
};

export default CountryService;
