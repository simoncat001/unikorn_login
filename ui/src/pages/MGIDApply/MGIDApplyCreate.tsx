import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import MainBar from "../../containers/MainAppBar";
import AppBar from "@material-ui/core/AppBar";
import MGIDApplyCreateComponent from "../../components/MGIDApplyCreateComponent";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appbar: {
      display: "flex",
      zIndex: theme.zIndex.drawer + 1,
    },
    componentBox: {
      display: "flex",
      flexGrow: 1,
      minWidth: "1024px",
      justifyContent: "center",
    },
  })
);

const ApplyMGIDCreate: React.FC = () => {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" height="64px">
        <AppBar className={classes.appbar}>
          <MainBar />
        </AppBar>
      </Box>
      <Box className={classes.componentBox}>
        <MGIDApplyCreateComponent />
      </Box>
    </Box>
  );
};

export default ApplyMGIDCreate;
