import { UiSchema } from "@rjsf/core";
import { LayeredWordOrder } from "../../api/TemplateService";
import ApplicationObjectFieldTemplate from "./ApplicationObjectFieldTemplate";
import ApplicationFieldTemplate from "./ApplicationFieldTemplate";
import { DataContent, NumberRange } from "../../api/DevelopmentDataService";

function uiSchemaObject(wordOrder: LayeredWordOrder[]) {
  let templateUiSchema: UiSchema = {
    "ui:ObjectFieldTemplate":
      ApplicationObjectFieldTemplate.ObjectFieldTemplate,
  };
  let templateUiOrder: string[] = [];
  wordOrder.forEach((item) => {
    templateUiOrder.push(item.title);
    if (item.type === "number") {
      templateUiSchema[item.title] = {
        "ui:FieldTemplate": ApplicationFieldTemplate.FieldTemplateNumber,
      };
    } else if (item.type === "number_range") {
      templateUiSchema[item.title] = {
        "ui:ObjectFieldTemplate":
          ApplicationObjectFieldTemplate.ObjectFieldTemplateNumberRange,
        "ui:order": ["start", "end"],
        start: {
          "ui:FieldTemplate":
            ApplicationFieldTemplate.FieldTemplateNumberRangeItem,
        },
        end: {
          "ui:FieldTemplate":
            ApplicationFieldTemplate.FieldTemplateNumberRangeItem,
        },
      };
    } else if (item.type !== "enum_text") {
      templateUiSchema[item.title] = {
        "ui:FieldTemplate": ApplicationFieldTemplate.FieldTemplateStr,
      };
    }
  });
  templateUiSchema["ui:order"] = templateUiOrder;
  return templateUiSchema;
}

function getApplicationDataDownload(applicationDataContent: DataContent[]) {
  enum dataTypeEnum {
    file,
    number,
    numberRange,
    text,
    enumText,
    notShow,
  }
  const dataTypeMap: { [key: string]: dataTypeEnum } = {
    file: dataTypeEnum.file,
    image: dataTypeEnum.file,
    number: dataTypeEnum.number,
    number_range: dataTypeEnum.numberRange,
    string: dataTypeEnum.text,
    date: dataTypeEnum.text,
    enum_text: dataTypeEnum.enumText,
    object: dataTypeEnum.notShow,
    array: dataTypeEnum.notShow,
  };
  let applicationDataDownload: { [key: string]: string } = {};

  applicationDataContent &&
    applicationDataContent.forEach((item) => {
      const dataType = item.type;
      if (dataTypeMap[dataType] === dataTypeEnum.notShow) {
        applicationDataDownload[item.title] = "";
      }
      let contentStr = "";
      if (dataTypeMap[dataType] === dataTypeEnum.text) {
        contentStr = item.content as string;
      }
      if (dataTypeMap[dataType] === dataTypeEnum.number) {
        contentStr = String(item.content) + item.unit;
      }
      if (dataTypeMap[dataType] === dataTypeEnum.numberRange) {
        const numberRangeContent = item.content as NumberRange;
        contentStr =
          numberRangeContent.start + "~" + numberRangeContent.end + item.unit;
      }
      if (dataTypeMap[dataType] === dataTypeEnum.enumText) {
        contentStr = (item.content as string[]).join(", ");
      }
      //TODO: file/image representation
      if (dataTypeMap[dataType] === dataTypeEnum.file) {
        contentStr = item.content as string;
      }
      applicationDataDownload[item.title] = contentStr;
    });
  return applicationDataDownload;
}

const exportApplicationUtils = {
  uiSchemaObject,
  getApplicationDataDownload,
};

export default exportApplicationUtils;
