import React from "react";
import { RouteComponentProps } from "react-router";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import MainBar from "../../containers/MainAppBar";
import AppBar from "@material-ui/core/AppBar";
import { MGIDDetailComponent } from "../../components/MGIDDetailComponent";

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

const MGIDDetail: React.FC<
  RouteComponentProps<{ MGID: string; custom: string }>
> = ({ match }) => {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="column" className={classes.root}>
      <Box display="flex" height="64px">
        <AppBar className={classes.appbar}>
          <MainBar />
        </AppBar>
      </Box>
      <Box className={classes.componentBox}>
        <MGIDDetailComponent
          MGID={match.params.MGID + "/" + match.params.custom}
        />
      </Box>
    </Box>
  );
};

export default MGIDDetail;
