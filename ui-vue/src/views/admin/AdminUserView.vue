<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">管理台</p>
        <h2>用户管理</h2>
        <p class="muted">统一查看账号、角色、状态并快速进行启停与权限调整。</p>
      </div>
      <div class="actions">
        <button class="secondary" type="button">导出列表</button>
        <button class="primary" type="button">邀请新用户</button>
      </div>
    </header>

    <article class="section-card">
      <header class="flex between align-center wrap">
        <div>
          <h3>筛选与搜索</h3>
          <p class="muted">按角色、状态、关键词过滤待管理的账号。</p>
        </div>
        <div class="actions gap">
          <label class="input-row">
            <span class="muted">关键词</span>
            <input v-model="keyword" type="search" placeholder="姓名 / 邮箱" />
          </label>
          <label class="input-row">
            <span class="muted">角色</span>
            <select v-model="roleFilter">
              <option value="">全部</option>
              <option value="admin">管理员</option>
              <option value="editor">编辑者</option>
              <option value="viewer">观察者</option>
            </select>
          </label>
          <label class="input-row">
            <span class="muted">状态</span>
            <select v-model="statusFilter">
              <option value="">全部</option>
              <option value="active">已启用</option>
              <option value="disabled">已停用</option>
              <option value="pending">待验证</option>
            </select>
          </label>
          <label class="input-row">
            <span class="muted">排序</span>
            <select v-model="sortKey">
              <option value="recent">最近活跃</option>
              <option value="created">创建时间</option>
              <option value="role">角色</option>
            </select>
          </label>
        </div>
      </header>
      <div class="chips">
        <button
          v-for="tag in quickTags"
          :key="tag.key"
          class="chip"
          :class="{ active: tag.key === statusFilter }"
          type="button"
          @click="statusFilter = tag.key"
        >
          {{ tag.label }}
        </button>
      </div>
      <div class="list">
        <div v-for="user in filteredUsers" :key="user.id" class="list-row">
          <div>
            <div class="flex gap align-center">
              <strong>{{ user.name }}</strong>
              <span class="pill">{{ roleLabel(user.role) }}</span>
            </div>
            <p class="muted">{{ user.email }} · 最近登录 {{ user.lastActive }}</p>
            <p class="muted">{{ user.notes }}</p>
          </div>
          <div class="actions column align-end">
            <span class="badge" :class="user.status">{{ statusLabel(user.status) }}</span>
            <div class="actions gap">
              <RouterLink :to="`${PATHS.ADMIN_USER_DETAIL_PATH}/${user.id}`" class="secondary">详情</RouterLink>
              <button class="secondary" type="button">重置密码</button>
              <button class="primary" type="button" @click="toggleStatus(user)">
                {{ user.status === "disabled" ? "启用" : "停用" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>

    <article class="section-card grid stats">
      <div>
        <p class="eyebrow">活跃用户</p>
        <h3>{{ activeCount }} 人</h3>
        <p class="muted">最近 30 天登录的用户数量。</p>
      </div>
      <div>
        <p class="eyebrow">待审核</p>
        <h3>{{ pendingCount }} 人</h3>
        <p class="muted">尚未完成邮箱验证或等待开通。</p>
      </div>
      <div>
        <p class="eyebrow">停用</p>
        <h3>{{ disabledCount }} 人</h3>
        <p class="muted">可随时重新启用以恢复访问。</p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { PATHS } from "../../router/paths";

type UserStatus = "active" | "disabled" | "pending";
type UserRole = "admin" | "editor" | "viewer";

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  createdAt: string;
  notes: string;
}

const keyword = ref("");
const roleFilter = ref<UserRole | "">("");
const statusFilter = ref<UserStatus | "">("");
const sortKey = ref<"recent" | "created" | "role">("recent");

const quickTags = [
  { key: "active", label: "只看启用" },
  { key: "pending", label: "等待验证" },
  { key: "disabled", label: "已停用" }
];

const users = ref<UserRow[]>([
  {
    id: 1,
    name: "张小雨",
    email: "xiaoyu@example.com",
    role: "admin",
    status: "active",
    lastActive: "3 分钟前",
    createdAt: "2023-10-01",
    notes: "可以分配审核权限，负责 MGID 审核和模板发布。"
  },
  {
    id: 2,
    name: "刘晨",
    email: "chen.liu@example.com",
    role: "editor",
    status: "pending",
    lastActive: "等待验证",
    createdAt: "2024-01-12",
    notes: "刚加入的数据上传同事，等待邮箱验证。"
  },
  {
    id: 3,
    name: "王可",
    email: "ke.wang@example.com",
    role: "viewer",
    status: "disabled",
    lastActive: "2 个月前",
    createdAt: "2022-05-20",
    notes: "历史成员，停用后仍需保留操作记录。"
  }
]);

const filteredUsers = computed(() => {
  const lowerKeyword = keyword.value.trim().toLowerCase();
  return [...users.value]
    .filter((u) =>
      lowerKeyword
        ? u.name.toLowerCase().includes(lowerKeyword) ||
          u.email.toLowerCase().includes(lowerKeyword)
        : true
    )
    .filter((u) => (roleFilter.value ? u.role === roleFilter.value : true))
    .filter((u) => (statusFilter.value ? u.status === statusFilter.value : true))
    .sort((a, b) => {
      if (sortKey.value === "recent") return a.lastActive.localeCompare(b.lastActive);
      if (sortKey.value === "created") return b.createdAt.localeCompare(a.createdAt);
      return a.role.localeCompare(b.role);
    });
});

const activeCount = computed(() => users.value.filter((u) => u.status === "active").length);
const pendingCount = computed(() => users.value.filter((u) => u.status === "pending").length);
const disabledCount = computed(() => users.value.filter((u) => u.status === "disabled").length);

function toggleStatus(user: UserRow) {
  user.status = user.status === "disabled" ? "active" : "disabled";
}

function roleLabel(role: UserRole) {
  return (
    {
      admin: "管理员",
      editor: "编辑者",
      viewer: "观察者"
    } as const
  )[role];
}

function statusLabel(status: UserStatus) {
  return (
    {
      active: "已启用",
      disabled: "已停用",
      pending: "待验证"
    } as const
  )[status];
}
</script>
