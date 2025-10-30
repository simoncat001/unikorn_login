import React, { useRef } from "react";
import { JSONSchema7 } from "json-schema";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { FormProps } from "@rjsf/core";
import Form from "@rjsf/material-ui";
import { Box, Button, Typography } from "@material-ui/core";

import ArrayFieldTemplate from "../ArrayFieldTemplate";
import ObjectFieldTemplate from "../ObjectFieldTemplate";
import FieldTemplate from "../FieldTemplate";
import Icon from "../Icon";
import Common from "../../common/Common";
import Map from "../../common/Map";

const useStyles = makeStyles(() =>
  createStyles({
    btnGroup: {
      margin: "60px auto",
      alignItems: "center",
      width: "712px",
    },
  })
);

const TemplateCreateForm: React.FC<{
  templateCreateSchema: JSONSchema7;
  templateCreateData: any;
  onSecondStepOnchange: (form: FormProps<any>) => void;
  onBackStep: () => void;
  onSaveDraft: () => void;
  onSecondStepSubmit: () => void;
}> = ({
  templateCreateSchema,
  templateCreateData,
  onSecondStepOnchange,
  onBackStep,
  onSaveDraft,
  onSecondStepSubmit,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const buttonClasses = Common.buttonStyles();

  function uiFieldTemplateSingle(level: number) {
    return {
      "ui:FieldTemplate": FieldTemplate.FieldTemplateStrAutoComplete,
    };
  }
  const uiFieldTemplateName = {
    "ui:FieldTemplate": FieldTemplate.FieldTemplateName,
  };
  const uiFieldTemplateDataType = {
    "ui:FieldTemplate": FieldTemplate.FieldTemplateType,
  };
  const uiFieldTemplateCheckbox = {
    "ui:FieldTemplate": FieldTemplate.FieldTemplateCheckbox,
  };
  function uiSchemaRecur(level: number) {
    var uiSchema: any = JSON.parse("{}");
    const singleLevel = "single_level".concat(level.toString());
    const objectLevel = "object_level".concat(level.toString());
    const objectItemsLevel = "object_items_level".concat(level.toString());
    const arrayLevel = "array_level".concat(level.toString());
    const arrayItemsLevel = "array_items_level".concat(level.toString());
    const typeLevel = "type_level".concat(level.toString());
    if (level === 0) {
      uiSchema["level0"] = { items: {} };
      uiSchema["level0"]["items"] = {
        "ui:ObjectFieldTemplate":
          ObjectFieldTemplate.ObjectFieldTemplateNotLastLayer,
      };
      uiSchema["level0"]["items"][singleLevel] = uiFieldTemplateSingle(level);
      uiSchema["level0"]["items"][singleLevel + "_required"] =
        uiFieldTemplateCheckbox;
      uiSchema["level0"]["items"][objectItemsLevel] = {
        items: uiSchemaRecur(level + 1),
        "ui:ArrayFieldTemplate": ArrayFieldTemplate.ArrayFieldTemplateObject,
      };
      uiSchema["level0"]["items"][objectLevel] = uiFieldTemplateName;
      uiSchema["level0"]["items"][arrayItemsLevel] = uiSchemaRecur(level + 1);
      uiSchema["level0"]["items"][arrayLevel] = uiFieldTemplateName;
      uiSchema["level0"]["items"][arrayLevel + "_required"] = {
        "ui:FieldTemplate": FieldTemplate.FieldTemplateCheckbox,
      };
      uiSchema["level0"]["items"][arrayItemsLevel]["ui:FieldTemplate"] =
        FieldTemplate.FieldTemplateArray;
      uiSchema["level0"]["items"][typeLevel] = uiFieldTemplateDataType;
      return uiSchema;
    }

    uiSchema[singleLevel] = uiFieldTemplateSingle(level);
    uiSchema[singleLevel + "_required"] = uiFieldTemplateCheckbox;
    if (level === Map.templateRecursiveLayer) {
      uiSchema["ui:ObjectFieldTemplate"] =
        ObjectFieldTemplate.ObjectFieldTemplateLastLayer;
      return uiSchema;
    }
    uiSchema["ui:ObjectFieldTemplate"] =
      ObjectFieldTemplate.ObjectFieldTemplateNotLastLayer;
    uiSchema[objectItemsLevel] = {
      items: uiSchemaRecur(level + 1),
      "ui:ArrayFieldTemplate": ArrayFieldTemplate.ArrayFieldTemplateObject,
    };
    uiSchema[objectLevel] = uiFieldTemplateName;
    uiSchema[arrayItemsLevel] = uiSchemaRecur(level + 1);
    uiSchema[arrayLevel] = uiFieldTemplateName;
    uiSchema[arrayLevel + "_required"] = uiFieldTemplateCheckbox;
    uiSchema[arrayItemsLevel]["ui:FieldTemplate"] =
      FieldTemplate.FieldTemplateArray;
    uiSchema[typeLevel] = uiFieldTemplateDataType;
    return uiSchema;
  }

  var uiSchema: any = uiSchemaRecur(0);
  uiSchema["level0"]["ui:ArrayFieldTemplate"] =
    ArrayFieldTemplate.ArrayFieldTemplateObject;

  const refOfSubmitButtonSelector = useRef<HTMLInputElement>(null);

  return (
    <Form
      idPrefix="createTemplateForm"
      formData={templateCreateData}
      schema={templateCreateSchema}
      uiSchema={uiSchema}
      onChange={onSecondStepOnchange}
      onSubmit={(e) => {
        if (refOfSubmitButtonSelector.current) {
          switch (refOfSubmitButtonSelector.current.value) {
            case "next":
              onBackStep();
              break;
            case "draft":
              onSaveDraft();
              break;
            case "submit":
              onSecondStepSubmit();
              break;
          }
        }
      }}
    >
      <input
        ref={refOfSubmitButtonSelector}
        type="hidden"
        name="submitbutton"
        value="default"
      />
      <Box
        display="flex"
        justifyContent="space-between"
        className={classes.btnGroup}
      >
        <Button //底部的上一页、保存草稿、提交
          type="submit"
          className={buttonClasses.NoHoverBorderButton}
          onClick={() => {
            if (refOfSubmitButtonSelector.current) {
              refOfSubmitButtonSelector.current.value = "next";
            }
          }}
          disableRipple
          disableElevation
          disableFocusRipple
        >
          <Box
            display="flex"
            flexDirection="row"
            style={{ alignItems: "center" }}
          >
            {Icon.backIcon}
            <Typography
              className={fontClasses.LastNextStep}
              style={{ letterSpacing: "0.4em" }}
            >
              上一步
            </Typography>
          </Box>
        </Button>
        <Box display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            className={buttonClasses.Secondary}
            style={{
              marginRight: "auto",
            }}
            onClick={() => {
              if (refOfSubmitButtonSelector.current) {
                refOfSubmitButtonSelector.current.value = "draft";
              }
            }}
            disableRipple
            disableElevation
            disableFocusRipple
          >
            保存草稿
          </Button>
          <Button
            type="submit"
            className={buttonClasses.Primary}
            style={{
              marginLeft: "24px",
            }}
            onClick={() => {
              if (refOfSubmitButtonSelector.current) {
                refOfSubmitButtonSelector.current.value = "submit";
              }
            }}
            disableRipple
            disableElevation
            disableFocusRipple
          >
            提交审核
          </Button>
        </Box>
      </Box>
    </Form>
  );
};

export default TemplateCreateForm;
