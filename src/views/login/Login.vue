<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import axiosInstance from "@/api/axiosInstance"; // 正确引用封装好的 Axios

// 用户输入数据
const username = ref("");
const password = ref("");

// 路由实例
const router = useRouter();

// 处理登录逻辑
const handleLogin = async () => {
  try {
    // 调用后端接口
    const response = await axiosInstance.post("/users/login", {
      username: username.value,
      password: password.value,
    });

    // 打印后端返回的数据
    console.log("登录成功", response.data);

    // 假设后端返回的格式为：{ token: "jwt_token" }
    const { token } = response.data;

    // 将 Token 保存到 localStorage
    localStorage.setItem("token", token);

    // 显示成功消息
    alert("登录成功！");

    // 跳转到仪表盘页面
    router.push("/dashboard");
  } catch (error) {
    // 打印错误信息到控制台
    console.error("登录失败", error);

    // 显示错误消息
    alert("用户名或密码错误！");
  }
};
</script>

<template>
  <div class="login-container">
    <h1>登录</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
          type="text"
          id="username"
          v-model="username"
          placeholder="请输入用户名"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="请输入密码"
          required
        />
      </div>
      <button type="submit" class="login-button">登录</button>
    </form>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;

  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  form {
    width: 300px;
    background: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
      }

      input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }
    }

    .login-button {
      width: 100%;
      padding: 0.5rem;
      background-color: #007bff;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #0056b3;
      }
    }
  }
}
</style>
