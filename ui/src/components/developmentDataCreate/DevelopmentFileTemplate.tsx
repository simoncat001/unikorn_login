import React, { useState, useRef, useEffect } from "react";
import { WidgetProps } from "@rjsf/core";
import Typography from "@material-ui/core/Typography";
import Common from "../../common/Common";
import { CenterSnackbar } from "../../common/Utils";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import clsx from "clsx";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import Tooltip from "@material-ui/core/Tooltip";
import CircularProgress from "@material-ui/core/CircularProgress";
import { JSONSchema7 } from "json-schema";
import { UiSchema } from "@rjsf/core";
import DevelopmentDataService, { deleteFile as deleteFileService } from "../../api/DevelopmentDataService";

const aColor = Common.allColor;
const commonProps = Common.commonProps;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const parseFileName = (path: string): string => {
  if (!path) return "";
  
  // 处理特殊格式 file:file:/api/download/xxx.zip::
  if (path.startsWith("file:file:/api/download/")) {
    let cleanPath = path.replace(/^file:file:/, ""); // 移除重复的file:前缀
    // 移除末尾可能的::符号
    if (cleanPath.endsWith("::")) {
      cleanPath = cleanPath.substring(0, cleanPath.length - 2);
    }
    return cleanPath.replace(/\\/g, "/").split("/").pop() || cleanPath;
  }
  
  // 原始处理逻辑
  if (path.startsWith("file:")) {
    let filePath = path.substring(5);
    if (filePath.startsWith("//")) {
      filePath = filePath.substring(2);
    }
    return filePath.replace(/\\/g, "/").split("/").pop() || filePath;
  }
  
  return path.replace(/\\/g, "/").split("/").pop() || path;
};

// 添加函数来修复下载链接格式
export const fixDownloadLink = (link: string): string => {
  if (!link) return "";
  
  // 处理file:/api/download/xxx.zip:格式的链接
  if (link.startsWith("file:/api/download/") && link.includes(".zip")) {
    // 提取文件名部分，移除file:前缀和可能的末尾冒号
    let filename = link.replace(/^file:\/api\/download\//, "");
    // 移除末尾可能的冒号或其他特殊字符
    filename = filename.replace(/[:;]+$/, "");
    if (filename && filename.includes(".zip")) {
      return `/api/download/${filename}`;
    }
  }
  
  // 特殊处理无效的".zip:"格式
  if (link.includes(".zip:") || link.includes(".zip%3A")) {
    // 尝试提取有效的.zip文件名部分
    const zipMatch = link.match(/([^\\/:]+\.zip)/i);
    if (zipMatch && zipMatch[1]) {
      return `/api/download/${zipMatch[1]}`;
    }
  }
  
  // 处理各种可能的格式，包括有问题的格式
  
  // 1. 首先尝试从任何位置提取文件名
  let filename = extractFilename(link);
  
  // 2. 如果成功提取到文件名，返回正确的下载链接
  if (filename && filename.trim()) {
    // 确保文件名不包含无效字符，但保留.zip扩展名
    filename = filename.replace(/[<>"'|*?\\/:]/g, '_').replace(/_zip$/i, '.zip');
    return `/api/download/${filename}`;
  }
  
  // 3. 作为最后的尝试，检查是否是特殊格式的链接
  if (link.startsWith("file:file:/api/download/")) {
    // 提取文件名
    let filename = link.replace(/^file:file:\/api\/download\//, "");
    // 移除末尾可能的::符号或冒号
    filename = filename.replace(/[:::]+$/, "");
    return `/api/download/${filename}`;
  }
  
  return link;
};

// 辅助函数：从链接中提取文件名
function extractFilename(link: string): string | null {
  // 尝试从/api/download/路径中提取，包括处理末尾的特殊字符
  const apiMatch = link.match(/\/api\/download\/(.*?)(::|:|\?|#|$)/);
  if (apiMatch && apiMatch[1]) {
    return apiMatch[1];
  }
  
  // 尝试提取任何.zip文件名，确保能处理各种情况
  const zipMatch = link.match(/([^\\/:]+\.zip)/i);
  if (zipMatch && zipMatch[1]) {
    return zipMatch[1];
  }
  
  // 尝试从file:开头的链接中提取，特别处理以冒号结尾的情况
  if (link.startsWith("file:")) {
    let path = link.substring(5);
    // 移除末尾可能的冒号或其他特殊字符
    path = path.replace(/[:;]+$/, "");
    
    if (path.startsWith("//")) {
      path = path.substring(2);
    }
    
    // 特殊处理/api/download/路径
    if (path.includes("/api/download/")) {
      const match = path.match(/\/api\/download\/(.*)/);
      if (match && match[1]) {
        return match[1].replace(/[:;]+$/, "");
      }
    }
    
    // 获取最后一部分作为文件名
    const parts = path.split("/");
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1].replace(/[:;]+$/, "");
      if (lastPart.includes(".")) {
        return lastPart;
      }
    }
  }
  
  // 尝试直接匹配文件名格式（包含扩展名），考虑可能的末尾特殊字符
  const generalMatch = link.match(/([^\\/:]+\.[^\\/:]{2,4})/);
  if (generalMatch && generalMatch[1]) {
    return generalMatch[1];
  }
  
  return null;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    Form: { flexGrow: 1, marginLeft: "16px", marginRight: "16px", borderColor: aColor.lighterBorder },
    FormList: { display: "flex", flexGrow: 1, flexDirection: "column", marginTop: "0px" },
    NormalMinHeight: { minHeight: "60px" },
    ShortMinHeight: { minHeight: "32px" },
    FormHead: { display: "flex", flexGrow: 1, flexDirection: "column", alignSelf: "stretch", marginTop: "0px", borderColor: aColor.lighterBorder },
    FormTitle: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "0px" },
    Height: { height: "60px" },
    BackGroundColor: { backgroundColor: aColor.accentBackground },
    BorderBottom: { borderBottom: 2 },
    fileUploadContainer: { marginTop: "8px", width: "100%" },
    progressContainer: { display: "flex", alignItems: "center", margin: "5px 0" },
    progressBar: { flexGrow: 1, marginRight: "10px" },
    statusIcon: { marginLeft: "10px" },
    fileNameWrapper: { display: "flex", alignItems: "center" },
    fileName: { flexGrow: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "300px", marginRight: "8px" },
    errorText: { color: theme.palette.error.main, fontSize: "0.8rem", marginTop: "5px" },
    retryButton: { marginLeft: "5px" }
  })
);

type FileState = {
  file?: File;
  status: "idle" | "uploading" | "completed" | "error";
  progress: number;
  dataURL?: string;
  error?: string;
  name?: string;
};

interface FileTitleProps {
  schema: JSONSchema7;
  required: boolean;
  label: string;
  isInObject: boolean;
}

const FileTitle = ({ schema, required, label, isInObject }: FileTitleProps) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  return (
    <Box className={clsx(classes.FormHead, !isInObject && [classes.Height, classes.BackGroundColor, classes.BorderBottom])}>
      <Box className={clsx(classes.FormTitle, !isInObject && classes.Height)}>
        <Box marginLeft="16px" marginTop={isInObject ? "0px" : "16px"}>
          <Typography className={fontClasses.boldFont}>
            <Box component="span" display="flex" flexDirection="row">
              <Box component="span" color={aColor.requiredRed}>{required ? "*" : ""}</Box>
              <Box component="span">{label || schema.title}：</Box>
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const FileWidget = (props: WidgetProps) => {
  const {
    id, schema, options, value, required, disabled, readonly, label,
    multiple, autofocus, onChange,
  } = props;

  const isInObject = false;
  const classes = useStyles();
  const aButtonStyles = Common.buttonStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const fileTitleProps: FileTitleProps = {
    schema, required, label, isInObject
  };

  useEffect(() => {
    if (!value) return;

    const newFileStates: FileState[] = [];
    const handleSingle = (val: string): FileState => {
      const isPending = val.startsWith("file:");
      const name = parseFileName(val);
      return {
        name,
        progress: isPending ? 0 : 100,
        status: isPending ? "idle" : "completed",
        dataURL: isPending ? undefined : val,
      };
    };

    if (multiple && Array.isArray(value)) {
      for (const val of value) {
        if (typeof val === "string") newFileStates.push(handleSingle(val));
      }
    } else if (typeof value === "string") {
      newFileStates.push(handleSingle(value));
    }

    setFileStates(newFileStates);
  }, [value, multiple]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const files = Array.from(event.target.files);
    const newFileStates: FileState[] = files.map((file) => ({
      file,
      name: file.name,
      status: "idle",
      progress: 0,
    }));
    // 如果是多文件，保留旧的
    setFileStates((prev) => (multiple ? [...prev, ...newFileStates] : newFileStates));
    // 立即将 file 状态绑定，value 不变，用户需要手动点击“上传”
  };

  function setNestedValue(obj: any, path: string | string[], value: any): any {
    const keys = Array.isArray(path) ? path : path.split(".");
    const newObj = { ...obj };
    let current = newObj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) current[key] = {};
      else current[key] = { ...current[key] };
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return newObj;
  }

  
  const handleUpload = async (index: number) => {
    const state = fileStates[index];

    if (!(state.file instanceof File) || state.file.size === 0) {
      setFileStates(prev =>
        prev.map((s, i) =>
          i === index
            ? { ...s, status: "error", error: "需要先选择文件！" }
            : s
        )
      );
      return;
    }
    const file = state.file;
    if (!file) return;

    setFileStates(prev =>
      prev.map((s, i) =>
        i === index ? { ...s, status: "uploading", progress: 0 } : s
      )
    );

    try {
      // 可以根据需要添加objectPrefix，这里使用默认值
      const objectPrefix = 'development_data';
      const downloadUrl = await DevelopmentDataService.uploadFile(file, (progress) => {
        setFileStates(prev =>
          prev.map((s, i) =>
            i === index ? { ...s, progress } : s
          )
        );
      }, objectPrefix);

      setFileStates(prev =>
        prev.map((s, i) =>
          i === index
            ? { ...s, status: "completed", progress: 100, dataURL: downloadUrl }
            : s
        )
      );

      if (props.multiple && Array.isArray(props.value)) {
        // 多文件字段，更新当前 index 的值
        const newValue = [...props.value];
        newValue[index] = downloadUrl;
        props.onChange(newValue);
      } else {
        // 单文件字段，直接替换
        props.onChange(downloadUrl);
      }
    } catch (err) {
      setFileStates(prev =>
        prev.map((s, i) =>
          i === index
            ? { ...s, status: "error", error: String(err) }
            : s
        )
      );
    }
  };


  const removeFile = async (index: number) => {
    const fileState = fileStates[index];
    
    // 如果文件已经上传成功，先调用API删除后端文件
    if (fileState.status === "completed" && fileState.dataURL) {
      try {
        // 从URL中提取文件名
        const urlParts = fileState.dataURL.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        // 调用API删除文件
        await deleteFileService(filename);
      } catch (error) {
        console.error("删除文件失败:", error);
        // 即使删除失败，也继续删除前端状态
        // 可以添加错误提示
      }
    }
    
    // 删除前端状态
    const newStates = [...fileStates];
    newStates.splice(index, 1);
    setFileStates(newStates);

    if (multiple) {
      const urls = newStates.map(s => s.dataURL).filter(Boolean);
      onChange(urls);
    } else {
      onChange(undefined);
    }
  };

  return (
    <Box className={clsx(classes.Form, classes.NormalMinHeight)} {...commonProps.Border}>
      <CenterSnackbar open={alertOpen} status={11} handleClose={() => setAlertOpen(false)} />
      <Box className={clsx(classes.FormList, classes.NormalMinHeight)}>
        {FileTitle(fileTitleProps)}
        <Box marginTop="16px" marginBottom="16px">
          {/* 文件列表 */}
          {fileStates.map((state, index) => (
            <div key={index} className={classes.progressContainer}>
              <Box flexGrow={1}>
                <div className={classes.fileNameWrapper}>
                  <Tooltip title={state.name || ""}>
                    <Typography variant="body2" className={classes.fileName}>
                      {state.name}
                    </Typography>
                  </Tooltip>
                  {state.status === "idle" && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleUpload(index)}
                      style={{ marginLeft: 8 }}
                    >
                      上传
                    </Button>
                  )}
                  <Button
                    size="small"
                    onClick={() => removeFile(index)}
                    color="secondary"
                    style={{ marginLeft: 8 }}
                    disabled={state.status === "uploading"}
                  >
                    删除
                  </Button>
                </div>

                {state.status === "uploading" && (
                  <LinearProgress
                    variant="determinate"
                    value={state.progress}
                    className={classes.progressBar}
                  />
                )}
                {state.status === "error" && (
                  <div className={classes.errorText}>
                    {state.error || "上传失败"}
                    <Button
                      variant="outlined"
                      size="small"
                      color="secondary"
                      className={classes.retryButton}
                      onClick={() => handleUpload(index)}
                    >
                      重试
                    </Button>
                  </div>
                )}
              </Box>

              <div className={classes.statusIcon}>
                {state.status === "uploading" && <CircularProgress size={20} />}
              </div>
            </div>
          ))}

          {/* 始终保留的“选择文件”按钮 */}
          <Button
            variant="contained"
            component="label"
            className={aButtonStyles.SecondaryIcon}
            disabled={readonly || disabled || uploadInProgress}
            {...commonProps.buttonDisable}
            style={{ marginTop: "12px" }}
          >
            {uploadInProgress ? "上传中..." : "选择文件"}
            <input
              type="file"
              hidden
              ref={inputRef}
              id={id}
              disabled={readonly || disabled || uploadInProgress}
              onChange={handleChange}
              autoFocus={autofocus}
              multiple={multiple}
              accept={options.accept as string}
            />
          </Button>
        </Box>

      </Box>
    </Box>
  );
};
export default { FileWidget, FileWidgetObjectItem: FileWidget, FileWidgetArrayItem: FileWidget };
