import React from "react";
import { RouteComponentProps } from "react-router";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import MainBar from "../containers/MainAppBar";
import SideBar from "../containers/SideBar";
import AppBar from "@material-ui/core/AppBar";
import WordListResult from "../components/WordListResult";
import TemplateListResult from "../components/TemplateListResult";
import DevDataListResult from "../components/DevelopmentDataListResult";
import { useHistory } from "react-router-dom";
import { ERROR_PATH } from "../common/Path";
import MGIDListResult from "../components/MGIDListResult";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: "100vh",
    },
    container: {
      minWidth: "768px",
      minHeight: "500px",
    },
    appbar: {
      display: "flex",
      zIndex: theme.zIndex.drawer + 1,
    },
  })
);

const UserItem: React.FC<RouteComponentProps<{ itemType: string }>> = ({
  match,
}) => {
  const itemType = match.params.itemType;
  const classes = useStyles();
  const history = useHistory();
  const listResult =
    itemType === "words" ? (
      <WordListResult itemType={itemType} />
    ) : itemType === "templates" ? (
      <TemplateListResult itemType={itemType} />
    ) : itemType === "development_data" ? (
      <DevDataListResult itemType={itemType} />
    ) : itemType === "MGID_apply" ? (
      <MGIDListResult itemType={itemType} />
    ) : (
      false
    );

  if (!listResult) {
    history.replace(ERROR_PATH);
    return null;
  }
  return (
    <Box display="flex" flexDirection="column" className={classes.root}>
      <Box display="flex">
        <AppBar className={classes.appbar}>
          <MainBar />
        </AppBar>
        <Box height="64px" />
      </Box>
      <Box display="flex" flexGrow={1} style={{ minWidth: "1024px" }}>
        <Box display="flex">
          <SideBar />
        </Box>
        <Box
          display="flex"
          flexGrow={1}
          justifyContent="center"
          className={classes.container}
        >
          {listResult}
        </Box>
      </Box>
    </Box>
  );
};

export default UserItem;
