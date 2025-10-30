import React from "react";
import ToolBar from "@material-ui/core/Toolbar";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import FormatListBulletedRoundedIcon from "@material-ui/icons/FormatListBulletedRounded";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Common from "../common/Common";
import ListComponent from "./ListComponent";
import {
  WORDS_PATH,
  TEMPLATES_PATH,
  DEVELOPMENT_DATA_PATH,
  MGID_APPLY_PATH,
} from "../common/Path";

const aColor = Common.allColor;
const useStyles = makeStyles({
  root: {
    display: "flex",
  },
  drawerPaper: {
    width: "208px",
    overflow: "hidden",
  },
  drawerContainer: {
    overflow: "hidden",
  },
  StartList: {
    marginTop: "6px",
  },
  CloseIconList: {
    marginTop: "37.5px",
  },
  CloseButton: {
    marginLeft: "183px",
    backgroundColor: aColor.accentBackground,
    height: "50px",
    width: "25px",
    top: "455px",
    borderRadius: "25px 0px 0px 25px",
    clipPath: "inset(0px 35px 0px 0px)",
  },
  OpenButton: {
    backgroundColor: aColor.accentBackground,
    height: "50px",
    width: "25px",
    borderRadius: "0px 25px 25px 0px",
    top: "455px",
    marginLeft: "-37.5px",
    clipPath: "inset(0px 0px 0px 35px)",
  },
  OpenArrow: {
    marginLeft: "35px",
    color: aColor.deepBlue,
  },
  CloseArrow: {
    marginRight: "37.5px",
    color: aColor.deepBlue,
  },
});

const SideBar: React.FC = () => {
  const classes = useStyles();
  const [OpenSideBar, setOpenSideBar] = React.useState(true);
  const handleSideBarOpen = () => {
    setOpenSideBar(true);
  };
  const handleSideBarClose = () => {
    setOpenSideBar(false);
  };
  return (
    <div className={classes.root}>
      <Button onClick={handleSideBarOpen} className={classes.OpenButton}>
        <NavigateNextIcon className={classes.OpenArrow} />
      </Button>
      <Drawer
        open={OpenSideBar}
        variant="persistent"
        classes={{
          paper: classes.drawerPaper,
        }}
        style={OpenSideBar ? { minWidth: "208px" } : { minWidth: "0px" }}
      >
        <ToolBar />
        <Button onClick={handleSideBarClose} className={classes.CloseButton}>
          <NavigateBeforeIcon className={classes.CloseArrow} />
        </Button>
        <div className={classes.drawerContainer}>
          <ListComponent
            title={"个人数据中心"}
            href={WORDS_PATH}
            Icon={
              <FormatListBulletedRoundedIcon
                style={{ color: aColor.deepBlue }}
              />
            }
            path={"//"}
            section={true}
          />
          <Collapse in={true} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListComponent
                title={"词汇"}
                href={WORDS_PATH}
                path={WORDS_PATH}
                section={false}
              />
              <ListComponent
                title={"模板"}
                href={TEMPLATES_PATH}
                path={TEMPLATES_PATH}
                section={false}
              />
              <ListComponent
                title={"研发数据"}
                href={DEVELOPMENT_DATA_PATH}
                path={DEVELOPMENT_DATA_PATH}
                section={false}
              />
              <ListComponent
                title={"MGID申请记录"}
                href={MGID_APPLY_PATH}
                path={MGID_APPLY_PATH}
                section={false}
              />
            </List>
          </Collapse>
        </div>
      </Drawer>
    </div>
  );
};
export default SideBar;
