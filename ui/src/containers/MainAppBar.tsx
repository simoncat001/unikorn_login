import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import React from "react";
import { useHistory } from "react-router-dom";
import Box from "@material-ui/core/Box";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import Grow from "@material-ui/core/Grow";
import Container from "@material-ui/core/Container";
import {
  WORDS_CREATE_PATH,
  TEMPLATES_CREATE_PATH,
  DEVELOPMENT_DATA_CREATE_PATH,
  APPLICATION_DATA_CREATE_PATH,
  ADMIN_WORDS_PATH,
  WORDS_PATH,
  MGID_APPLY_CREATE_PATH,
  ABOUT_PATH,
  TEMPLATES_RECOMMEND_PATH,
} from "../common/Path";
import Common from "../common/Common";
import AdminService from "../api/AdminService";
import UserService from "../api/UserService";
import { subscribeAuthChange } from "../api/AuthService";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: "#063E8B",
      width: "100%",
      maxWidth: "100%",
      margin: 0,
      padding: 0,
      minWidth: "600px",
    },
    logoButton: {
      padding: "0px",
      minWidth: 150,
      height: "20px",
      minHeight: "20px",
    },
    appButton: {
      padding: "0px",
      minWidth: 100,
    },
    popper: {
      right: "0",
      marginRight: "22px",
      marginTop: "12px",
      width: "152px",
    },
    rightButtonName: {
      marginRight: "61px",
      padding: "0px",
      height: "42px",
      minHeight: "42px",
    },
    rightButtonAbout: {
      marginRight: "45px",
      padding: "0px",
      minWidth: "33px",
      height: "42px",
      minHeight: "42px",
    },
    boxControl: {
      marginTop: "2px",
      float: "right",
      width: "253px",
      position: "relative",
      marginLeft: "auto",
    },
  })
);
const MainAppBar: React.FC = () => {
  const routerHistory = useHistory();
  const [usercolor, setUsercolor] = React.useState(Common.allColor.deepBlue);
  const [doicolor, setDoicolor] = React.useState(Common.allColor.deepBlue);
  const [logoutcolor, setLogoutcolor] = React.useState(
    Common.allColor.deepBlue
  );
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [userName, setUserName] = React.useState("");
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const handleMenuToggle = () => {
    setMenuOpen((prevOpen) => !prevOpen);
  };
  const handleMenuClose = (event: React.MouseEvent<EventTarget>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setMenuOpen(false);
  };
  const handleLogin = () => {
    UserService.navigateToLogin();
  };

  const handleAdminClick = async () => {
    const isAdmin = await AdminService.checkAdmin();
    if (isAdmin) {
      routerHistory.push(ADMIN_WORDS_PATH);
    }
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setMenuOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(menuOpen);
  React.useEffect(() => {
    if (prevOpen.current === true && menuOpen === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = menuOpen;
  }, [menuOpen]);

  const refreshUserState = React.useCallback(async () => {
    try {
      setUserName("");
      setIsAdmin(false);
      const loginCheck = await UserService.isLoggedIn();
      setIsLoggedIn(loginCheck);
      setIsChecked(true);
      if (loginCheck) {
        const adminCheck = await AdminService.checkAdmin();
        setIsAdmin(adminCheck);
        const name = await UserService.getUserDisplayName();
        setUserName(name);
      } else {
        setIsAdmin(false);
        setUserName("");
      }
    } catch (error) {
      console.error(error);
      setUserName("");
      setIsAdmin(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshUserState();
  }, [refreshUserState]);

  React.useEffect(() => {
    const unsubscribe = subscribeAuthChange((detail) => {
      if (detail.status === "logout") {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserName("");
        setIsChecked(true);
        setMenuOpen(false);
      } else if (detail.status === "login") {
        if (detail.user && typeof detail.user === "object") {
          const displayName =
            (detail.user.display_name as string | undefined) ||
            (detail.user.username as string | undefined) ||
            "";
          if (displayName) {
            setUserName(displayName);
          }
        }
        void refreshUserState();
      }
    });

    return unsubscribe;
  }, [refreshUserState]);

  function changeUserColorMouseOver() {
    setUsercolor(Common.allColor.primaryColor);
  }
  function changeUserColorMouseOut() {
    setUsercolor(Common.allColor.deepBlue);
  }
  function changeDoiColorMouseOver() {
    setDoicolor(Common.allColor.primaryColor);
  }
  function changeDoiColorMouseOut() {
    setDoicolor(Common.allColor.deepBlue);
  }
  function changeLogoutColorMouseOver() {
    setLogoutcolor(Common.allColor.primaryColor);
  }
  function changeLogoutColorMouseOut() {
    setLogoutcolor(Common.allColor.deepBlue);
  }

  return (
    <Container className={classes.root}>
      <AppBar position="relative" className={classes.root}>
        <Toolbar style={{ padding: "0" }}>
          <UnikornLogoButton />
          <AppButton value="词汇" width={70} href={WORDS_CREATE_PATH} />
          <AppButton value="模板推荐" width={100} href={TEMPLATES_RECOMMEND_PATH} />
          <AppButton value="模板创建" width={100} href={TEMPLATES_CREATE_PATH} />
          <AppButton
            value="研发数据"
            width={100}
            href={DEVELOPMENT_DATA_CREATE_PATH}
          />
          <AppButton
            value="应用数据"
            width={100}
            href={APPLICATION_DATA_CREATE_PATH}
          />
          <AppButton
            value="MGID申请"
            width={100}
            href={MGID_APPLY_CREATE_PATH}
          />
          <Box style={{ minWidth: "50px" }} />
          <Box
            display="flex"
            flexDirection="row-reverse"
            className={classes.boxControl}
          >
            {isLoggedIn ? (
              <Box style={{ height: "42px" }}>
                <Button
                  className={classes.rightButtonName}
                  classes={{ label: fontClasses.UsernameFont }}
                  color="inherit"
                  ref={anchorRef}
                  aria-controls={menuOpen ? "menu-list-grow" : undefined}
                  aria-haspopup="true"
                  onClick={handleMenuToggle}
                  disableRipple
                >
                  {userName}
                </Button>
                <Popper
                  open={menuOpen}
                  anchorEl={anchorRef.current}
                  role={undefined}
                  transition
                  disablePortal
                  className={classes.popper}
                >
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{
                        transformOrigin:
                          placement === "bottom"
                            ? "center top"
                            : "center bottom",
                      }}
                    >
                      <Paper>
                        <ClickAwayListener onClickAway={handleMenuClose}>
                          <MenuList
                            autoFocusItem={menuOpen}
                            id="menu-list-grow"
                            onKeyDown={handleListKeyDown}
                          >
                            <MenuItem
                              button
                              onClick={() => {
                                routerHistory.push(WORDS_PATH);
                              }}
                              className={fontClasses.boldFont}
                              style={{ color: usercolor }}
                              onMouseOver={changeUserColorMouseOver}
                              onMouseOut={changeUserColorMouseOut}
                            >
                              个人数据中心
                            </MenuItem>
                            {isAdmin ? (
                              <MenuItem
                                onClick={handleAdminClick}
                                className={fontClasses.boldFont}
                                style={{ color: doicolor }}
                                onMouseOver={changeDoiColorMouseOver}
                                onMouseOut={changeDoiColorMouseOut}
                              >
                                管理员控制中心
                              </MenuItem>
                            ) : null}
                            <MenuItem
                              onClick={() => {
                                UserService.navigateToLogout();
                              }}
                              className={fontClasses.boldFont}
                              style={{ color: logoutcolor }}
                              onMouseOver={changeLogoutColorMouseOver}
                              onMouseOut={changeLogoutColorMouseOut}
                            >
                              退出登录
                            </MenuItem>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </Box>
            ) : (
              <Box style={{ height: "42px" }}>
                <Button
                  className={classes.rightButtonName}
                  classes={{ label: fontClasses.UsernameFont }}
                  color="inherit"
                  ref={anchorRef}
                  aria-haspopup="true"
                  onClick={handleLogin}
                  disableRipple
                >
                  {isChecked ? "登录" : ""}
                </Button>
              </Box>
            )}
            <AccountCircleOutlinedIcon
              style={{ marginRight: "16px", width: "42px", height: "42px" }}
            />
            <Box style={{ height: "42px" }}>
              <Button
                className={classes.rightButtonAbout}
                classes={{ label: fontClasses.AppbarFont }}
                onClick={(e) => {
                  e.preventDefault();
                  routerHistory.push(ABOUT_PATH);
                }}
                disableRipple
              >
                关于
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Container>
  );
};

const UnikornLogoButton: React.FC = () => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const routerHistory = useHistory();

  return (
    <Button
      className={classes.logoButton}
      color="inherit"
      onClick={() => {
                  routerHistory.push("/");
                }}
      disableRipple
    >
      <Typography component={"span"} className={fontClasses.LogoFont}>
        MGSDB
      </Typography>
    </Button>
  );
};

type AppButtonProps = {
  value: string;
  width: number;
  href: string;
};

const AppButton: React.FC<AppButtonProps> = ({ value, width, href }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const routerHistory = useHistory();

  return (
    <Button
      color="inherit"
      href={href}
      onClick={(e) => {
        e.preventDefault();
        routerHistory.push(href);
      }}
      className={classes.appButton}
      classes={{ label: fontClasses.AppbarFont }}
      style={{ minWidth: width }}
      disableRipple
    >
      {value}
    </Button>
  );
};

export default MainAppBar;
