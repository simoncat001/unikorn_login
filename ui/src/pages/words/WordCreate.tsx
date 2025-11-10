import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import MainBar from "../../containers/MainAppBar";
import AppBar from "@material-ui/core/AppBar";
import WordCreateComponent from "../../components/WordCreateComponent";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appbar: {
      display: "flex",
      zIndex: theme.zIndex.drawer + 1,
    },
  })
);

const WordCreate: React.FC = () => {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" style={{ height: "64px" }}>
        <AppBar className={classes.appbar}>
          <MainBar />
        </AppBar>
      </Box>
      <Box display="flex" flexGrow={1} style={{ minWidth: "1024px" }}>
        <WordCreateComponent isEdit={false} />
      </Box>
    </Box>
  );
};

export default WordCreate;
