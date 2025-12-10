import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";
import ErrorView from "../views/ErrorView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import LoginView from "../views/LoginView.vue";
import TemplateCreateView from "../views/templates/TemplateCreateView.vue";
import TemplateDetailView from "../views/templates/TemplateDetailView.vue";
import TemplateEditView from "../views/templates/TemplateEditView.vue";
import TemplateRecommendView from "../views/templates/TemplateRecommendView.vue";
import DevelopmentMultipartView from "../views/data/DevelopmentMultipartView.vue";
import WordDetailView from "../views/words/WordDetailView.vue";
import WordEditView from "../views/words/WordEditView.vue";
import WordCreateView from "../views/words/WordCreateView.vue";
import AdminCollectionView from "../views/admin/AdminCollectionView.vue";
import AdminWordDetailView from "../views/admin/AdminWordDetailView.vue";
import AdminTemplateDetailView from "../views/admin/AdminTemplateDetailView.vue";
import AdminDataDetailView from "../views/admin/AdminDataDetailView.vue";
import AdminMGIDDetailView from "../views/admin/AdminMGIDDetailView.vue";
import DevelopmentCreateView from "../views/data/DevelopmentCreateView.vue";
import DevelopmentEditView from "../views/data/DevelopmentEditView.vue";
import DevelopmentDetailView from "../views/data/DevelopmentDetailView.vue";
import DevelopmentPublicView from "../views/data/DevelopmentPublicView.vue";
import ApplicationDataCreateView from "../views/data/ApplicationDataCreateView.vue";
import MGIDApplyCreateView from "../views/mgid/MGIDApplyCreateView.vue";
import MGIDDetailView from "../views/mgid/MGIDDetailView.vue";
import MGIDPublicView from "../views/mgid/MGIDPublicView.vue";
import UserCenterView from "../views/UserCenterView.vue";
import { PATHS } from "./paths";

const routes: Array<RouteRecordRaw> = [
  { path: PATHS.HOME_PATH, name: "home", component: HomeView },
  { path: PATHS.ABOUT_PATH, name: "about", component: AboutView },
  { path: PATHS.TEMPLATES_CREATE_PATH, name: "templates-create", component: TemplateCreateView },
  { path: PATHS.TEMPLATES_RECOMMEND_PATH, name: "templates-recommend", component: TemplateRecommendView },
  {
    path: PATHS.DEVELOPMENT_DATA_MULYIPART_UPLOAD_PATH,
    name: "development-data-multipart",
    component: DevelopmentMultipartView
  },
  { path: `${PATHS.WORDS_DETAIL_PATH}/:id`, name: "words-detail", component: WordDetailView },
  { path: `${PATHS.WORDS_EDIT_PATH}/:id`, name: "words-edit", component: WordEditView },
  { path: `${PATHS.TEMPLATES_DETAIL_PATH}/:id`, name: "templates-detail", component: TemplateDetailView },
  { path: `${PATHS.ADMIN_PATH}/:itemType`, name: "admin", component: AdminCollectionView },
  { path: `${PATHS.ADMIN_WORDS_DETAIL_PATH}/:id`, name: "admin-words-detail", component: AdminWordDetailView },
  {
    path: `${PATHS.ADMIN_TEMPLATES_DETAIL_PATH}/:id`,
    name: "admin-templates-detail",
    component: AdminTemplateDetailView
  },
  { path: `${PATHS.ADMIN_DATA_DETAIL_PATH}/:id`, name: "admin-data-detail", component: AdminDataDetailView },
  {
    path: `${PATHS.ADMIN_MGID_DETAIL_PATH}/:MGID/:custom`,
    name: "admin-mgid-detail",
    component: AdminMGIDDetailView
  },
  { path: PATHS.WORDS_CREATE_PATH, name: "words-create", component: WordCreateView },
  { path: "/center/:itemType", name: "user-center", component: UserCenterView },
  { path: PATHS.DEVELOPMENT_DATA_CREATE_PATH, name: "development-data-create", component: DevelopmentCreateView },
  { path: `${PATHS.DEVELOPMENT_DATA_EDIT_PATH}/:id`, name: "development-data-edit", component: DevelopmentEditView },
  { path: `${PATHS.DEVELOPMENT_DATA_DETAIL_PATH}/:id`, name: "development-data-detail", component: DevelopmentDetailView },
  {
    path: `${PATHS.DEVELOPMENT_DATA_DETAIL_PUBLIC_PATH}/:id`,
    name: "development-data-public",
    component: DevelopmentPublicView
  },
  { path: `${PATHS.TEMPLATES_EDIT_PATH}/:id`, name: "templates-edit", component: TemplateEditView },
  {
    path: PATHS.APPLICATION_DATA_CREATE_PATH,
    name: "application-data-create",
    component: ApplicationDataCreateView
  },
  { path: PATHS.MGID_APPLY_CREATE_PATH, name: "mgid-apply-create", component: MGIDApplyCreateView },
  { path: `${PATHS.MGID_DETAIL_PATH}/:MGID/:custom`, name: "mgid-detail", component: MGIDDetailView },
  { path: `${PATHS.MGID_PATH}/:MGID/:custom`, name: "mgid-public", component: MGIDPublicView },
  { path: PATHS.ERROR_PATH, name: "error", component: ErrorView },
  { path: PATHS.LOGIN_PATH, name: "login", component: LoginView },
  { path: PATHS.NOT_FOUND_PATH, name: "not-found", component: NotFoundView },
  { path: "/:pathMatch(.*)*", redirect: PATHS.NOT_FOUND_PATH }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
