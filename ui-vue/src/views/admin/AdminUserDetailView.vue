<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">用户详情</p>
        <h2>{{ user.name }} <span class="pill">{{ roleLabel(user.role) }}</span></h2>
        <p class="muted">邮箱 {{ user.email }} · 注册于 {{ user.createdAt }} · 最近登录 {{ user.lastActive }}</p>
      </div>
      <div class="actions">
        <button class="secondary" type="button">发送验证邮件</button>
        <button class="primary" type="button">保存变更</button>
      </div>
    </header>

    <article class="section-card grid">
      <div>
        <h3>基本信息</h3>
        <ul class="kv">
          <li><span>电话</span><strong>{{ user.phone }}</strong></li>
          <li><span>所属团队</span><strong>{{ user.team }}</strong></li>
          <li><span>国家/地区</span><strong>{{ user.country }}</strong></li>
          <li><span>常用来源</span><strong>{{ user.preferred }}</strong></li>
        </ul>
        <p class="muted">补充用户画像，便于分配合理的资源与权限。</p>
      </div>
      <div>
        <h3>角色与权限</h3>
        <div class="chips">
          <label v-for="role in roles" :key="role.value" class="chip">
            <input v-model="user.role" :value="role.value" name="role" type="radio" />
            {{ role.label }}
          </label>
        </div>
        <div class="list compact">
          <div v-for="perm in permissions" :key="perm.key" class="list-row">
            <div>
              <strong>{{ perm.label }}</strong>
              <p class="muted">{{ perm.desc }}</p>
            </div>
            <label class="switch">
              <input v-model="perm.enabled" type="checkbox" />
              <span class="slider" />
            </label>
          </div>
        </div>
      </div>
    </article>

    <article class="section-card">
      <header class="flex between align-center wrap">
        <div>
          <h3>安全与状态</h3>
          <p class="muted">重置密码、强制登出或暂停账号访问。</p>
        </div>
        <div class="actions gap">
          <button class="secondary" type="button">重置密码</button>
          <button class="secondary" type="button">踢出当前登录</button>
          <button class="primary" type="button">{{ user.status === "disabled" ? "启用账号" : "暂停账号" }}</button>
        </div>
      </header>
      <div class="timeline">
        <div v-for="event in events" :key="event.time" class="timeline-row">
          <div class="dot" />
          <div>
            <strong>{{ event.title }}</strong>
            <p class="muted">{{ event.time }} · {{ event.detail }}</p>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const userId = route.params.id;

const user = reactive({
  id: userId,
  name: "张小雨",
  email: "xiaoyu@example.com",
  phone: "+86 13800000000",
  country: "中国",
  team: "内容审核组",
  preferred: "模板与数据审核",
  role: "admin",
  status: "active",
  createdAt: "2023-10-01",
  lastActive: "3 分钟前"
});

const roles = [
  { value: "admin", label: "管理员" },
  { value: "editor", label: "编辑者" },
  { value: "viewer", label: "观察者" }
];

const permissions = reactive([
  { key: "template", label: "模板管理", desc: "创建、编辑、发布模板", enabled: true },
  { key: "data", label: "数据审核", desc: "审核上传数据与公开内容", enabled: true },
  { key: "mgid", label: "MGID 审核", desc: "审批 MGID 申请与调整", enabled: true },
  { key: "user", label: "用户维护", desc: "邀请、停用或修改他人角色", enabled: true }
]);

const events = [
  { time: "今天 10:21", title: "修改角色为管理员", detail: "由系统管理员设置" },
  { time: "昨天 18:02", title: "登录成功", detail: "IP 49.72.x.x，上海" },
  { time: "本周一", title: "完成 MGID 审核", detail: "审批 3 条待处理申请" }
];

function roleLabel(role: string) {
  return (
    {
      admin: "管理员",
      editor: "编辑者",
      viewer: "观察者"
    } as const
  )[role] || role;
}
</script>
