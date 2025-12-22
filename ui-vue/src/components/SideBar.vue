<template>
  <div class="sidebar" :class="{ collapsed: !isOpen }">
    <button class="toggle-btn" @click="toggleSidebar">
      <span v-if="isOpen">◀</span>
      <span v-else>▶</span>
    </button>
    
    <div class="sidebar-content" v-show="isOpen">
      <div class="sidebar-header">
        <span class="icon">📋</span>
        <span class="title">个人数据中心</span>
      </div>
      
      <nav class="sidebar-nav">
        <router-link :to="paths.WORDS_PATH" class="nav-item" active-class="active">
          <span class="nav-text">词汇</span>
        </router-link>
        <router-link :to="paths.TEMPLATES_PATH" class="nav-item" active-class="active">
          <span class="nav-text">模板</span>
        </router-link>
        <router-link :to="paths.DEVELOPMENT_DATA_PATH" class="nav-item" active-class="active">
          <span class="nav-text">研发数据</span>
        </router-link>
        <router-link :to="paths.MGID_APPLY_PATH" class="nav-item" active-class="active">
          <span class="nav-text">MGID申请记录</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as paths from '../router/paths';

const isOpen = ref(true);

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  transition: width 0.3s ease;
  width: 240px;
  position: relative;
  height: 100%;
}

.sidebar.collapsed {
  width: 20px;
}

.toggle-btn {
  position: absolute;
  top: 50%;
  right: -20px;
  width: 20px;
  height: 40px;
  background-color: #f0f0f0;
  border: 1px solid #e0e0e0;
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
  z-index: 10;
}

.sidebar-content {
  padding: 20px 0;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 20px;
  font-weight: bold;
  color: #063E8B;
}

.sidebar-header .icon {
  margin-right: 10px;
  font-size: 20px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px 12px 50px;
  text-decoration: none;
  color: #333;
  transition: background-color 0.2s;
  font-size: 14px;
}

.nav-item:hover {
  background-color: #f5f5f5;
}

.nav-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}
</style>
