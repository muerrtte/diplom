import { defineStore } from "pinia";
import { ref } from "vue";

// Credentials — змініть на свої
const ADMIN_LOGIN = "admin";
const ADMIN_PASSWORD = "admin123";

export const useAuthStore = defineStore("auth", () => {
  const isAuthenticated = ref(
    localStorage.getItem("sneakshop_admin") === "true",
  );

  function login(username, password) {
    if (username === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      isAuthenticated.value = true;
      localStorage.setItem("sneakshop_admin", "true");
      return true;
    }
    return false;
  }

  function logout() {
    isAuthenticated.value = false;
    localStorage.removeItem("sneakshop_admin");
  }

  return { isAuthenticated, login, logout };
});
