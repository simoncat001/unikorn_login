import React from "react";
import { RouteComponentProps } from "react-router";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import DevDataDetailComponent from "../../components/DevelopmentDataDetail";
import MainBar from "../../containers/MainAppBar";
import AppBar from "@material-ui/core/AppBar";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: "100vh",
    },
    appbar: {
      display: "flex",
      zIndex: theme.zIndex.drawer + 1,
    },
    componentBox: {
      display: "flex",
      flexGrow: 1,
      justifyContent: "center",
      minWidth: "1024px",
    },
  })
);

const DevelopmentDetailPublic: React.FC<RouteComponentProps<{ id: string }>> =
  ({ match }) => {
    const classes = useStyles();
    return (
      <Box display="flex" flexDirection="column" className={classes.root}>
        <Box display="flex" height="64px">
          <AppBar className={classes.appbar}>
            <MainBar />
          </AppBar>
        </Box>
        <Box className={classes.componentBox}>
          <DevDataDetailComponent id={match.params.id} publicPage={true} />
        </Box>
      </Box>
    );
  };

export default DevelopmentDetailPublic;
