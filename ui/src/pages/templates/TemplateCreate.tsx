import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import MainBar from "../../containers/MainAppBar";
import AppBar from "@material-ui/core/AppBar";
import TemplateCreateComponent from "../../components/TemplateCreateComponent";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appbar: {
      display: "flex",
      zIndex: theme.zIndex.drawer + 1,
    },
  })
);

const TemplateCreate: React.FC = () => {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex">
        <AppBar className={classes.appbar}>
          <MainBar />
        </AppBar>
        <Box height="64px" />
      </Box>
      <Box
        display="flex"
        flexGrow={1}
        justifyContent="center"
        style={{ minWidth: "1024px" }}
      >
        <TemplateCreateComponent isEdit={false} />
      </Box>
    </Box>
  );
};

export default TemplateCreate;
