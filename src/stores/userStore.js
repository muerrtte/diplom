import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user", () => {
  const currentUser = ref(
    JSON.parse(localStorage.getItem("sneakshop_user") || "null"),
  );

  const isLoggedIn = computed(() => !!currentUser.value);

  async function register({ name, email, password, phone }) {
    // Перевірити чи існує користувач
    const checkRes = await fetch(
      `/api/users?email=${encodeURIComponent(email)}`,
    );
    const existing = await checkRes.json();
    if (existing.length > 0)
      throw new Error("Користувач з таким email вже існує");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        phone: phone || "",
        createdAt: new Date().toISOString(),
      }),
    });
    if (!res.ok) throw new Error("Помилка реєстрації");
    const user = await res.json();
    // Не зберігаємо пароль локально
    const { password: _pwd, ...safeUser } = user;
    currentUser.value = safeUser;
    localStorage.setItem("sneakshop_user", JSON.stringify(safeUser));
    return safeUser;
  }

  async function login(email, password) {
    const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
    const users = await res.json();
    if (users.length === 0 || users[0].password !== password) {
      throw new Error("Невірний email або пароль");
    }
    const { password: _pwd, ...safeUser } = users[0];
    currentUser.value = safeUser;
    localStorage.setItem("sneakshop_user", JSON.stringify(safeUser));
    return safeUser;
  }

  function logout() {
    currentUser.value = null;
    localStorage.removeItem("sneakshop_user");
  }

  return { currentUser, isLoggedIn, register, login, logout };
});
