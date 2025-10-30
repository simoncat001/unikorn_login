import React from "react";
import { Switch, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import TemplateCreate from "./pages/templates/TemplateCreate";
import TemplateDetail from "./pages/templates/TemplateDetail";
import DevelopmentDataCreate from "./pages/data/DevelopmentDataCreate";
import ApplicationDataCreate from "./pages/data/ApplicationDataCreate";
import WordDetail from "./pages/words/WordDetail";
import WordCreate from "./pages/words/WordCreate";
import AdminPage from "./components/admin/AdminPageComponent";
import AdminWordDetail from "./components/admin/AdminWordDetail";
import AdminTemplateDetail from "./components/admin/AdminTemplateDetail";
import AdminDataDetail from "./components/admin/AdminDataDetail";
import AdminMGIDDetail from "./components/admin/AdminMGIDDetail";
import NotFoundPage from "./pages/404";
import UserItem from "./pages/UserItem";
import TemplateEdit from "./pages/templates/TemplateEdit";
import WordEdit from "./pages/words/WordEdit";
import DevelopmentDetail from "./pages/data/DevelopmentDataDetail";
import DevelopmentDetailPublic from "./pages/data/DevelopmentDataDetailPublic";
import MGIDApplyCreate from "./pages/MGIDApply/MGIDApplyCreate";
import MGIDDetail from "./pages/MGIDApply/MGIDDetail";
import About from "./pages/About";
import ErrorPage from "./pages/ErrorPage";
import TemplateRecommand from "./pages/templateRecommand/TemplateRecommand"; // 模板推荐
import DevelopmentDataMultipartUpload from "./pages/multiDataUplaod/DevelopmentDataMultipartUpload"; // 分片上传测试页面
import Login from "./pages/Login";

import {
  WORDS_CREATE_PATH,
  TEMPLATES_CREATE_PATH,
  HOME_PATH,
  WORDS_DETAIL_PATH,
  WORDS_EDIT_PATH,
  TEMPLATES_DETAIL_PATH,
  DEVELOPMENT_DATA_CREATE_PATH,
  DEVELOPMENT_DATA_DETAIL_PATH,
  DEVELOPMENT_DATA_DETAIL_PUBLIC_PATH,
  DEVELOPMENT_DATA_EDIT_PATH,
  TEMPLATES_EDIT_PATH,
  APPLICATION_DATA_CREATE_PATH,
  ADMIN_PATH,
  ADMIN_WORDS_DETAIL_PATH,
  ADMIN_TEMPLATES_DETAIL_PATH,
  ADMIN_DATA_DETAIL_PATH,
  ADMIN_MGID_DETAIL_PATH,
  MGID_APPLY_CREATE_PATH,
  MGID_DETAIL_PATH,
  ABOUT_PATH,
  ERROR_PATH,
  MGID_PATH,
  TEMPLATES_RECOMMEND_PATH,
  DEVELOPMENT_DATA_MULYIPART_UPLOAD_PATH, // 分片上传路由
  LOGIN_PATH,
} from "./common/Path";
import DevelopmentDataEdit from "./pages/data/DevelopmentDataEdit";

// React 17 + react-router-dom v5 + modern TS can hit d.ts duplication issues.
// Use loose-typed aliases to avoid cross-version @types/react incompat.
const SwitchCompat: React.ComponentType<any> =
  (Switch as unknown) as React.ComponentType<any>;
const RouteCompat: React.ComponentType<any> =
  (Route as unknown) as React.ComponentType<any>;

function App() {
  return (
      <SwitchCompat>
        <RouteCompat exact path={HOME_PATH} component={Home} />
        <RouteCompat exact path={ABOUT_PATH} component={About} />
        <RouteCompat exact path={TEMPLATES_CREATE_PATH} component={TemplateCreate} />
        <RouteCompat
          exact
          path={TEMPLATES_RECOMMEND_PATH} // 模板推荐页面
          component={TemplateRecommand}
        />
        <RouteCompat
          exact
          path={DEVELOPMENT_DATA_MULYIPART_UPLOAD_PATH} // 测试分片上传使用，不对外展示
          component={DevelopmentDataMultipartUpload}
        />
        <RouteCompat exact path={`${WORDS_DETAIL_PATH}/:id`} component={WordDetail} />
        <RouteCompat exact path={`${WORDS_EDIT_PATH}/:id`} component={WordEdit} />
        <RouteCompat
          exact
          path={`${TEMPLATES_DETAIL_PATH}/:id`}
          component={TemplateDetail}
        />
        <RouteCompat exact path={`${ADMIN_PATH}/:itemType`} component={AdminPage} />
        <RouteCompat
          exact
          path={`${ADMIN_WORDS_DETAIL_PATH}/:id`}
          component={AdminWordDetail}
        />
        <RouteCompat
          exact
          path={`${ADMIN_TEMPLATES_DETAIL_PATH}/:id`}
          component={AdminTemplateDetail}
        />
        <RouteCompat
          exact
          path={`${ADMIN_DATA_DETAIL_PATH}/:id`}
          component={AdminDataDetail}
        />
        <RouteCompat
          exact
          path={`${ADMIN_MGID_DETAIL_PATH}/:MGID/:custom`}
          component={AdminMGIDDetail}
        />
        <RouteCompat exact path={WORDS_CREATE_PATH} component={WordCreate} />
        <RouteCompat exact path="/center/:itemType" component={UserItem} />
        <RouteCompat
          exact
          path={DEVELOPMENT_DATA_CREATE_PATH}
          component={DevelopmentDataCreate}
        />
        <RouteCompat
          exact
          path={`${DEVELOPMENT_DATA_EDIT_PATH}/:id`}
          component={DevelopmentDataEdit}
        />
        <RouteCompat
          exact
          path={`${DEVELOPMENT_DATA_DETAIL_PATH}/:id`}
          component={DevelopmentDetail}
        />
        <RouteCompat
          exact
          path={`${DEVELOPMENT_DATA_DETAIL_PUBLIC_PATH}/:id`}
          component={DevelopmentDetailPublic}
        />
        <RouteCompat
          exact
          path={`${TEMPLATES_EDIT_PATH}/:id`}
          component={TemplateEdit}
        />
        <RouteCompat path={APPLICATION_DATA_CREATE_PATH} component={ApplicationDataCreate} />
        <RouteCompat path={MGID_APPLY_CREATE_PATH} component={MGIDApplyCreate} />
        <RouteCompat
          path={`${MGID_DETAIL_PATH}/:MGID/:custom`}
          component={MGIDDetail}
        />
        <RouteCompat path={`${MGID_PATH}/:MGID/:custom`} component={MGIDDetail} />
        <RouteCompat exact path={ERROR_PATH} component={ErrorPage} />
        <RouteCompat exact path={LOGIN_PATH} component={Login} />
        <RouteCompat exact component={NotFoundPage} />
      </SwitchCompat>
  );
}

export default App;
