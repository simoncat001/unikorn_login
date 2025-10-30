import React, { useState, useEffect } from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Box from "@material-ui/core/Box";
import TemplateService, {
  Template,
  TemplateSchema,
  TemplateCreateInfo,
} from "../api/TemplateService";
import {
  REVIEW_STATUS_DRAFT,
  REVIEW_STATUS_WAITING_REVIEW,
} from "../common/ReviewStatusUtils";
import CreateStatusComponent from "./CreateStatusComponent";
import TemplateTreeView from "./TemplateTreeView";
import TemplateCreateForm from "./TemplateForm/TemplateCreateForm";
import TemplateCreatePresetWord from "./TemplateForm/TemplateCreatePresetWord";
import BasicInformationForm from "./TemplateForm/BasicInformationForm";
import LoadingComponent from "./LoadingComponent";
import Utils, { CenterSnackbar } from "../common/Utils";
import UserService from "../api/UserService";

const useStyles = makeStyles(() =>
  createStyles({
    stepper: {
      width: "369px",
      margin: "0 auto",
      padding: "0",
    },
    mainPart: {
      marginTop: "62px",
    },
  })
);

const TemplateCreateComponent: React.FC<{ id?: string; isEdit: boolean }> = ({
  id = "",
  isEdit,
}) => {
  const classes = useStyles();
  const [basicInformationData, setBasicInformationData] = useState(
    JSON.parse("{}")
  );
  const [basicInformationSchema, setBasicInformationSchema] = useState(
    JSON.parse("{}")
  );
  const [templateCreateData, setTemplateCreateData] = useState(
    JSON.parse("{}")
  );
  const [templateCreateSchema, setTemplateCreateSchema] = useState(
    JSON.parse("{}")
  );
  const [presetWordList, setPresetWordList] = useState<{
    [key: string]: string[];
  }>({});
  const [activeStep, setActiveStep] = useState(0);
  const [pageStatus, setPageStatus] = useState("create");
  const [templateId, setTemplateId] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [errorState, setErrorCode] = useState(0);
  const steps = isEdit
    ? ["模板基本信息", "模板编辑"]
    : ["模板基本信息", "模板创建"];

  useEffect(() => {
    void (async () => {
      try {
        if (isEdit) { //如果是编辑的话
          const templateObject: Template = await TemplateService.getTemplate(
            id
          );
          setBasicInformationData(
            templateObject.json_schema.origin_basic_information
          );
          setTemplateCreateData(
            templateObject.json_schema.origin_schema_create
          );
        }
        const schema: TemplateSchema =
          await TemplateService.getTemplateSchema();
        setBasicInformationSchema(schema["basic_information"]);
        setTemplateCreateSchema(schema["schema_create"]);
        const presetWordListGet: { [key: string]: string[] } =
          await TemplateService.getPresetWordList();
        setPresetWordList(presetWordListGet); //预定义字段
      } catch (e) {
        setBasicInformationSchema(null);
        setTemplateCreateSchema(null);
        setPresetWordList({});
        console.error(e);
      }
    })();
  }, [id, isEdit]);

  const onSubmitTemplateCreatePage = async (
    basicInformationData: any,
    templateCreateData: any,
    submitFlag: string
  ) => {
    var basicInformationDataReview = basicInformationData;
    basicInformationDataReview["review_status"] = submitFlag;
    if (isEdit) {
      const templateCreateResult: TemplateCreateInfo =
        await TemplateService.updateTemplate(
          id,
          basicInformationDataReview.title,
          JSON.stringify(basicInformationDataReview),
          JSON.stringify(templateCreateData)
        );
      const status: number = templateCreateResult.status;
      setErrorCode(status);
      setAlertOpen(true);
      if (status === 0) {
        setPageStatus(submitFlag);
        if (templateCreateResult.data !== undefined) {
          setTemplateId(templateCreateResult.data.id);
        } else {
          setTemplateId(id);
        }
      } else if (status === 9) {
        UserService.navigateToErrorPage();
      }
    } else {
      const templateCreateResult: TemplateCreateInfo =
        await TemplateService.createTemplate( //调用创建模板接口
          basicInformationDataReview.title,
          JSON.stringify(basicInformationDataReview),
          JSON.stringify(templateCreateData) //
        );
      const status: number = templateCreateResult.status;
      setErrorCode(status);
      setAlertOpen(true);
      if (status === 0) {
        setPageStatus(submitFlag);
        if (templateCreateResult.data) {
          setTemplateId(templateCreateResult.data.id);
        }
      } else if (status === 9) {
        UserService.navigateToErrorPage();
      }
    }
  };

  if (!basicInformationSchema.hasOwnProperty("title")) {
    return <LoadingComponent />;
    /* TODO: 加loading的动画 */
  }
  return pageStatus === "create" ? (
    <Box
      display="flex"
      flexGrow={1}
      flexDirection="row"
      className={classes.mainPart}
    >
      <Box display="flex" justifyContent="flex-start">
        {activeStep === 1 ? (
          <TemplateTreeView
            presetWordList={presetWordList}
            basicInformationData={basicInformationData}
            templateCreateData={templateCreateData}
          />
        ) : null}
      </Box>

      <Box
        display="flex"
        alignItems="center"
        flexDirection="column"
        flexGrow={1}
      >
        <Box display="flex"> 
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map((label) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: { optional?: React.ReactNode } = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>
        
        {activeStep === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            style={{ margin: "0px auto" }}
          >
            <CenterSnackbar
              open={alertOpen}
              status={errorState}
              handleClose={() => {
                setAlertOpen(false);
              }}
            />
            <BasicInformationForm //模板基本信息页
              basicInformationSchema={basicInformationSchema}
              basicInformationData={basicInformationData}
              onFirstStepOnchange={(form) => {
                setBasicInformationData(form.formData);
              }}
              onFirstStepSubmit={(form) => {
                if (
                  form.formData["template_type"] === "application" &&
                  form.formData["template_source"] === "unstandard"
                ) {
                  const validCustomFieldFlag = Utils.ifValidCustomField(
                    form.formData["source_standard_number_custom_field"]
                  );
                  if (!validCustomFieldFlag) {
                    setErrorCode(10);
                    setAlertOpen(true);
                    return;
                  }
                }

                setActiveStep(1);
              }}
            />
          </Box>
        ) : activeStep === 1 ? ( //模板创建页，有预设置字段
          <Box display="flex" flexDirection="column">
            <CenterSnackbar
              open={alertOpen}
              status={errorState}
              handleClose={() => {
                setAlertOpen(false);
              }}
            />
            <Box display="flex" justifyContent="center">
              <TemplateCreatePresetWord  //预定义字段
                presetWordList={presetWordList}
                basicInformationData={basicInformationData}
              />
            </Box>
            <Box display="flex" justifyContent="center">
              <TemplateCreateForm
                templateCreateSchema={templateCreateSchema}
                templateCreateData={templateCreateData}
                onSecondStepOnchange={(form) => {
                  setTemplateCreateData(form.formData); //将表的数据转化成TemplateCreateData模板创建数据
                }}
                onBackStep={() => { //上一步
                  setActiveStep(0);
                }}
                onSaveDraft={() => {  //保存草稿
                  onSubmitTemplateCreatePage(
                    basicInformationData,
                    templateCreateData,
                    REVIEW_STATUS_DRAFT
                  );
                }}
                onSecondStepSubmit={() => {  //提交
                  onSubmitTemplateCreatePage(
                    basicInformationData,
                    templateCreateData,
                    REVIEW_STATUS_WAITING_REVIEW
                  );
                }}
              />
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  ) : (
    <CreateStatusComponent
      status={pageStatus}
      page="template"
      id={templateId}
      isEdit={isEdit}
    />
  );
};

export default TemplateCreateComponent;
