import React, { useState, useEffect  } from "react";
import { Box, Typography, Link, Button, CircularProgress } from "@material-ui/core";
import Common from "../../common/Common";
import { REVIEW_STATUS_DRAFT } from "../../common/ReviewStatusUtils";
import DevelopmentDataService from "../../api/DevelopmentDataService";
import { CenterSnackbar } from "../../common/Utils";
import UserService from "../../api/UserService";
import DescriptionIcon from '@material-ui/icons/Description';
import jschardet from 'jschardet';
import TemplateService, {
  TemplateFileSubmitResponse,
} from "../../api/TemplateService";

const aColor = Common.allColor;
const commonProps = Common.commonProps;

const handleDownload = (
  event: React.SyntheticEvent,
  devCreateData: JSON,
  currentTemplateName: string
) => {
  const a = document.createElement("a");
  const blob = new Blob([JSON.stringify(devCreateData, undefined, 2)]);
  a.textContent = "download";
  a.download = `${currentTemplateName}.json`;
  a.href = window.URL.createObjectURL(blob);
  a.click();
};

const FileSubmit: React.FC<{
  currentTemplateId: string;
  currentTemplateName: string;
  setPageStatus: React.Dispatch<React.SetStateAction<string>>;
  setDevDataId: React.Dispatch<React.SetStateAction<string>>;
  setFileToWebFlag: React.Dispatch<React.SetStateAction<boolean>>;
  setDevCreateDataFromFile: React.Dispatch<React.SetStateAction<JSON>>;
}> = ({
  currentTemplateId,
  currentTemplateName,
  setPageStatus,
  setDevDataId,
  setFileToWebFlag,
  setDevCreateDataFromFile,
}) => {
  const fontClasses = Common.fontStyles();
  const buttonStyles = Common.buttonStyles();

  const [devCreateData, setDevCreateData] = useState(JSON.parse("{}"));
  const emptyFile = new File([], "");
  const [selectedFile, setSelectedFile] = useState(emptyFile);
  const [fileName, setFileName] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [errorState, setErrorCode] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const templateFileSubmitResponse: TemplateFileSubmitResponse =
          await TemplateService.getEmptyTemplateWithId(currentTemplateId);
        if (templateFileSubmitResponse.status === 0) {
          const templateEmpty = templateFileSubmitResponse.data;
          setDevCreateData(templateEmpty);
        } else if (templateFileSubmitResponse.status === 12) {
          setErrorCode(12);
          setAlertOpen(true);
          setDevCreateData(JSON.parse("{}"));
        }
      } catch (e) {
        console.error(e);
        UserService.navigateToErrorPage();
      }
    })();
  }, [currentTemplateId]);

  // 解析文件内容
  const parseFile = (file: File): Promise<JSON> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsArrayBuffer(file); // 读取为 ArrayBuffer

      reader.onloadend = function () {
        const buffer = reader.result;
        if (!buffer) return reject(new Error("文件内容为空"));

        try {
          const uint8Array = new Uint8Array(buffer as ArrayBuffer);
          const asciiSample = new TextDecoder("ascii").decode(uint8Array.slice(0, 512)); // 提取样本
          const detected = jschardet.detect(asciiSample);
          const encoding = detected?.encoding?.toLowerCase() || "utf-8";

          const decoder = new TextDecoder(encoding); // 自动支持 gbk/gb18030/big5（现代浏览器）
          const decodedText = decoder.decode(uint8Array);
          const json = JSON.parse(decodedText);

          resolve(json);
        } catch (err) {
          reject(new Error("文件解析失败: " + (err as Error).message));
        }
      };

      reader.onerror = () => reject(new Error("文件读取错误"));
    });
  };

  // 处理文件选择
  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) {
      const targetFile = event.target.files as FileList;
      setSelectedFile(targetFile[0]);
      setFileName(targetFile[0].name);
      event.target.value = "";
    }
  };

  // 预览文件内容
  const handlePreview = async () => {
    if (selectedFile && selectedFile !== emptyFile) {
      setIsLoading(true);
      try {
        const formJSON = await parseFile(selectedFile);
        setFileToWebFlag(true);
        setDevCreateDataFromFile(formJSON);
      } catch (error) {
        setErrorCode(500); // 自定义错误码
        setAlertOpen(true);
        console.error('预览错误:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrorCode(400); // 文件未选择
      setAlertOpen(true);
    }
  };

  // 保存为草稿
  const handleSaveAsDraft = async () => {
    if (selectedFile && selectedFile !== emptyFile) {
      setIsLoading(true);
      try {
        const formJSON = await parseFile(selectedFile);
        
        const DevDataCreateResult = await DevelopmentDataService.createDevelopmentData(
          currentTemplateId,
          JSON.stringify(formJSON),
          REVIEW_STATUS_DRAFT
        );
        
        const status: number = DevDataCreateResult.status;
        setErrorCode(status);
        setAlertOpen(true);
        
        if (status === 0) {
          setPageStatus(REVIEW_STATUS_DRAFT);
          if (DevDataCreateResult.data) {
            setDevDataId(DevDataCreateResult.data.id);
          }
        } else if (status === 9) {
          UserService.navigateToErrorPage();
        }
      } catch (error) {
        setErrorCode(500); // 保存失败
        setAlertOpen(true);
        console.error('保存草稿失败:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrorCode(400); // 文件未选择
      setAlertOpen(true);
    }
  };

  return (
    <div>
      <CenterSnackbar
        open={alertOpen}
        status={errorState}
        handleClose={() => setAlertOpen(false)}
      />
      <Box display="flex" flexDirection="column" width="550px">
        <Box display="flex" justifyContent="center" py={1.5}>
          <Typography className={fontClasses.CardMGID}>
            模板文件已成功生成，
            <Link
              onClick={(event: React.SyntheticEvent) =>
                handleDownload(event, devCreateData, currentTemplateName)
              }
            >
              点击此处
            </Link>
            下载文件
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" py={1.5}>
          <Box display="flex" alignItems="center">
            <Typography className={fontClasses.boldFont}>
              <span style={{ color: aColor.requiredRed }}>*</span>
              上传文件：
            </Typography>
            <Box display="flex" flexDirection="column" ml={3}>
              <Button
                variant="contained"
                component="label"
                className={buttonStyles.SecondaryIcon}
                {...commonProps.buttonDisable}
                startIcon={<DescriptionIcon />}
                disabled={isLoading}
              >
                选择JSON文件
                <input
                  type="file"
                  hidden
                  onChange={handleCapture}
                  multiple={false}
                  accept={".json"}
                  disabled={isLoading}
                />
              </Button>
            </Box>
          </Box>
          <Box display="flex" mt={1} ml={13}>
            <Typography className={fontClasses.boldFont}>
              {fileName}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" justifyContent="center" p={1} marginTop="40px">
          {isLoading ? (
            <CircularProgress size={24} color="secondary" />
          ) : (
            <>
              <Button
                className={buttonStyles.Secondary}
                onClick={handleSaveAsDraft}
                disabled={!selectedFile || selectedFile === emptyFile}
                {...commonProps.buttonDisable}
              >
                保存草稿
              </Button>
              <Box marginLeft="56px">
                <Button
                  className={buttonStyles.Primary}
                  onClick={handlePreview}
                  disabled={!selectedFile || selectedFile === emptyFile}
                  {...commonProps.buttonDisable}
                >
                  预览数据
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default FileSubmit;