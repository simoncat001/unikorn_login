import { createStyles, makeStyles } from "@material-ui/core/styles";
import { LayeredWordOrder } from "../../api/TemplateService";
import DevelopmentObjectFieldTemplate from "./DevelopmentObjectFieldTemplate";
import DevelopmentArrayFieldTemplate from "./DevelopmentArrayFieldTemplate";
import DevelopmentStringFieldTemplate from "./DevelopmentStringFieldTemplate";
import DevelopmentNumberFieldTemplate from "./DevelopmentNumberFieldTemplate";
import DevelopmentDateFieldTemplate from "./DevelopmentDateFieldTemplate";
import DevelopmentCheckBoxTemplate from "./DevelopmentCheckboxTemplate";
import DevelopmentFileTemplate from "./DevelopmentFileTemplate";
import Map from "../../common/Map";
import Common from "../../common/Common";
import { DEVELOPMENT_DATA_PATH } from "../../common/Path";

import { UiSchema } from "@rjsf/core";
import { JSONSchema7 } from "json-schema";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import Icons from "../Icon";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItem from "@material-ui/core/ListItem";
import DescriptionIcon from "@material-ui/icons/Description";

const aColor = Common.allColor;

const useStyles = makeStyles(() =>
  createStyles({
    link: {
      fontSize: "14px",
      color: aColor.primaryColor,
    },
  })
);

function uiSchemaObject(wordOrder: LayeredWordOrder[], level: number) {
  var uiSchema: any = JSON.parse("{}");
  uiSchema["ui:order"] = [];
  if (level === 0) {
    uiSchema["ui:ObjectFieldTemplate"] =
      DevelopmentObjectFieldTemplate.ObjectFieldTemplateForm;
  } else {
    uiSchema["ui:ObjectFieldTemplate"] =
      DevelopmentObjectFieldTemplate.ObjectFieldTemplateItem;
  }

  var lastLayerContainContainers: boolean = false;
  for (let wordItem of wordOrder) {
    if (wordItem.type === "object" || wordItem.type === "array") {
      lastLayerContainContainers = true;
    }
  }
  if (level === 0) {
    lastLayerContainContainers = true;
  }
  for (let wordItem of wordOrder) {
    uiSchema["ui:order"].push(wordItem.title);
    uiSchema[wordItem.title] = uiSchemaRecur(
      wordItem,
      level,
      lastLayerContainContainers,
      false
    );
  }

  uiSchema[Map.MGIDCustomFieldTitle] = {
    "ui:FieldTemplate":
      DevelopmentStringFieldTemplate.FieldTemplateDevelopmentMGIDCustomField,
  };

  return uiSchema;
}

function uiSchemaRecur(
  wordOrder: LayeredWordOrder,
  level: number,
  lastLayerContainContainers: boolean,
  elementInArray: boolean
) {
  var uiSchema: any = JSON.parse("{}");

  if (wordOrder.type === "object") {
    uiSchema = uiSchemaObject(wordOrder.order, level + 1);
  } else if (wordOrder.type === "string" || wordOrder.type === "MGID") {
    if (lastLayerContainContainers === true) {
      return {
        "ui:FieldTemplate":
          DevelopmentStringFieldTemplate.FieldTemplateDevelopmentStr,
      };
    } else if (elementInArray) {
      return {
        "ui:FieldTemplate":
          DevelopmentStringFieldTemplate.FieldTemplateDevelopmentStrArrayItem,
      };
    } else {
      return {
        "ui:FieldTemplate":
          DevelopmentStringFieldTemplate.FieldTemplateDevelopmentStrObjectItem,
      };
    }
  } else if (wordOrder.type === "number") {
    if (lastLayerContainContainers === true) {
      return {
        "ui:FieldTemplate":
          DevelopmentNumberFieldTemplate.FieldTemplateDevelopmentNumber,
      };
    } else if (elementInArray) {
      return {
        "ui:FieldTemplate":
          DevelopmentNumberFieldTemplate.FieldTemplateDevelopmentNumberArrayItem,
      };
    } else {
      return {
        "ui:FieldTemplate":
          DevelopmentNumberFieldTemplate.FieldTemplateDevelopmentNumberObjectItem,
      };
    }
  } else if (wordOrder.type === "enum_text") {
    if (lastLayerContainContainers === true) {
      return {
        "ui:widget": DevelopmentCheckBoxTemplate.CheckBoxesWidget,
      };
    } else if (elementInArray) {
      return {
        "ui:widget": DevelopmentCheckBoxTemplate.CheckBoxesWidgetArrayItem,
      };
    } else {
      return {
        "ui:widget": DevelopmentCheckBoxTemplate.CheckBoxesWidgetObjectItem,
      };
    }
  } else if (wordOrder.type === "number_range") {
    var number_range_schema = {
      start: {
        "ui:FieldTemplate":
          DevelopmentNumberFieldTemplate.FieldTemplateDevelopmentNumberRange,
      },
      end: {
        "ui:FieldTemplate":
          DevelopmentNumberFieldTemplate.FieldTemplateDevelopmentNumberRange,
      },
      "ui:order": ["start", "end"],
      "ui:ObjectFieldTemplate":
        DevelopmentObjectFieldTemplate.ObjectFieldTemplateNumRange,
    };
    if (lastLayerContainContainers === true) {
      number_range_schema["ui:ObjectFieldTemplate"] =
        DevelopmentObjectFieldTemplate.ObjectFieldTemplateNumRange;
    } else if (elementInArray) {
      number_range_schema["ui:ObjectFieldTemplate"] =
        DevelopmentObjectFieldTemplate.ObjectFieldTemplateNumRangeArrayItem;
    } else {
      number_range_schema["ui:ObjectFieldTemplate"] =
        DevelopmentObjectFieldTemplate.ObjectFieldTemplateNumRangeObjectItem;
    }
    return number_range_schema;
  } else if (wordOrder.type === "date") {
    if (lastLayerContainContainers === true) {
      return {
        "ui:FieldTemplate": DevelopmentDateFieldTemplate.FieldTemplateDate,
      };
    } else if (elementInArray) {
      return {
        "ui:FieldTemplate":
          DevelopmentDateFieldTemplate.FieldTemplateDateArrayItem,
      };
    } else {
      return {
        "ui:FieldTemplate":
          DevelopmentDateFieldTemplate.FieldTemplateDateObjectItem,
      };
    }
  } else if (wordOrder.type === "file" || wordOrder.type === "image") {
    if (lastLayerContainContainers === true) {
      return {
        "ui:widget": DevelopmentFileTemplate.FileWidget,
      };
    } else if (elementInArray) {
      return {
        "ui:widget": DevelopmentFileTemplate.FileWidgetArrayItem,
      };
    } else {
      return {
        "ui:widget": DevelopmentFileTemplate.FileWidgetObjectItem,
      };
    }
  } else if (wordOrder.type === "array") {
    uiSchema["items"] = uiSchemaRecur(
      wordOrder.order[0],
      level + 1,
      false,
      true
    );
    uiSchema["ui:ArrayFieldTemplate"] =
      DevelopmentArrayFieldTemplate.ArrayFieldTemplateDevelopmentData;
  }

  return uiSchema;
}

interface optionType {
  label: string;
  value: string;
}

function GetCheckboxGroup(
  id: string,
  schema: JSONSchema7,
  label: string,
  options: NonNullable<UiSchema["ui:options"]>,
  value: string[],
  required: boolean,
  onChange: (value: string[]) => void
) {
  const selectValue = (value: string, selected: string[], all: string[]) => {
    const at = all.indexOf(value);
    const updated = selected.slice(0, at).concat(value, selected.slice(at));
    /* As inserting values at predefined index positions doesn't work with empty arrays,
    we need to reorder the updated selection to match the initial order
    */
    return updated.sort((a, b) => all.indexOf(a) - all.indexOf(b));
  };
  const deselectValue = (value: string, selected: string[]) => {
    return selected.filter((v: string) => v !== value);
  };
  const { enumOptions } = options;
  const onChangeCheckBox =
    (option: optionType) =>
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      const all = (enumOptions as []).map(({ value }) => value);
      if (checked) {
        onChange(selectValue(option.value, value, all));
      } else {
        onChange(deselectValue(option.value, value));
      }
    };

  return (
    <FormGroup>
      {(enumOptions as []).map((option: optionType, index: number) => {
        const checked = value.indexOf(option.value) !== -1;
        const checkbox = (
          <Checkbox
            id={`${id}_${index}`}
            checked={checked}
            onChange={onChangeCheckBox(option)}
            checkedIcon={Icons.checkboxIcon}
            icon={Icons.checkboxOutLineIcon}
            disableRipple
          />
        );
        return (
          <FormControlLabel
            control={checkbox}
            key={index}
            label={option.label}
          />
        );
      })}
    </FormGroup>
  );
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface Props {
  filesInfo?: FileInfo[];
}

interface CustomProcessFileProcess {
  dataURL: string;
  name: string;
  size: number;
  type: string;
}

function dataURItoBlob(dataURI: string) {
  // Split metadata from data
  const splitted = dataURI.split(",");
  // Split params
  const params = splitted[0].split(";");
  // Get mime-type from params
  const type = params[0].replace("data:", "");
  // Filter the name property from params
  const properties = params.filter((param) => {
    return param.split("=")[0] === "name";
  });
  // Look for the name and use unknown if no name property.
  let name;
  if (properties.length !== 1) {
    name = "unknown";
  } else {
    // Because we filtered out the other property,
    // we only have the name case here.
    name = properties[0].split("=")[1];
  }

  // Built the Uint8Array Blob parameter from the base64 string.
  const binary = atob(splitted[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  // Create the blob object
  const blob = new window.Blob([new Uint8Array(array)], { type });

  return { blob, name };
}

function addNameToDataURL(dataURL: string, name: string) {
  return dataURL.replace(";base64", `;name=${encodeURIComponent(name)};base64`);
}

// FileList contain type can't be traked
function processFile(file: File) {
  const { name, size, type } = file;
  return new Promise<CustomProcessFileProcess>((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const onloadResult: CustomProcessFileProcess = {
        dataURL: addNameToDataURL(event.target?.result as string, name),
        name,
        size,
        type,
      };
      resolve(onloadResult);
    };
    reader.readAsDataURL(file);
  });
}

function processFiles(files: FileList) {
  const test = Array.prototype.map.call(files, processFile);
  return Promise.all(test as CustomProcessFileProcess[]);
}

const FilesInfo = ({ filesInfo }: Props) => {
  if (!filesInfo || filesInfo.length === 0) {
    return null;
  }
  return (
    <List id="file-info">
      {filesInfo.map((fileInfo: FileInfo, key: number) => {
        const { name } = fileInfo;
        return (
          <ListItem key={key}>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary={name} />
          </ListItem>
        );
      })}
    </List>
  );
};

//TODO: remove this hack
export const RouteToCenterDev: React.FC<{ title: string }> = ({ title }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  if (title.match(/关联.*MGID/)) {
    return (
      <Typography className={fontClasses.unboldFont}>
        请从
        <Link
          className={classes.link}
          target="_blank"
          href={DEVELOPMENT_DATA_PATH}
        >
          个人数据中心
        </Link>
        复制所关联数据的MGID，粘贴到此处
      </Typography>
    );
  }
  return null;
};

const exportDevelopmentUtils = {
  uiSchemaObject,
  GetCheckboxGroup,
  dataURItoBlob,
  addNameToDataURL,
  processFiles,
  FilesInfo,
};

export default exportDevelopmentUtils;
