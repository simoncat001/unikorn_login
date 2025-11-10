import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import MainBar from "../containers/MainAppBar";
import AppBar from "@material-ui/core/AppBar";
import AboutContent from "../components/AboutContent";

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

const About: React.FC = () => {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="column" className={classes.root}>
      <Box display="flex">
        <AppBar className={classes.appbar}>
          <MainBar />
        </AppBar>
        <Box height="64px"></Box>
      </Box>
      <Box className={classes.componentBox}>
        <AboutContent />
      </Box>
    </Box>
  );
};

export default About;
