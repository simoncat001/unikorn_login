import { makeStyles, createStyles } from "@material-ui/core/styles";
import Form from "@rjsf/material-ui";
import { FormProps } from "@rjsf/core";
import { Box, Button, Typography } from "@material-ui/core";
import { JSONSchema7 } from "json-schema";

import FieldTemplate from "../FieldTemplate";
import Common from "../../common/Common";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";

const useStyles = makeStyles(() =>
  createStyles({
    draft: {
      display: "flex",
      width: "580px",
      marginTop: "60px",
      flexDirection: "column",
      marginLeft: "auto",
      marginRight: "auto",
      justifyContent: "center",
    },
  })
);

const BasicInformationForm: React.FC<{
  basicInformationSchema: JSONSchema7;
  basicInformationData: any;
  onFirstStepOnchange: (form: FormProps<any>) => void;
  onFirstStepSubmit: (form: FormProps<any>) => void;
}> = ({
  basicInformationSchema,
  basicInformationData,
  onFirstStepOnchange,
  onFirstStepSubmit,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const buttonClasses = Common.buttonStyles();
  const schema: JSONSchema7 = basicInformationSchema;
  var uiSchema: any = {
    "ui:order": [
      "title",
      "data_generate_method",
      "institution",
      "template_publish_platform",
      "template_type",
      "template_source",
      "source_standard_number",
      "source_standard_name",
      "source_standard_number_custom_field",
      "source_standard_name_custom",
    ],
  };
  const schemaProp: any = schema["properties"];
  for (var val in schemaProp) {
    if (!("enum" in schemaProp[val])) {
      uiSchema[val] = { "ui:FieldTemplate": FieldTemplate.FieldTemplateStr };
    }
  }
  const extraStrProp = [
    "source_standard_number",
    "source_standard_name",
    "source_standard_name_custom",
  ];
  uiSchema["data_generate_method"] = {
    "ui:FieldTemplate": FieldTemplate.FieldTemplateEnumRadioRow,
  };
  uiSchema["template_source"] = {
    "ui:FieldTemplate": FieldTemplate.FieldTemplateEnumRadioRow,
  };
  uiSchema["template_type"] = {
    "ui:FieldTemplate": FieldTemplate.FieldTemplateEnumRadioColumn,
  };
  for (var index in extraStrProp) {
    uiSchema[extraStrProp[index]] = {
      "ui:FieldTemplate": FieldTemplate.FieldTemplateStr,
    };
  }
  uiSchema["source_standard_number_custom_field"] = {
    "ui:FieldTemplate": FieldTemplate.FieldTemplateStrCustomField,
  };

  return (
    <Form
      idPrefix="basicInformationForm"
      formData={basicInformationData}
      schema={basicInformationSchema}
      uiSchema={uiSchema}
      onChange={onFirstStepOnchange}
      onSubmit={onFirstStepSubmit}
      className={classes.draft}
    >
      <Box
        display="flex"
        justifyContent="flex-end"
        style={{ marginTop: "50px" }}
      >
        <Button
          type="submit"
          className={buttonClasses.NoHoverBorderButton}
          disableRipple
          disableElevation
          disableFocusRipple
        >
          <Typography className={fontClasses.LastNextStep}>下 一 步</Typography>
          <NavigateNextIcon />
        </Button>
      </Box>
    </Form>
  );
};

export default BasicInformationForm;
