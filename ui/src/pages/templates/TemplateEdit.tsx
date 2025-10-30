import React from "react";
import { RouteComponentProps } from "react-router";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

import MainBar from "../../containers/MainAppBar";
import AppBar from "@material-ui/core/AppBar";
import TemplateCreateComponent from "../../components/TemplateCreateComponent";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
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

const TemplateEdit: React.FC<RouteComponentProps<{ id: string }>> = ({
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
      <Box display="flex" flexGrow={1} style={{ minWidth: "1024px" }}>
        <Box display="flex" className={classes.container}>
          <TemplateCreateComponent id={match.params.id} isEdit={true} />
        </Box>
      </Box>
    </Box>
  );
};

export default TemplateEdit;
