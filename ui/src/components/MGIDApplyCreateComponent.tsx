import { FormProps } from "@rjsf/core";
import { JSONSchema7 } from "json-schema";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Form from "@rjsf/material-ui";
import { useState, useEffect } from "react";
import Common from "../common/Common";
import Map from "../common/Map";
import MGIDApplyService, { MGIDApplyCreateInfo } from "../api/MGIDApplyService";
import FieldTemplate from "../components/FieldTemplate";
import MGIDApplyFieldTemplate from "../components/MGIDApplyCreate/MGIDApplyFieldTemplate";
import { Box } from "@material-ui/core/";
import CreateStatusComponent from "./CreateStatusComponent";
import LoadingComponent from "./LoadingComponent";
import Utils from "../common/Utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    gridList: {
      marginTop: "45px",
      width: "600px",
    },
    buttonBackground: {
      marginTop: "60px",
    },
    mainBox: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      alignItems: "center",
    },
  })
);

export function errorCode(status: number) {
  alert(Map.errorCoderMap[status]);
}

const MGIDApplyCreateComponent: React.FC = () => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const aButtonStyles = Common.buttonStyles();
  const [MGIDApplyCreateSchema, setMGIDApplyCreateSchema] = useState(
    JSON.parse("{}")
  );
  const [pageStatus, setPageStatus] = useState("create");
  const [MGID, setMGID] = useState("");
  const [MGIDApplySchemaCreateData, setMGIDApplySchemaCreateData] = useState(
    JSON.parse("{}")
  );

  useEffect(() => {
    void (async () => {
      try {
        const schema: JSONSchema7 =
          await MGIDApplyService.getMGIDApplyCreateSchema();
        setMGIDApplyCreateSchema(schema);
      } catch (e) {
        setMGIDApplyCreateSchema(null);
      }
    })();
  }, []);

  var uiSchema: any = {
    unit: { "ui:FieldTemplate": FieldTemplate.FieldTemplateStr },
    "ui:order": [
      "data_title",
      "author_name",
      "author_organization",
      "abstract",
      "source_type",
      "data_url",
      "custom_field",
    ],
  };
  const MGIDApplySchemaProp: any = MGIDApplyCreateSchema["properties"];
  for (var val in MGIDApplySchemaProp) {
    if ("enum" in MGIDApplySchemaProp[val]) {
      uiSchema[val] = {
        "ui:FieldTemplate": MGIDApplyFieldTemplate.FieldTemplateEnum,
      };
    } else if (val === "custom_field") {
      uiSchema[val] = {
        "ui:FieldTemplate": MGIDApplyFieldTemplate.FieldTemplateNumber,
      };
    } else if (val === "abstract") {
      uiSchema[val] = {
        "ui:FieldTemplate": MGIDApplyFieldTemplate.FieldTemplateStrMultiline,
      };
    } else if (val === "author_organization") {
      uiSchema[val] = {
        "ui:FieldTemplate": MGIDApplyFieldTemplate.FieldTemplateStrAutoComplete,
      };
    } else {
      uiSchema[val] = {
        "ui:FieldTemplate": MGIDApplyFieldTemplate.FieldTemplateStr,
      };
    }
  }

  const onSubmit = async (form: FormProps<any>) => {
    const validCustomFieldFlag = Utils.ifValidCustomField(
      form.formData["custom_field"]
    );
    if (!validCustomFieldFlag) {
      alert("自定义域请填入四位数字");
      return;
    }

    const MGIDApplyCreateResult: MGIDApplyCreateInfo =
      await MGIDApplyService.createMGIDApply(JSON.stringify(form.formData));
    const status: number = MGIDApplyCreateResult.status;
    if (status !== 0) {
      errorCode(status);
    } else {
      setPageStatus("create_succes");
      if (MGIDApplyCreateResult.data) {
        setMGID(MGIDApplyCreateResult.data.json_data.MGID);
      }
    }
  };

  if (!MGIDApplyCreateSchema.hasOwnProperty("title")) {
    return <LoadingComponent />;
  }

  if (pageStatus === "create") {
    return (
      <Box className={classes.mainBox}>
        <Box marginTop="94px">
          <Typography
            component="h1"
            variant="h6"
            className={fontClasses.WordCreatetitle}
          >
            MGID申请
          </Typography>
        </Box>
        <Form
          uiSchema={uiSchema}
          schema={MGIDApplyCreateSchema}
          formData={MGIDApplySchemaCreateData}
          className={classes.gridList}
          onChange={(form) => {
            setMGIDApplySchemaCreateData(form.formData);
          }}
          onSubmit={onSubmit}
        >
          <Box
            display="flex"
            justifyContent="center"
            className={classes.buttonBackground}
          >
            <Button
              type="submit"
              className={aButtonStyles.Primary}
              disableRipple
              disableElevation
              disableFocusRipple
            >
              提交申请
            </Button>
          </Box>
        </Form>
      </Box>
    );
  } else {
    return (
      <CreateStatusComponent
        status={pageStatus}
        page="MGID_apply"
        id={MGID}
        isEdit={false}
      />
    );
  }
};

export default MGIDApplyCreateComponent;
