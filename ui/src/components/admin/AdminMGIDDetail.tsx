import React from "react";
import { RouteComponentProps } from "react-router";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import MainBar from "../../containers/MainAppBar";
import AppBar from "@material-ui/core/AppBar";
import AdminMGIDDetailItem from "./AdminMGIDDetailItem";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appbar: {
      display: "flex",
      zIndex: theme.zIndex.drawer + 1,
    },
  })
);

const AdminMGIDDetail: React.FC<
  RouteComponentProps<{ MGID: string; custom: string }>
> = ({ match }) => {
  const classes = useStyles();
  const id = match.params.MGID + "/" + match.params.custom;

  return (
    <Box display="flex" flexDirection="column" marginTop="80px">
      <Box display="flex">
        <AppBar className={classes.appbar}>
          <MainBar />
        </AppBar>
        <Box height="64px" />
      </Box>
      <Box
        display="flex"
        flexGrow={1}
        flexBasis="1024px"
        justifyContent="center"
      >
        <AdminMGIDDetailItem MGID={id} />
      </Box>
    </Box>
  );
};

export default AdminMGIDDetail;
