import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import {
  Box,
  AppBar,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from "@material-ui/core";

import MainBar from "../../containers/MainAppBar";
import DevelopmentDataContentEditor from "../../components/DevelopmentDataContentEditor";
import DevelopmentDataService, {
  DataContent,
  DevelopmentData,
} from "../../api/DevelopmentDataService";
import { DEVELOPMENT_DATA_DETAIL_PATH } from "../../common/Path";
import Common from "../../common/Common";
import { CenterSnackbar } from "../../common/Utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appbar: {
      display: "flex",
      zIndex: theme.zIndex.drawer + 1,
    },
    container: {
      minWidth: "1024px",
      padding: theme.spacing(3),
      maxWidth: 1200,
      width: "100%",
    },
  })
);

const DevelopmentDataEdit: React.FC<RouteComponentProps<{ id: string }>> = ({
  match,
  location,
}) => {
  const classes = useStyles();
  const btnClasses = Common.buttonStyles();
  const history = useHistory();
  const [devData, setDevData] = useState<DevelopmentData | null>(null);
  const [dataContent, setDataContent] = useState<DataContent[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<number>(0);
  const [alertOpen, setAlertOpen] = useState(false);

  // 从URL查询参数读取是否隐藏文件字段
  const searchParams = new URLSearchParams(location.search);
  const hideFileFields = searchParams.get('hideFiles') === 'true';

  useEffect(() => {
    void (async () => {
      try {
        const data = await DevelopmentDataService.getDevData(match.params.id);
        setDevData(data);
        setDataContent(data.json_data.data_content || []);
        setTitle(data.json_data.title || data.json_data.template_name);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [match.params.id]);

  // 合并数据内容，保留原始数据中的文件字段
  const mergeDataContent = (
    originalContent: DataContent[],
    editedContent: DataContent[]
  ): DataContent[] => {
    const merged: DataContent[] = [];
    const processedTitles = new Set<string>();

    // 第一步：遍历原始数据，对于文件字段保留原始数据，其他字段使用编辑后的数据
    for (const original of originalContent) {
      processedTitles.add(original.title);
      const edited = editedContent.find(item => item.title === original.title);

      // 如果是文件或图片字段，始终保留原始数据
      if (original.type === "file" || original.type === "image") {
        merged.push(original);
        continue;
      }

      // 如果编辑后的数据中没有这个字段，保留原始数据
      if (!edited) {
        merged.push(original);
        continue;
      }

      // 如果是对象类型，递归合并
      if (original.type === "object" && Array.isArray(original.content) && Array.isArray(edited.content)) {
        merged.push({
          ...edited,
          content: mergeDataContent(original.content as DataContent[], edited.content as DataContent[])
        });
        continue;
      }

      // 如果是数组类型，需要递归处理数组中的对象
      if (original.type === "array" && Array.isArray(original.content) && Array.isArray(edited.content)) {
        const originalArray = original.content as any[];
        const editedArray = edited.content as any[];

        // 检查数组元素是否是对象类型
        if (originalArray.length > 0 && editedArray.length > 0 &&
          typeof originalArray[0] === "object" && originalArray[0] !== null &&
          typeof editedArray[0] === "object" && editedArray[0] !== null &&
          "title" in originalArray[0] && "title" in editedArray[0]) {
          // 对象数组，递归合并每个元素
          const mergedArray = editedArray.map((editedItem, idx) => {
            if (idx < originalArray.length) {
              return mergeDataContent([originalArray[idx] as DataContent], [editedItem as DataContent])[0];
            }
            return editedItem;
          });
          merged.push({ ...edited, content: mergedArray });
        } else {
          // 原始类型数组，直接使用编辑后的数据
          merged.push(edited);
        }
        continue;
      }

      // 其他情况，使用编辑后的数据
      merged.push(edited);
    }

    // 第二步：添加编辑后数据中的新增字段（不在原始数据中的字段）
    for (const edited of editedContent) {
      if (!processedTitles.has(edited.title)) {
        merged.push(edited);
      }
    }

    return merged;
  };

  const handleSubmit = async () => {
    if (!devData) return;
    setSaving(true);
    try {
      // 如果隐藏了文件字段，需要合并原始数据和编辑后的数据
      const contentToSave = hideFileFields
        ? mergeDataContent(devData.json_data.data_content || [], dataContent)
        : dataContent;

      console.log("🔍 保存数据调试信息:", {
        hideFileFields,
        originalContentLength: devData.json_data.data_content?.length,
        editedContentLength: dataContent.length,
        mergedContentLength: contentToSave.length,
        originalContent: devData.json_data.data_content,
        editedContent: dataContent,
        contentToSave
      });

      const result = await DevelopmentDataService.updateDataContent(
        devData.id,
        contentToSave,
        title
      );
      setStatus(result ?? 0);
      setAlertOpen(true);
      if (result === 0) {
        // 保存成功后跳转回详情页，并传递 refresh 标记以触发数据重新加载
        history.push(`${DEVELOPMENT_DATA_DETAIL_PATH}/${devData.id}`, { refresh: true });
      }
    } catch (e) {
      setStatus(-1);
      setAlertOpen(true);
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!devData) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" style={{ height: "64px" }}>
        <AppBar className={classes.appbar}>
          <MainBar />
        </AppBar>
      </Box>
      <Box display="flex" flexGrow={1} justifyContent="center">
        <Box className={classes.container}>
          <CenterSnackbar
            open={alertOpen}
            status={status}
            handleClose={() => setAlertOpen(false)}
            ifPublished={false}
          />
          <Typography variant="h5" gutterBottom>
            编辑数据 - {devData.json_data.template_name}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            margin="dense"
            label="实验名称 / 标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Box mt={2}>
            <DevelopmentDataContentEditor
              dataContent={dataContent}
              onChange={setDataContent}
              hideFileFields={hideFileFields}
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              className={btnClasses.Secondary}
              onClick={() => history.push(`${DEVELOPMENT_DATA_DETAIL_PATH}/${devData.id}`)}
            >
              取消
            </Button>
            <Button
              className={btnClasses.Primary}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "提交中..." : "保存"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DevelopmentDataEdit;
