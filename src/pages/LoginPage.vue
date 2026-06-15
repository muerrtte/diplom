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
const showPassword = ref(false);
const showConfirmPassword = ref(false);

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
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Пароль</label>
              <div class="relative">
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Введіть пароль"
                  class="w-full px-4 py-3 pr-11 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
              </div>
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
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Пароль * (мін. 6 символів)</label>
              <div class="relative">
                <input
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Мінімум 6 символів"
                  class="w-full px-4 py-3 pr-11 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Повторіть пароль *</label>
              <div class="relative">
                <input
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Повторіть пароль"
                  class="w-full px-4 py-3 pr-11 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                />
                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg v-if="showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
              </div>
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
