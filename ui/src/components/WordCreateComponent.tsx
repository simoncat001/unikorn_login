import { FormProps } from "@rjsf/core";
import { JSONSchema7 } from "json-schema";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Form from "@rjsf/material-ui";
import { useState, useEffect } from "react";
import Common from "../common/Common";
import WordService, { WordCreateInfo, Word } from "../api/WordService";
import FieldTemplate from "../components/FieldTemplate";
import ArrayFieldTemplate from "../components/ArrayFieldTemplate";
import { Box } from "@material-ui/core/";
import CreateStatusComponent from "./CreateStatusComponent";
import LoadingComponent from "./LoadingComponent";
import {
  REVIEW_STATUS_DRAFT,
  REVIEW_STATUS_WAITING_REVIEW,
} from "../common/ReviewStatusUtils";
import { CenterSnackbar } from "../common/Utils";
import UserService from "../api/UserService";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    gridList: {
      marginTop: "45px",
      width: "600px",
    },
    buttonBackground: {
      marginTop: "60px",
    },
    submitButton: {
      marginLeft: "56px",
    },
  })
);

const WordCreateComponent: React.FC<{ id?: string; isEdit: boolean }> = ({
  id = "",
  isEdit,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const aButtonStyles = Common.buttonStyles();
  const [wordSchema, setWordSchema] = useState(JSON.parse("{}"));
  const [pageStatus, setPageStatus] = useState("create");
  const [wordId, setWordId] = useState("");
  const [wordCreateData, setWordCreateData] = useState(JSON.parse("{}"));
  const [alertOpen, setAlertOpen] = useState(false);
  const [errorState, setErrorCode] = useState(0);

  var submitFlag = "";
  useEffect(() => {
    void (async () => {
      try {
        const schema: JSONSchema7 = await WordService.getWordCreateSchema();
        setWordSchema(schema);
        if (isEdit) {
          const presetFormData: Word = await WordService.getWord(id);
          setWordCreateData(presetFormData.json_data);
        }
      } catch (e) {
        setWordSchema(null);
      }
    })();
  }, [id, isEdit]);

  var uiSchema: any = {
    unit: { "ui:FieldTemplate": FieldTemplate.FieldTemplateStr },
    "ui:order": [
      "chinese_name",
      "english_name",
      "abbr",
      "definition",
      "data_type",
      "unit",
      "options",
      "source_standard_id",
      "source_standard_name",
    ],
  };

  const wordSchemaProp: any = wordSchema["properties"];
  for (var val in wordSchemaProp) {
    if ("enum" in wordSchemaProp[val]) {
      uiSchema[val] = { "ui:FieldTemplate": FieldTemplate.FieldTemplateEnum };
    } else {
      uiSchema[val] = { "ui:FieldTemplate": FieldTemplate.FieldTemplateStr };
    }
  }
  uiSchema["options"] = {
    "ui:ArrayFieldTemplate": ArrayFieldTemplate.ArrayFieldTemplate,
  };
  const onSubmit = async (form: FormProps<any>) => {
    form.formData["review_status"] = submitFlag;
    if (isEdit) {
      const wordCreateResult: WordCreateInfo = await WordService.updateWord(
        id,
        JSON.stringify(form.formData)
      );
      const status: number = wordCreateResult.status;
      setErrorCode(status);
      setAlertOpen(true);
      if (status === 0) {
        setPageStatus(submitFlag);
        setWordId(id);
      } else if (status === 9) {
        UserService.navigateToErrorPage();
      }
    } else {
      const wordCreateResult: WordCreateInfo = await WordService.createWord(
        JSON.stringify(form.formData)
      );
      const status: number = wordCreateResult.status;
      setErrorCode(status);
      setAlertOpen(true);
      if (status === 0) {
        setPageStatus(submitFlag);
        if (wordCreateResult.data) {
          setWordId(wordCreateResult.data.id);
        }
      } else if (status === 9) {
        UserService.navigateToErrorPage();
      }
    }
  };

  if (!wordSchema.hasOwnProperty("title")) {
    return <LoadingComponent />;
    /* TODO: 修改loading的动画 */
  }
  if (pageStatus === "create") {
    return (
      <Box
        display="flex"
        flexGrow={1}
        flexDirection="column"
        alignItems="center"
      >
        <CenterSnackbar
          open={alertOpen}
          status={errorState}
          handleClose={() => {
            setAlertOpen(false);
          }}
        />
        <Typography
          component="h1"
          variant="h6"
          className={fontClasses.WordCreatetitle}
          style={{ marginTop: "94px" }}
        >
          {isEdit ? "词汇编辑" : "词汇创建"}
        </Typography>
        <Form
          uiSchema={uiSchema}
          schema={wordSchema}
          formData={wordCreateData}
          className={classes.gridList}
          onChange={(form) => {
            setWordCreateData(form.formData);
          }}
          onSubmit={onSubmit}
        >
          <Box
            display="flex"
            justifyContent="center"
            className={classes.buttonBackground}
          >
            <Button
              type="button"
              className={aButtonStyles.Secondary}
              onClick={() => {
                submitFlag = REVIEW_STATUS_DRAFT;
                // 手动触发表单提交
                const submitButton = document.querySelector('[type="submit"]') as HTMLButtonElement;
                if (submitButton) {
                  submitButton.click();
                }
              }}
              disableRipple
              disableElevation
              disableFocusRipple
            >
              保存草稿
            </Button>
            <Button
              type="button"
              className={[aButtonStyles.Primary, classes.submitButton].join(
                " "
              )}
              onClick={() => {
                submitFlag = REVIEW_STATUS_WAITING_REVIEW;
                // 手动触发表单提交
                const submitButton = document.querySelector('[type="submit"]') as HTMLButtonElement;
                if (submitButton) {
                  submitButton.click();
                }
              }}
              disableRipple
              disableElevation
              disableFocusRipple
            >
              提交审核
            </Button>
          </Box>
        </Form>
      </Box>
    );
  } else {
    return (
      <CreateStatusComponent
        status={pageStatus}
        page="word"
        id={wordId}
        isEdit={isEdit}
      />
    );
  }
};

export default WordCreateComponent;
