import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import MainBar from "../../containers/MainAppBar";
import AppBar from "@material-ui/core/AppBar";
import ApplicationtDataCreateComponent from "../../components/ApplicationDataCreateComponent";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginLeft: "auto",
      marginRight: "auto",
      minWidth: "768px",
      minHeight: "500px",
      maxWidth: "98%",
    },
    appbar: {
      display: "flex",
      zIndex: theme.zIndex.drawer + 1,
    },
  })
);

const ApplicationDataCreate: React.FC = () => {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" style={{ height: "64px" }}>
        <AppBar className={classes.appbar}>
          <MainBar />
        </AppBar>
      </Box>
      <Box display="flex" style={{ flexGrow: 1, minWidth: "1024px" }}>
        <div className={classes.container}>
          <ApplicationtDataCreateComponent />
        </div>
      </Box>
    </Box>
  );
};

export default ApplicationDataCreate;
