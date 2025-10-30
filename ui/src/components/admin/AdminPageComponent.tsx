import React, { useState } from "react";
import { Tabs, Tab, AppBar, makeStyles } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import AdminWordPanel from "./AdminWordPanel";
import AdminTemplatePanel from "./AdminTemplatePanel";
import AdminDataPanel from "./AdminDataPanel";
import AdminMGIDPanel from "./AdminMGIDPanel";
import AdminAreaPanel from "./AdminAreaPanel";
import AdminUserPanel from "./AdminUserPanel";
import MainBar from "../../containers/MainAppBar";
import Common from "../../common/Common";
import AdminService from "../../api/AdminService";
import UserService from "../../api/UserService";
import { RouteComponentProps } from "react-router";
import { Link, useHistory } from "react-router-dom";
import {
  ADMIN_WORDS_PATH,
  ADMIN_TEMPLATES_PATH,
  ADMIN_DATA_PATH,
  ADMIN_MGID_PATH,
  ADMIN_USER_PATH,
  ADMIN_COUNTRY_PATH,
} from "../../common/Path";

const useStyles = makeStyles((theme) => ({
  tabIndicator: {
    backgroundColor: Common.allColor.primaryColor,
  },
  tabs: {
    "& .MuiTab-wrapper": {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginLeft: "16px",
    },
  },
}));

const AdminPage: React.FC<RouteComponentProps<{ itemType: string }>> = ({
  match,
}) => {
  const itemType = match.params.itemType;
  const classes = useStyles();
  const [value, setValue] = useState(itemType);
  const [isAdmin, setIsAdmin] = React.useState(true);
  const [adminChecked, setAdminChecked] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      try {
        const isUserAdmin = await AdminService.checkAdmin();
        setIsAdmin(isUserAdmin);
        setAdminChecked(true);
      } catch (e) {
        UserService.navigateToErrorPage();
      }
    })();
  }, []);

  React.useEffect(() => {
    void (async () => {
      if (!isAdmin && adminChecked) {
        UserService.navigateToErrorPage();
      }
    })();
  }, [isAdmin, adminChecked]);

  const selectPanel = (idx: string) => {
    switch (idx) {
      case "words":
        return <AdminWordPanel />;
      case "templates":
        return <AdminTemplatePanel />;
      case "data":
        return <AdminDataPanel />;
      case "MGID":
        return <AdminMGIDPanel />;
      case "user":
        return <AdminUserPanel />;
      case "country":
        return <AdminAreaPanel />;
      default:
        return <AdminWordPanel />;
    }
  };

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box display="flex" flexDirection="column" flexGrow={1}>
      <Box display="flex">
        <AppBar position="fixed">
          <MainBar />
        </AppBar>
        <Box height="64px" />
      </Box>
      <Box display="flex" flexGrow={1} style={{ minWidth: "1024px" }}>
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="flex-start"
          marginTop="44px"
        >
          <Tabs
            value={value}
            orientation="vertical"
            onChange={handleChange}
            classes={{
              indicator: classes.tabIndicator,
            }}
            className={classes.tabs}
          >
            <Tab
              label="词汇审核"
              value="words"
              onClick={() => window.location.href = ADMIN_WORDS_PATH}
            />
            <Tab
              label="模板审核"
              value="templates"
              onClick={() => window.location.href = ADMIN_TEMPLATES_PATH}
            />
            <Tab
              label="研发数据审核"
              value="data"
              onClick={() => window.location.href = ADMIN_DATA_PATH}
            />
            <Tab
              label="MGID管理"
              value="MGID"
              onClick={() => window.location.href = ADMIN_MGID_PATH}
            />
            <Tab
              label="用户信息"
              value="user"
              onClick={() => window.location.href = ADMIN_USER_PATH}
            />
            <Tab
              label="国家/单位编号"
              value="country"
              onClick={() => window.location.href = ADMIN_COUNTRY_PATH}
            />
          </Tabs>
        </Box>
        <Box display="flex" flexGrow={1} marginTop="44px">
          {selectPanel(value)}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPage;
