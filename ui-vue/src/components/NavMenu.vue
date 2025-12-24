<template>
  <nav>
    <ul>
      <li v-for="item in items" :key="item.to">
        <RouterLink :to="item.to">{{ item.label }}</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { PATHS } from "../router/paths";

const items = [
  { label: "首页", to: PATHS.HOME_PATH },
  { label: "关于", to: PATHS.ABOUT_PATH },
  { label: "登录", to: PATHS.LOGIN_PATH },
  { label: "创建模板", to: PATHS.TEMPLATES_CREATE_PATH },
  { label: "模板推荐", to: PATHS.TEMPLATES_RECOMMEND_PATH },
  { label: "开发数据上传", to: PATHS.DEVELOPMENT_DATA_CREATE_PATH },
  { label: "创建词条", to: PATHS.WORDS_CREATE_PATH },
  { label: "MGID 申请", to: PATHS.MGID_APPLY_CREATE_PATH },
  { label: "管理台", to: `${PATHS.ADMIN_PATH}/words` },
  { label: "用户管理", to: PATHS.ADMIN_USER_PATH }
];
</script>
