import { useCallback, useState, useEffect, useRef, ReactNode } from "react";
import Form, { FormProps } from '@rjsf/core';
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import LinearProgress from "@material-ui/core/LinearProgress";
import Tooltip from "@material-ui/core/Tooltip";
import Common from "../../common/Common";
import Map from "../../common/Map";
import Utils, { CenterSnackbar } from "../../common/Utils";
import TemplateService from "../../api/TemplateService";
import DevelopmentDataService, {
  DevelopmentData,
} from "../../api/DevelopmentDataService";
import {
  REVIEW_STATUS_DRAFT,
  REVIEW_STATUS_WAITING_REVIEW,
} from "../../common/ReviewStatusUtils";
import { JSONSchema7 } from "json-schema";
import { LayeredWordOrder } from "../../api/TemplateService";
import DevelopmentUtils from "./DevelopmentDataUtils";
import LoadingComponent from "../LoadingComponent";
import UserService from "../../api/UserService";
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CircularProgress from "@material-ui/core/CircularProgress";

// 自定义表单组件，解决类型扩展问题
interface CustomFormProps extends FormProps<any> {
  onFileFieldChange?: (fieldPath: string, newValue: any) => Promise<any>;
}

const CustomForm: React.FC<CustomFormProps> = ({ onFileFieldChange, ...formProps }) => {
  // 这里可以添加额外逻辑，如自定义字段处理
  return <Form {...formProps} />;
};


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    boxCenter: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    rowCenter: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "70px",
      marginBottom: "70px",
    },
    fileUploadContainer: {
     width: "100%",
     margin: "20px 0",
     padding: "10px",
     border: "1px solid #e0e0e0",
     borderRadius: "4px",
     backgroundColor: "#f9f9f9",
   },
   uploadSection: {
     margin: "10px 0",
     padding: "10px",
   },
   progressContainer: {
     display: "flex",
     alignItems: "center",
     margin: "5px 0",
   },
   progressBar: {
     flexGrow: 1,
     marginRight: "10px",
   },
   statusIcon: {
     marginLeft: "10px",
   },
   uploadControls: {
     display: "flex",
     justifyContent: "space-between",
     marginTop: "10px",
   },
   errorText: {
     color: theme.palette.error.main,
     fontSize: "0.8rem",
     marginTop: "5px",
   },
   retryButton: {
     marginLeft: "10px",
   }
  })
);

const commonProps = {
  buttonDisable: {
    disableRipple: true,
    disableElevation: true,
    disableFocusRipple: true,
  },
};

const WebSubmit: React.FC<{
  templateSchema: JSONSchema7;
  currentTemplateId: string;
  setPageStatus: React.Dispatch<React.SetStateAction<string>>;
  setDevDataId: React.Dispatch<React.SetStateAction<string>>;
  devDataId?: string;
  isEdit: boolean;
  fileToWebFlag?: boolean;
  devCreateDataFromFile?: JSON;
  onFileUploadProgress?: (fieldPath: string, progress: number, status: 'idle' | 'uploading' | 'completed' | 'error') => void;
  fileUploadStatus?: {[key: string]: { progress: number; status: 'idle' | 'uploading' | 'completed' | 'error' }};
}> = ({
  templateSchema,
  currentTemplateId,
  setPageStatus,
  setDevDataId,
  devDataId = "",
  isEdit,
  fileToWebFlag = false,
  devCreateDataFromFile,
  onFileUploadProgress,
  fileUploadStatus = {}
}) => {
  const aButtonStyles = Common.buttonStyles();
  const classes = useStyles();
  const [templateWordOrder, setTemplateWordOrder] =
    useState<LayeredWordOrder[]>();

  const [devCreateData, setDevCreateData] = useState(JSON.parse("{}"));
  const [isLoaded, setIsLoaded] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [errorState, setErrorCode] = useState(0);
  const [submitFlag, setSubmitFlag] = useState(""); // 状态提升
  const latestFilesRef = useRef<Record<string, File | File[]>>({});

  const resolveSchemaByPath = useCallback(
    (fieldPath: string): JSONSchema7 | undefined => {
      if (!templateSchema) {
        return undefined;
      }

      const segments = fieldPath.split(".").filter(Boolean);
      let current: JSONSchema7 | undefined = templateSchema;

      for (const segment of segments) {
        if (!current) {
          return undefined;
        }

        if (current.type === "array") {
          const items = current.items;
          if (!items || typeof items !== "object") {
            return undefined;
          }
          current = items as JSONSchema7;
          if (/^\d+$/.test(segment)) {
            continue;
          }
        }

        if (!current.properties || !current.properties[segment]) {
          return undefined;
        }

        const next = current.properties[segment];
        if (!next || typeof next !== "object") {
          return undefined;
        }

        current = next as JSONSchema7;
      }

      return current;
    },
    [templateSchema]
  );

  const isFileField = useCallback(
    (fieldPath: string) => {
      const schemaForField = resolveSchemaByPath(fieldPath);
      if (!schemaForField) {
        return false;
      }

      if (schemaForField.type === "string") {
        return (
          schemaForField.format === "data-url" ||
          schemaForField.contentEncoding === "base64"
        );
      }

      if (
        schemaForField.type === "array" &&
        schemaForField.items &&
        typeof schemaForField.items === "object"
      ) {
        const itemSchema = schemaForField.items as JSONSchema7;
        return (
          itemSchema.type === "string" &&
          (itemSchema.format === "data-url" || itemSchema.contentEncoding === "base64")
        );
      }

      const uiWidget = (schemaForField as Record<string, unknown>)["ui:widget"];
      return uiWidget === "file";
    },
    [resolveSchemaByPath]
  );

  const uploadFileWithRetry = useCallback(
    async (
      file: File,
      fieldPath: string,
      retries = 3,
      initialDelay = 1000
    ): Promise<string> => {
      let attempt = 0;
      let delay = initialDelay;

      while (attempt <= retries) {
        try {
          onFileUploadProgress?.(fieldPath, 0, "uploading");
          const url = await DevelopmentDataService.uploadFile(file, (progress) => {
            onFileUploadProgress?.(fieldPath, progress, "uploading");
          });
          onFileUploadProgress?.(fieldPath, 100, "completed");
          return url;
        } catch (error) {
          attempt += 1;
          onFileUploadProgress?.(fieldPath, 0, "error");
          if (attempt > retries) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        }
      }

      throw new Error("UPLOAD_FAILED");
    },
    [onFileUploadProgress]
  );

  const handleFileFieldChange = useCallback(
    async (fieldPath: string, newValue: any) => {
      if (!isFileField(fieldPath)) {
        setDevCreateData((prev) => ({
          ...prev,
          [fieldPath]: newValue,
        }));
        return;
      }

      if (Array.isArray(newValue) && newValue.length === 0) {
        onFileUploadProgress?.(fieldPath, 0, "idle");
        setDevCreateData((prev) => ({
          ...prev,
          [fieldPath]: [],
        }));
        delete latestFilesRef.current[fieldPath];
        return;
      }

      const candidateList = Array.isArray(newValue) ? newValue : [newValue];
      const containsFile = candidateList.some((item) => item instanceof File);
      if (containsFile) {
        latestFilesRef.current[fieldPath] = newValue;
      } else {
        delete latestFilesRef.current[fieldPath];
      }

      try {
        const uploadedValues = await Promise.all(
          candidateList.map(async (item) => {
            if (item instanceof File) {
              return uploadFileWithRetry(item, fieldPath);
            }
            return item;
          })
        );

        setDevCreateData((prev) => ({
          ...prev,
          [fieldPath]: Array.isArray(newValue)
            ? uploadedValues
            : uploadedValues[0],
        }));
      } catch (error) {
        console.error("文件上传失败", error);
      }
    },
    [isFileField, uploadFileWithRetry, onFileUploadProgress]
  );

  const handleFieldChange = useCallback(
    async (fieldPath: string, newValue: any) => {
      if (isFileField(fieldPath)) {
        await handleFileFieldChange(fieldPath, newValue);
        return;
      }

      setDevCreateData((prev) => ({
        ...prev,
        [fieldPath]: newValue,
      }));
    },
    [handleFileFieldChange, isFileField]
  );

  useEffect(() => {
    void (() => {
      if (fileToWebFlag) {
        setDevCreateData(devCreateDataFromFile);
      }
    })();
  }, [fileToWebFlag, devCreateDataFromFile]);

  useEffect(() => {
    void (async () => {
      try {
        const templateWordOrder: LayeredWordOrder[] =
          await TemplateService.getTemplateWordOrderWithId(currentTemplateId);
        setTemplateWordOrder(templateWordOrder);
      } catch (e) {
        console.error(e);
        UserService.navigateToErrorPage();
      }
    })();
  }, [currentTemplateId]);

  useEffect(() => {
    void (async () => {
      try {
        if (isEdit) {
          const devDataObject: DevelopmentData =
            await DevelopmentDataService.getDevData(devDataId);
          setDevCreateData(devDataObject.json_data.origin_post_data);
        }
        setIsLoaded(true);
      } catch (e) {
        console.log(e);
        UserService.navigateToErrorPage();
      }
    })();
  }, [devDataId, isEdit]);

 var uiSchema: any = {};
  if (templateWordOrder) {
    uiSchema = DevelopmentUtils.uiSchemaObject(templateWordOrder, 0);
  }

  //any is the type of formData, but formData in different templates have different types
  const onSubmit = async (form: FormProps<any>) => {
    // 1. 检查上传状态
    const areUploadsInProgress = Object.values(fileUploadStatus)
      .some(statusInfo => statusInfo.status === 'uploading');
      
    const areUploadsFailed = Object.values(fileUploadStatus)
      .some(statusInfo => statusInfo.status === 'error');
      
    if (areUploadsInProgress) {
      alert("有文件正在上传中，请稍后再提交");
      return;
    }
   
    if (areUploadsFailed) {
      alert("有文件上传失败，请重试失败的上传或删除文件");
      return;
    }
    const validCustomFieldFlag = Utils.ifValidCustomField(
      form.formData[Map.MGIDCustomFieldTitle]
    );
    if (!validCustomFieldFlag) {
      alert("自定义域请填入四位数字");
      return;
    }

    let reviewStatus;
    if (submitFlag === REVIEW_STATUS_DRAFT) {
      reviewStatus = REVIEW_STATUS_DRAFT;
    } else {
      reviewStatus = REVIEW_STATUS_WAITING_REVIEW;
    }
    try {
      if (isEdit) {
        const DevDataCreateResult =
          await DevelopmentDataService.updateDevelopmentData(
            devDataId,
            currentTemplateId,
            JSON.stringify(form.formData),
            reviewStatus
          );
        const status: number = DevDataCreateResult.status;
        setErrorCode(status);
        setAlertOpen(true);
        if (status === 0) {
          setPageStatus(submitFlag);
          if (DevDataCreateResult.data !== undefined) {
            setDevDataId(DevDataCreateResult.data.id);
          }
        } else if (status === 9) {
          UserService.navigateToErrorPage();
        }
      } else {
        const DevDataCreateResult =
          await DevelopmentDataService.createDevelopmentData(
            currentTemplateId,
            JSON.stringify(form.formData),
            reviewStatus
          );
        const status: number = DevDataCreateResult.status;
        setErrorCode(status);
        setAlertOpen(true);
        if (status === 0) {
          setPageStatus(submitFlag);
          if (DevDataCreateResult.data) {
            setDevDataId(DevDataCreateResult.data.id);
          }
        } else if (status === 9) {
          UserService.navigateToErrorPage();
        }
      }
    } catch (e) {
      UserService.navigateToErrorPage();
    }
  };
  // 渲染文件上传进度组件
  const renderFileUploadProgress = () => {
    const entries = Object.entries(fileUploadStatus);
    if (entries.length === 0) {
      return null;
    }

    const statusLabel: Record<string, string> = {
      idle: "等待上传",
      uploading: "上传中",
      completed: "上传完成",
      error: "上传失败",
    };

    return (
      <Box className={classes.fileUploadContainer}>
        {entries.map(([fieldPath, statusInfo]) => {
          const { progress, status } = statusInfo;
          const latestSelection = latestFilesRef.current[fieldPath];
          const canRetry = status === "error" && latestSelection;

          let icon: ReactNode = null;
          if (status === "completed") {
            icon = <CheckCircleOutlineIcon color="primary" />;
          } else if (status === "error") {
            icon = <ErrorOutlineIcon color="error" />;
          } else if (status === "uploading") {
            icon = <CircularProgress size={18} />;
          }

          return (
            <Box key={fieldPath} className={classes.uploadSection}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">{fieldPath}</Typography>
                {canRetry && (
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => void handleFileFieldChange(fieldPath, latestSelection)}
                  >
                    重试
                  </Button>
                )}
              </Box>
              <Box className={classes.progressContainer}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  className={classes.progressBar}
                />
                {icon ? (
                  <Tooltip title={statusLabel[status] || ""}>
                    <span className={classes.statusIcon}>{icon}</span>
                  </Tooltip>
                ) : null}
                <Typography variant="body2">{`${progress}%`}</Typography>
              </Box>
              {status === "error" && (
                <Typography className={classes.errorText}>
                  上传失败，请重试。
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  if (!isLoaded) {
    return <LoadingComponent />;
  }

  return (
    <Box className={classes.boxCenter} marginTop={3}>
      <CenterSnackbar
        open={alertOpen}
        status={errorState}
        handleClose={() => {
          setAlertOpen(false);
        }}
      />
      {/* 文件上传状态 */}
      {renderFileUploadProgress()}
      <CustomForm
        idPrefix="createDataForm"
        formData={devCreateData}
        schema={templateSchema}
        uiSchema={uiSchema}
        onSubmit={onSubmit}
        onChange={(form: FormProps<any>) => {
          setDevCreateData(form.formData);
        }}
        onFileFieldChange={handleFieldChange}
      >
        <Box className={classes.rowCenter}>
          <Button
            type="submit"
            className={aButtonStyles.Secondary}
            onClick={() => setSubmitFlag(REVIEW_STATUS_DRAFT)}
            {...commonProps.buttonDisable}
          >
            保存草稿
          </Button>
          <Button
            type="submit"
            className={aButtonStyles.Primary}
            style={{ marginLeft: "56px" }}
            onClick={() => setSubmitFlag(REVIEW_STATUS_WAITING_REVIEW)}
            {...commonProps.buttonDisable}
          >
            提交审核
          </Button>
        </Box>
      </CustomForm>
    </Box>
  );
};

export default WebSubmit;
