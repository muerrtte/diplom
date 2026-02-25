<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref("login"); // 'login' | 'register'

const loginForm = ref({ email: "", password: "" });
const registerForm = ref({
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

const loading = ref(false);
const error = ref("");

async function handleLogin() {
  error.value = "";
  if (!loginForm.value.email || !loginForm.value.password) {
    error.value = "Заповніть всі поля";
    return;
  }
  loading.value = true;
  try {
    await userStore.login(loginForm.value.email, loginForm.value.password);
    router.push("/profile");
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

async function handleRegister() {
  error.value = "";
  if (
    !registerForm.value.name ||
    !registerForm.value.email ||
    !registerForm.value.password
  ) {
    error.value = "Заповніть всі обов'язкові поля";
    return;
  }
  if (registerForm.value.password.length < 6) {
    error.value = "Пароль повинен містити мінімум 6 символів";
    return;
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    error.value = "Паролі не співпадають";
    return;
  }
  loading.value = true;
  try {
    await userStore.register({
      name: registerForm.value.name,
      email: registerForm.value.email,
      phone: registerForm.value.phone,
      password: registerForm.value.password,
    });
    router.push("/profile");
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12"
  >
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-flex items-center gap-2">
          <span class="text-3xl">👟</span>
          <span class="font-extrabold text-2xl text-gray-900"
            >Sneak<span class="text-orange-500">Shop</span></span
          >
        </RouterLink>
        <p class="text-gray-500 mt-2 text-sm">Особистий кабінет</p>
      </div>

      <div
        class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <!-- Tabs -->
        <div class="flex border-b border-gray-100">
          <button
            @click="
              activeTab = 'login';
              error = '';
            "
            class="flex-1 py-4 text-sm font-semibold transition-colors"
            :class="
              activeTab === 'login'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-gray-600'
            "
          >
            Увійти
          </button>
          <button
            @click="
              activeTab = 'register';
              error = '';
            "
            class="flex-1 py-4 text-sm font-semibold transition-colors"
            :class="
              activeTab === 'register'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-gray-600'
            "
          >
            Реєстрація
          </button>
        </div>

        <div class="p-6">
          <!-- Login form -->
          <form
            v-if="activeTab === 'login'"
            @submit.prevent="handleLogin"
            class="space-y-4"
          >
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5"
                >Email</label
              >
              <input
                v-model="loginForm.email"
                type="email"
                placeholder="your@email.com"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5"
                >Пароль</label
              >
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="Введіть пароль"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div
              v-if="error"
              class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"
            >
              ⚠️ {{ error }}
            </div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-2xl transition-colors"
            >
              {{ loading ? "Входимо..." : "Увійти →" }}
            </button>
          </form>

          <!-- Register form -->
          <form v-else @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5"
                >Ім'я та прізвище *</label
              >
              <input
                v-model="registerForm.name"
                placeholder="Іван Петренко"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5"
                >Email *</label
              >
              <input
                v-model="registerForm.email"
                type="email"
                placeholder="your@email.com"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5"
                >Телефон</label
              >
              <input
                v-model="registerForm.phone"
                placeholder="+380 XX XXX XX XX"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5"
                >Пароль * (мін. 6 символів)</label
              >
              <input
                v-model="registerForm.password"
                type="password"
                placeholder="Мінімум 6 символів"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5"
                >Повторіть пароль *</label
              >
              <input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="Повторіть пароль"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div
              v-if="error"
              class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"
            >
              ⚠️ {{ error }}
            </div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-2xl transition-colors"
            >
              {{ loading ? "Реєструємось..." : "Зареєструватися →" }}
            </button>
          </form>
        </div>
      </div>

      <p class="text-center text-sm text-gray-400 mt-4">
        <RouterLink to="/" class="text-orange-500 hover:underline"
          >← Повернутися до магазину</RouterLink
        >
      </p>
    </div>
  </div>
</template>
