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

  const handleSubmit = async () => {
    if (!devData) return;
    setSaving(true);
    try {
      const result = await DevelopmentDataService.updateDataContent(
        devData.id,
        dataContent,
        title
      );
      setStatus(result ?? 0);
      setAlertOpen(true);
      if (result === 0) {
        history.push(`${DEVELOPMENT_DATA_DETAIL_PATH}/${devData.id}`);
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
