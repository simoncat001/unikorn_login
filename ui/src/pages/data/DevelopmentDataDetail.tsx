import React from "react";
import { RouteComponentProps } from "react-router";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

import MainBar from "../../containers/MainAppBar";
import SideBar from "../../containers/SideBar";
import AppBar from "@material-ui/core/AppBar";
import DevDataDetailComponent from "../../components/DevelopmentDataDetail";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: "100vh",
    },
    appbar: {
      display: "flex",
      zIndex: theme.zIndex.drawer + 1,
    },
  })
);

const DevelopmentDetail: React.FC<RouteComponentProps<{ id: string }>> = ({
  match,
}) => {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column" className={classes.root}>
      <Box display="flex">
        <AppBar position="fixed" className={classes.appbar}>
          <MainBar />
        </AppBar>
        <Box height="64px" />
      </Box>
      <Box display="flex" flexGrow={1}>
        <Box display="flex">
          <SideBar />
        </Box>
        <Box display="flex" flexGrow={1} style={{ minWidth: "1024px" }}>
          <DevDataDetailComponent id={match.params.id} publicPage={false} />
        </Box>
      </Box>
    </Box>
  );
};

export default DevelopmentDetail;
