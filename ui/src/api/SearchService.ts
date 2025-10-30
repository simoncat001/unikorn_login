import { Template } from "./TemplateService";
import { Word } from "./WordService";
import { DevelopmentData } from "./DevelopmentDataService";
import { MGIDApply } from "./MGIDApplyService";
import ApiProvider from "./ApiProvider";

export type ResultList = {
  wordResultList: Word[];
  templateResultList: Template[];
  dataResultList: DevelopmentData[];
  MGIDResultList: MGIDApply[];
};

const getQuery: (
  query: string,
  queryType: string[],
  start: number,
  size: number
) => Promise<ResultList> = async (query, queryType, start, size) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/unauth/search/", {
      query: query,
      queryType: queryType,
      start: start,
      size: size,
    });
    const responseData = await response.json();
    const queryList: ResultList = responseData as ResultList;
    return queryList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const searchResult = {
  getQuery,
};

export default searchResult;
