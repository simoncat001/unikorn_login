import React from "react";
import { RouteComponentProps } from "react-router";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import MainBar from "../../containers/MainAppBar";
import AppBar from "@material-ui/core/AppBar";
import DevelopmentDataCreateComponent from "../../components/DevelopmentDataCreateComponent";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appbar: {
      display: "flex",
      zIndex: theme.zIndex.drawer + 1,
    },
  })
);

const DevelopmentDataEdit: React.FC<RouteComponentProps<{ id: string }>> = ({
  match,
}) => {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="column" >
      <Box display="flex" style={{ height: "64px" }}>
        <AppBar className={classes.appbar}>
          <MainBar />
        </AppBar>
      </Box>
      <Box
        display="flex"
        flexGrow={1}
        justifyContent="center"
        style={{ minWidth: "1024px" }}
      >
        <DevelopmentDataCreateComponent id={match.params.id} isEdit={true} />
      </Box>
    </Box>
  );
};

export default DevelopmentDataEdit;
