<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <h2 class="login-title">MGSDB登录</h2>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <form class="login-form" @submit.prevent="submit">
        <div class="login-form-group">
          <label for="email">用户名</label>
          <input
            id="email"
            v-model="form.email"
            type="text"
            class="login-input"
            placeholder="请输入用户名"
            required
            :disabled="isLoading"
          />
        </div>
        <div class="login-form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="login-input"
            placeholder="请输入密码"
            required
            :disabled="isLoading"
          />
        </div>
        <button class="login-button" type="submit" :disabled="isLoading">
          {{ isLoading ? "登录中..." : "登录" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import UserService from "@/api/UserService";

const router = useRouter();

const form = reactive({
  email: "",
  password: ""
});

const isLoading = ref(false);
const errorMessage = ref("");

const submit = async () => {
  if (!form.email || !form.password) {
    errorMessage.value = "请输入用户名和密码";
    return;
  }
  
  isLoading.value = true;
  errorMessage.value = "";
  
  try {
    await UserService.login(form.email, form.password);
    // 登录成功，跳转到首页
    router.push("/");
  } catch (error: any) {
    errorMessage.value = error.message || "登录失败，请检查用户名和密码";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-form-wrapper {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.login-form-group {
  margin-bottom: 20px;
}

.login-form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.login-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
  box-sizing: border-box;
}

.login-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.login-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.login-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.login-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}
</style>
