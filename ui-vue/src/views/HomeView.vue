<template>
  <section>
    <h2 style="margin: 0 0 12px;">欢迎使用新的 Vue 前端</h2>
    <p style="margin: 0 0 16px; color: #4b5563;">
      这里汇总了原有 React 版本的路由入口，方便逐步迁移具体业务功能。
    </p>

    <div class="grid">
      <div class="card">
        <h3 style="margin-top: 0;">模板与词条</h3>
        <ul style="padding-left: 18px; margin: 0; color: #374151;">
          <li><RouterLink :to="paths.TEMPLATES_CREATE_PATH">创建模板</RouterLink></li>
          <li><RouterLink :to="paths.TEMPLATES_RECOMMEND_PATH">模板推荐</RouterLink></li>
          <li><RouterLink :to="paths.WORDS_CREATE_PATH">创建词条</RouterLink></li>
        </ul>
      </div>
      <div class="card">
        <h3 style="margin-top: 0;">数据</h3>
        <ul style="padding-left: 18px; margin: 0; color: #374151;">
          <li><RouterLink :to="paths.DEVELOPMENT_DATA_CREATE_PATH">上传开发数据</RouterLink></li>
          <li><RouterLink :to="paths.APPLICATION_DATA_CREATE_PATH">上传应用数据</RouterLink></li>
          <li><RouterLink :to="paths.DEVELOPMENT_DATA_MULYIPART_UPLOAD_PATH">分片上传测试</RouterLink></li>
        </ul>
      </div>
      <div class="card">
        <h3 style="margin-top: 0;">MGID / 其他</h3>
        <ul style="padding-left: 18px; margin: 0; color: #374151;">
          <li><RouterLink :to="paths.MGID_APPLY_CREATE_PATH">申请 MGID</RouterLink></li>
          <li><RouterLink :to="`${paths.MGID_PATH}/demo/custom`">MGID 分享示例</RouterLink></li>
          <li><RouterLink :to="paths.LOGIN_PATH">登录</RouterLink></li>
        </ul>
      </div>
      <div class="card">
        <h3 style="margin-top: 0;">管理后台</h3>
        <p style="margin: 0; color: #6b7280;">使用不同的 itemType 访问对应模块。</p>
        <RouterLink :to="`${paths.ADMIN_PATH}/words`">进入管理台</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import * as paths from "../router/paths";
</script>
