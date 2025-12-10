# Unikorn Login - Vue 版本

该目录提供 Vue 3 + Vite 的前端实现，用于逐步替换原有 React 界面。现已补齐与旧版一致的业务入口，并提供可交互的表单/详情页面（模板、词条、数据、MGID、管理台等），便于直接接入真实接口。

## 开发

```bash
cd ui-vue
npm install
npm run dev
```

默认开发端口为 `4173`（可在 `vite.config.ts` 中调整）。如果安装阶段遇到外部网络限制，可按需配置镜像源后重试。

## 构建

```bash
npm run build
npm run preview
```

## 目录结构

- `src/router/paths.ts`：与原前端一致的路由常量定义并导出 `PATHS` 快捷集合。
- `src/router/index.ts`：完整路由注册，覆盖模板、数据、词条、MGID、管理台、个人中心等入口。
- `src/views`：按业务模块拆分的 Vue 页面（创建/编辑/详情/审核/推荐/分片上传等）。
- `src/components`：导航与通用占位组件，可在接入真实接口后继续复用。
- `src/style.css`：统一的表单、列表、时间线与布局样式。

用户管理已包含账号列表（筛选/排序/启停）、角色与权限编辑、时间线记录等示例交互，可直接替换为真实接口数据。

迁移业务逻辑时可在对应视图内替换示例数据与 `alert` 提交逻辑，直接对接接口与状态管理。
