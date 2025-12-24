import { ResultList } from "../api/SearchService";
import { Word } from "../api/WordService";
import { Template } from "../api/TemplateService";
import { DevelopmentData } from "../api/DevelopmentDataService";
import { MGIDApply } from "../api/MGIDApplyService";

export type SortListElem = 
  | { type: 'word'; timeStemp: string; wordValue: Word }
  | { type: 'template'; timeStemp: string; templateValue: Template }
  | { type: 'data'; timeStemp: string; dataValue: DevelopmentData }
  | { type: 'MGID'; timeStemp: string; MGIDValue: MGIDApply };

export function sortByTime(x: SortListElem, y: SortListElem) {
  const xTimeStemp = new Date(x.timeStemp);
  const yTimeStemp = new Date(y.timeStemp);
  if (xTimeStemp.valueOf() < yTimeStemp.valueOf()) {
    return 1; // Descending order usually? React code had -1 for <, so ascending?
    // React code:
    // if (xTimeStemp.valueOf() < yTimeStemp.valueOf()) { return -1; } else { return 1; }
    // This is ascending order (oldest first). Usually search results are newest first.
    // Let's check React behavior. If it returns -1 when x < y, then x comes first. So smaller timestamp first. Oldest first.
    // Maybe I should stick to React logic.
  } else {
    return -1;
  }
}

// React implementation was:
// if (xTimeStemp.valueOf() < yTimeStemp.valueOf()) { return -1; } else { return 1; }
// This sorts ascending.

export function mergeSearchList(resultList: ResultList): SortListElem[] {
  const wordList: SortListElem[] = resultList.wordResultList.map(
    (itemValue) => {
      return {
        type: "word",
        timeStemp: itemValue.create_timestamp || itemValue.json_data?.create_timestamp, // Check where timestamp is
        wordValue: itemValue,
      };
    }
  );

  const templateList: SortListElem[] = resultList.templateResultList.map(
    (itemValue) => {
      return {
        type: "template",
        timeStemp: itemValue.json_schema.create_timestamp,
        templateValue: itemValue,
      };
    }
  );

  const dataList: SortListElem[] = resultList.dataResultList.map(
    (itemValue) => {
      return {
        type: "data",
        timeStemp: itemValue.json_data.create_timestamp,
        dataValue: itemValue,
      };
    }
  );

  const MGIDList: SortListElem[] = resultList.MGIDResultList.map(
    (itemValue) => {
      return {
        type: "MGID",
        timeStemp: itemValue.json_data.create_timestamp,
        MGIDValue: itemValue,
      };
    }
  );

  const mergedList = wordList.concat(templateList, dataList, MGIDList);
  mergedList.sort(sortByTime);
  return mergedList;
}

export function getQueryTypeList(state: { word: boolean; template: boolean; studydata: boolean; MGID: boolean }) {
    const queryType: string[] = [];
    if (state.word) {
      queryType.push("word");
    }
    if (state.template) {
      queryType.push("template");
    }
    if (state.studydata) {
      queryType.push("data");
    }
    if (state.MGID) {
      queryType.push("MGID");
    }
    return queryType;
  }
