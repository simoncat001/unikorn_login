<template>
  <header class="app-bar">
    <div class="toolbar">
      <!-- Logo按钮 -->
      <button class="logo-button" @click="goHome">
        <span class="logo-text">MGSDB</span>
      </button>

      <!-- 导航链接 -->
      <router-link to="/words/create" class="nav-button">词汇</router-link>
      <router-link to="/templates/recommend" class="nav-button">模板推荐</router-link>
      <router-link to="/templates/create" class="nav-button">模板创建</router-link>
      <router-link to="/development_data/create" class="nav-button">研发数据</router-link>
      <router-link to="/application_data/create" class="nav-button">应用数据</router-link>
      <router-link to="/MGID_apply/create" class="nav-button">MGID申请</router-link>

      <!-- 占位空间 -->
      <div class="spacer"></div>

      <!-- 右侧用户信息 -->
      <div class="user-section">
        <button class="username-button" @click="toggleUserMenu" ref="menuButtonRef">
          <span class="username">{{ username }}</span>
        </button>
        <svg class="user-icon" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.07 18.28c.43-.9 3.05-1.78 4.93-1.78s4.51.88 4.93 1.78C15.57 19.36 13.86 20 12 20s-3.57-.64-4.93-1.72zm11.29-1.45c-1.43-1.74-4.9-2.33-6.36-2.33s-4.93.59-6.36 2.33C4.62 15.49 4 13.82 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 1.82-.62 3.49-1.64 4.83zM12 6c-1.94 0-3.5 1.56-3.5 3.5S10.06 13 12 13s3.5-1.56 3.5-3.5S13.94 6 12 6zm0 5c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z"/>
        </svg>
        <button class="about-button" @click="goAbout">关于</button>
      </div>
    </div>

    <!-- 用户下拉菜单 -->
    <Teleport to="body">
      <div 
        v-if="showUserMenu" 
        class="user-menu-overlay" 
        @click="closeUserMenu"
      >
        <div 
          class="user-menu-paper" 
          :style="menuPosition"
          @click.stop
        >
          <ul class="user-menu-list">
            <li class="menu-item" @click="goToUserCenter">
              个人数据中心
            </li>
            <li class="menu-item admin-item" @click="goToAdminCenter">
              管理员控制中心
            </li>
            <li class="menu-item" @click="handleLogout">
              退出登录
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('kevin');
const showUserMenu = ref(false);
const menuButtonRef = ref<HTMLElement | null>(null);

const menuPosition = computed(() => {
  if (!menuButtonRef.value) return {};
  const rect = menuButtonRef.value.getBoundingClientRect();
  return {
    position: 'fixed' as const,
    top: `${rect.bottom + 12}px`,
    right: '22px',
  };
});

const goHome = () => {
  router.push('/');
};

const goAbout = () => {
  router.push('/about');
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

const goToUserCenter = () => {
  closeUserMenu();
  router.push('/center/words');
};

const goToAdminCenter = () => {
  closeUserMenu();
  router.push('/admin/words');
};

const handleLogout = () => {
  closeUserMenu();
  console.log('退出登录');
  router.push('/login');
};
</script>

<style scoped>
.app-bar {
  width: 100%;
  background-color: #063E8B;
  color: white;
  box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
}

.toolbar {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 0 24px;
}

.logo-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.logo-button:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.logo-text {
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: bold;
}

.nav-button {
  min-width: 70px;
  padding: 8px 16px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  text-align: center;
  transition: background-color 0.2s;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.nav-button.router-link-active {
  background-color: rgba(255, 255, 255, 0.16);
}

.spacer {
  flex-grow: 1;
  min-width: 50px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
  height: 42px;
}

.username-button:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.username {
  font-weight: 400;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.user-icon {
  width: 42px;
  height: 42px;
  fill: white;
  margin-right: 16px;
}

.about-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
  height: 42px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.about-button:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

/* 用户菜单样式 */
.user-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1300;
}

.user-menu-paper {
  width: 152px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
}

.user-menu-list {
  margin: 0;
  padding: 8px 0;
  list-style: none;
}

.menu-item {
  padding: 6px 16px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.00938em;
  color: #063E8B;
  cursor: pointer;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  user-select: none;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.menu-item.admin-item {
  color: #2680C2;
}

@media (max-width: 600px) {
  .toolbar {
    min-height: 48px;
    padding: 0 16px;
  }
  
  .nav-button {
    min-width: 60px;
    font-size: 12px;
  }
}
</style>
