import React from "react";
import { RouteComponentProps } from "react-router";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

import MainBar from "../../containers/MainAppBar";
import SideBar from "../../containers/SideBar";
import AppBar from "@material-ui/core/AppBar";
import TemplateDetailComponent from "../../components/TemplateDetail";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      height: "100vh",
    },
    container: {
      marginLeft: "auto",
      marginRight: "auto",
      minWidth: "688px",
      minHeight: "500px",
      maxWidth: "98%",
      flexGrow: 1,
    },
    appbar: {
      display: "flex",
      zIndex: theme.zIndex.drawer + 1,
    },
  })
);

const TemplateDetail: React.FC<RouteComponentProps<{ id: string }>> = ({
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
      <Box display="flex" style={{ flexGrow: 1 }}>
        <Box display="flex">
          <SideBar />
        </Box>
        <Box display="flex" style={{ flexGrow: 1, minWidth: "1024px" }}>
          <Box display="flex" className={classes.container}>
            <TemplateDetailComponent id={match.params.id} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TemplateDetail;
