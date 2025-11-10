import Typography from "@material-ui/core/Typography";
import React from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import MainBar from "../containers/MainAppBar";
import AppBar from "@material-ui/core/AppBar";
import Common from "../common/Common";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import { useHistory } from "react-router-dom";
import { ReactComponent as NotFoundIcon } from "../icon/NotFound.svg";
const NotFoundPage: React.FC = () => {
  const history = useHistory();
  const aColor = Common.allColor;
  const fontClasses = Common.fontStyles();
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        display: "flex",
        height: window.innerHeight,
        minHeight: "100vh",
        backgroundColor: aColor.primaryDark,
      },
      page: {
        marginLeft: "auto",
        marginRight: "auto",
      },
      message: {
        marginTop: "auto",
        marginBottom: "auto",
        marginLeft: "185px",
      },
      button: {
        backgroundColor: aColor.backButtonColor,
        fontSize: "16px",
        color: aColor.background,
        marginTop: "31px",
        borderRadius: "8px",
      },
      icon: {
        marginLeft: "122px",
      },
    })
  );
  const classes = useStyles();
  const GoBackPage = () => {
    history.goBack();
  };
  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <MainBar />
      </AppBar>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        className={classes.page}
      >
        <Box display="flex" flexDirection="column" className={classes.message}>
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            className={fontClasses.NotFoundfonttitle}
          >
            404
          </Typography>
          <Typography
            variant="h3"
            component="h3"
            gutterBottom
            className={fontClasses.NotFoundfontmessage}
          >
            抱歉，您访问的页面不见啦！
          </Typography>
          <Typography
            variant="h3"
            component="h3"
            gutterBottom
            className={fontClasses.NotFoundfonttips}
          >
            抱歉，找不到您搜索的页面，请检查您输入的网址或点击按钮返回上一页面。
          </Typography>
          <Box>
            <Button
              className={classes.button}
              onClick={GoBackPage}
              disableFocusRipple
            >
              返回上一页
            </Button>
          </Box>
        </Box>
        <Hidden mdDown>
          <Box display="flex" className={classes.icon}>
            <NotFoundIcon />
          </Box>
        </Hidden>
      </Box>
    </div>
  );
};
export default NotFoundPage;
