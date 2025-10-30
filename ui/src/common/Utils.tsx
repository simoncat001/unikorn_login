import { Word, WordJSON } from "../api/WordService";
import { Template, templateJSON } from "../api/TemplateService";
import {
  DevelopmentData,
  DevelopmentDataJSON,
} from "../api/DevelopmentDataService";
import { MGIDApplyJSON, MGIDApply } from "../api/MGIDApplyService";
import { State } from "../containers/SearchBar";
import { RenderTree } from "../components/OverallTreeView";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Map from "./Map";
import { ResultList } from "../api/SearchService";
import { MGID_PATH } from "./Path";

function transformTimeStamp(timeStamp: string) {
  return timeStamp.substring(0, timeStamp.indexOf(" "));
}

function getName(formData: string) {
  if (formData !== undefined && formData.indexOf(":") !== -1) {
    const formDataList = formData.split(":");
    return formDataList.slice(0, formDataList.length - 2).join(":");
  }
  return formData !== undefined ? formData : "";
}

function getType(formData: string) {
  if (formData !== undefined && formData.indexOf(":") !== -1) {
    const formDataList = formData.split(":");
    return formDataList[formDataList.length - 2];
  }
  return "";
}

function getId(formData: string) {
  if (formData !== undefined && formData.indexOf(":") !== -1) {
    const formDataList = formData.split(":");
    return formDataList[formDataList.length - 1];
  }
  return "";
}

//this function is used to get the current layer level
function getCurrentLevel(id: string) {
  return Number(id[id.length - 1]);
}

//this function is used to calculate the corresponding margin size of ojbect or array
function getMarginLevel(id: string) {
  //this is top layer
  if (id.indexOf("item") === -1) {
    return "0px";
  }
  //this is the second layer
  if (getCurrentLevel(id) === 0) {
    return "76px";
  }
  //this is the rest layer
  return "30px";
}

//dynamically calculate the width of the box of the object, in order to make the box of
//delete button in the correct postion
function getObjectWidthLevel(id: string) {
  //this is top layer
  if (id.indexOf("item") === -1) {
    return "712px";
  }
  //this is the second layer
  if (getCurrentLevel(id) === 0) {
    return "636px";
  }
  //this is the rest layer
  return String(636 - 30 * getCurrentLevel(id)) + "px";
}

function getObjectTopMarginLevel(id: string) {
  //this is top layer
  if (id.indexOf("item") === -1) {
    return "8px";
  }
  //this is rest layer
  return "16px";
}

//this function is used to judge whether the id belongs to array or object
//id is like XXX_array_level0 or XXX_object_level0
function judgeArray(id: string) {
  return id[id.length - 8] === "y";
}

//this function is used to judge whether the current element is the sub-element of array
function ifArrayElement(id: string, currentLevel: number) {
  const arrayKeyWord = "array_items_level" + String(currentLevel - 1);
  return id.indexOf(arrayKeyWord) + arrayKeyWord.length === id.length;
}

function validateSingleWord(formData: string) {
  return formData !== undefined && formData.split(":").length < 3;
}

function getQueryTypeList(state: State) {
  var queryType: string[] = ["word"];
  if (!state.word) {
    queryType.pop();
  }
  if (state.templete) {
    queryType.push("templete");
  }
  if (state.studydata) {
    queryType.push("studydata");
  }
  if (state.MGID) {
    queryType.push("MGID");
  }
  return queryType;
}

function getWordElemValue(json_data: WordJSON, value: string): string {
  switch (value) {
    case "chinese_name":
      return json_data.chinese_name;
    case "english_name":
      return json_data.english_name;
    case "abbr":
      return json_data.abbr;
    case "definition":
      return json_data.definition;
    case "data_type":
      return json_data.data_type;
    case "unit":
      return json_data.unit;
    case "source_standard_id":
      return json_data.source_standard_id;
    case "author":
      return json_data.author;
    case "create_timestamp":
      return json_data.create_timestamp;
    case "reviewer":
      return json_data.reviewer;
    case "review_status":
      return json_data.review_status;
    case "rejected_reason":
      return json_data.rejected_reason;
    default:
      return "";
  }
}

function getTemplateElemValue(
  json_schema: templateJSON,
  value: string
): string {
  switch (value) {
    case "title":
      return json_schema.title;
    case "data_generate_method":
      return json_schema.data_generate_method;
    case "institution":
      return json_schema.institution;
    case "template_publish_platform":
      return json_schema.template_publish_platform;
    case "source_standard_number":
      return json_schema.source_standard_number;
    case "source_standard_name":
      return json_schema.source_standard_name;
    case "template_type":
      return json_schema.template_type;
    case "author":
      return json_schema.author;
    case "create_timestamp":
      return json_schema.create_timestamp;
    case "reviewer":
      return json_schema.reviewer;
    case "review_status":
      return json_schema.review_status;
    case "rejected_reason":
      return json_schema.rejected_reason;
    case "citation_count":
      return json_schema.citation_count;
    case "template_MGID":
      return json_schema.template_MGID;
    default:
      return "";
  }
}

function getDataElemValue(
  json_data: DevelopmentDataJSON,
  value: string
): string {
  switch (value) {
    case "template_name":
      return json_data.template_name;
    case "data_generate_method":
      return json_data.data_generate_method;
    case "institution":
      return json_data.institution;
    case "template_type":
      return json_data.template_type;
    case "author":
      return json_data.author;
    case "create_timestamp":
      return json_data.create_timestamp;
    case "reviewer":
      return json_data.reviewer;
    case "review_status":
      return json_data.review_status;
    case "rejected_reason":
      return json_data.rejected_reason;
    case "MGID":
      return json_data.MGID;
    case "citation_template":
      return json_data.citation_template;
    default:
      return "";
  }
}

function getMGIDElemValue(json_data: MGIDApplyJSON, value: string): string {
  switch (value) {
    case "data_title":
      return json_data.data_title;
    case "author_name":
      return json_data.author_name;
    case "author_organization":
      return json_data.author_organization;
    case "abstract":
      return json_data.abstract;
    case "source_type":
      return json_data.source_type;
    case "data_url":
      return json_data.data_url;
    case "custom_field":
      return json_data.custom_field;
    case "MGID_submitter":
      return json_data.MGID_submitter;
    case "create_timestamp":
      return json_data.create_timestamp;
    case "user_comment":
      return json_data.user_comment;
    case "MGID":
      return json_data.MGID;
    default:
      return "";
  }
}

function keyWordHighLight(text: string, key: string) {
  const newTextArr = text.split("").map((t) => {
    return key.toLowerCase().indexOf(t.toLowerCase()) > -1
      ? '<Fragment style="color:#E5B558;">' + t + "</Fragment>"
      : t;
  });
  const newText = newTextArr.join("");
  return <span dangerouslySetInnerHTML={{ __html: newText }} />;
}

export type sortListElem = {
  type: string;
  timeStemp: string;
  wordValue?: Word;
  templateValue?: Template;
  dataValue?: DevelopmentData;
  MGIDValue?: MGIDApply;
};

function sortByTime(x: sortListElem, y: sortListElem) {
  const xTimeStemp = new Date(x.timeStemp);
  const yTimeStemp = new Date(y.timeStemp);
  if (xTimeStemp.valueOf() < yTimeStemp.valueOf()) {
    return -1;
  } else {
    return 1;
  }
}

function getFormTypeLevel(level: number) {
  return "type_level" + level;
}

function getFormSingleLevel(level: number) {
  return "single_level" + level;
}

function getFormArrayLevel(level: number) {
  return "array_level" + level;
}

function getFormArrayItems(level: number) {
  return "array_items_level" + level;
}

function getFormObjectLevel(level: number) {
  return "object_level" + level;
}

function getFormObjectItems(level: number) {
  return "object_items_level" + level;
}

const parseArray: (formData: any, level: number) => RenderTree = (
  formData,
  level
) => {
  const array_level = getFormArrayLevel(level);
  const array_items_level = getFormArrayItems(level);
  return {
    name: formData[array_level],
    children: [parseCreateData(formData[array_items_level], level + 1)],
  };
};

function parseObject(formData: any, level: number) {
  const object_level = getFormObjectLevel(level);
  const object_items_level = getFormObjectItems(level);
  if (Array.isArray(formData[object_items_level])) {
    let treeDataChild: RenderTree[] = [];

    for (var idx in formData[object_items_level]) {
      const formDataItem = formData[object_items_level][idx];
      treeDataChild.push(parseCreateData(formDataItem, level + 1));
    }

    return {
      name: formData[object_level],
      children: treeDataChild,
    };
  } else {
    return { name: formData[object_level] };
  }
}

export function parseCreateData(formDataItem: any, level: number) {
  const type_level = getFormTypeLevel(level);
  switch (formDataItem[type_level]) {
    case "array":
      return parseArray(formDataItem, level);
    case "object":
      return parseObject(formDataItem, level);
  }
  return { name: getName(formDataItem[getFormSingleLevel(level)]) };
}

function ifValidCustomField(customField: string) {
  return customField && customField.search(/^\d{4}$/) !== -1;
}

function getYear(MGID: string) {
  const start: number = MGID.indexOf("/") - 8;
  return MGID.substring(start, start + 4);
}

function getCitation(json: DevelopmentDataJSON) {
  const time = new Date(json.create_timestamp);
  const year = time.getFullYear().toString();
  return (
    json.author +
    "(" +
    year +
    "): " +
    json.title +
    ". " +
    "MGSDB" +
    ", " +
    window.location.host +
    [MGID_PATH, json.MGID].join("/")
  );
}

function mergeSearchList(resultList: ResultList) {
  const wordList: sortListElem[] = resultList.wordResultList.map(
    (itemValue) => {
      return {
        type: "word",
        timeStemp: itemValue.json_data.create_timestamp,
        wordValue: itemValue,
      };
    }
  );

  const templateList: sortListElem[] = resultList.templateResultList.map(
    (itemValue) => {
      return {
        type: "template",
        timeStemp: itemValue.json_schema.create_timestamp,
        templateValue: itemValue,
      };
    }
  );

  const dataList: sortListElem[] = resultList.dataResultList.map(
    (itemValue) => {
      return {
        type: "data",
        timeStemp: itemValue.json_data.create_timestamp,
        dataValue: itemValue,
      };
    }
  );

  const MGIDList: sortListElem[] = resultList.MGIDResultList.map(
    (itemValue) => {
      return {
        type: "MGID",
        timeStemp: itemValue.json_data.create_timestamp,
        MGIDValue: itemValue,
      };
    }
  );

  const mergedList = wordList.concat(templateList, dataList, MGIDList);
  mergedList.sort(exportUtils.sortByTime);
  return mergedList;
}

type CenterSnackbarProps = {
  open: boolean;
  status: number;
  handleClose: () => void;
  ifApply?: boolean;
  ifPublished?: boolean;
};

export const CenterSnackbar: React.FC<CenterSnackbarProps> = ({
  open,
  status,
  handleClose,
  ifApply = "false",
  ifPublished = "false",
}) => {
  function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }
  if (status === 0) {
    return (
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
        open={open}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          {ifApply ? "申请" : ifPublished ? "发表" : "创建"}
          {Map.errorCoderMap[0]}
        </Alert>
      </Snackbar>
    );
  } else {
    return (
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
        open={open}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          {Map.errorCoderMap[status]}
        </Alert>
      </Snackbar>
    );
  }
};

const exportUtils = {
  transformTimeStamp,
  getName,
  getType,
  getId,
  getCurrentLevel,
  getMarginLevel,
  getObjectWidthLevel,
  getObjectTopMarginLevel,
  judgeArray,
  ifArrayElement,
  validateSingleWord,
  getQueryTypeList,
  getWordElemValue,
  getTemplateElemValue,
  getDataElemValue,
  getMGIDElemValue,
  keyWordHighLight,
  sortByTime,
  ifValidCustomField,
  getYear,
  getCitation,
  mergeSearchList,
};

export default exportUtils;
