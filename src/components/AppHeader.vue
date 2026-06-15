<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCartStore } from "../stores/cartStore";
import { useFavoritesStore } from "../stores/favoritesStore";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { useMessagesStore } from "../stores/messagesStore";

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const favoritesStore = useFavoritesStore();
const auth = useAuthStore();
const userStore = useUserStore();
const messagesStore = useMessagesStore();

const searchQuery = ref(route.query.search || "");
const mobileMenuOpen = ref(false);

watch(() => route.query.search, (val) => {
  searchQuery.value = val || "";
});

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: "/", query: { search: searchQuery.value.trim() } });
    mobileMenuOpen.value = false;
  } else {
    router.push({ path: "/" });
  }
}

// Contact modal
const contactOpen = ref(false);
const contactForm = ref({ name: "", email: "", phone: "", text: "" });
const contactSending = ref(false);
const contactSent = ref(false);
const contactError = ref("");

function openContact() {
  if (!userStore.isLoggedIn) {
    router.push("/login");
    mobileMenuOpen.value = false;
    return;
  }
  contactForm.value = {
    name: userStore.currentUser?.name || "",
    email: userStore.currentUser?.email || "",
    phone: userStore.currentUser?.phone || "",
    text: "",
  };
  contactSent.value = false;
  contactError.value = "";
  contactOpen.value = true;
  mobileMenuOpen.value = false;
}

async function sendContact() {
  contactError.value = "";
  if (!contactForm.value.name.trim() || !contactForm.value.text.trim()) {
    contactError.value = "Заповніть ім'я та повідомлення";
    return;
  }
  contactSending.value = true;
  try {
    await messagesStore.sendMessage(contactForm.value);
    contactSent.value = true;
  } catch {
    contactError.value = "Помилка відправки. Спробуйте ще раз.";
  } finally {
    contactSending.value = false;
  }
}
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16 gap-4">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 shrink-0">
          <span class="text-2xl">👟</span>
          <span class="font-extrabold text-xl text-gray-900 tracking-tight"
            >Sneak<span class="text-orange-500">Shop</span></span
          >
        </RouterLink>

        <!-- Navigation (desktop) -->
        <nav class="hidden md:flex items-center gap-1 text-sm font-medium">
          <RouterLink
            to="/"
            class="px-3 py-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all"
            exact-active-class="text-orange-500 bg-orange-50"
          >
            Головна
          </RouterLink>
          <button
            @click="openContact"
            class="px-3 py-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
            Написати нам
          </button>
        </nav>

        <!-- Search bar -->
        <div
          class="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-orange-400 focus-within:bg-white transition-all"
        >
          <svg
            class="w-4 h-4 text-gray-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"
            />
          </svg>
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Пошук кросівок..."
            class="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
          />
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-1">
          <!-- Favorites -->
          <RouterLink
            to="/favorites"
            class="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              class="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <span
              v-if="favoritesStore.total > 0"
              class="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
            >
              {{ favoritesStore.total > 9 ? "9+" : favoritesStore.total }}
            </span>
          </RouterLink>

          <!-- Cart -->
          <button
            @click="cartStore.isOpen = true"
            class="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              class="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
            >
              {{ cartStore.totalItems > 9 ? "9+" : cartStore.totalItems }}
            </span>
          </button>

          <!-- User account button -->
          <RouterLink
            v-if="userStore.isLoggedIn"
            to="/profile"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-orange-50 transition-colors group"
            title="Мій профіль"
          >
            <div
              class="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
            >
              {{ userStore.currentUser.name?.charAt(0)?.toUpperCase() }}
            </div>
            <span
              class="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-orange-600 max-w-[80px] truncate"
            >
              {{ userStore.currentUser.name?.split(" ")[0] }}
            </span>
          </RouterLink>
          <RouterLink
            v-else
            to="/login"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-gray-200 hover:border-orange-400 hover:text-orange-500 transition-colors text-sm font-medium text-gray-600"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            Увійти
          </RouterLink>

          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              v-if="!mobileMenuOpen"
              class="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <svg
              v-else
              class="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition name="slide-down">
        <div
          v-if="mobileMenuOpen"
          class="md:hidden border-t border-gray-100 py-3 space-y-1"
        >
          <!-- Mobile search -->
          <div
            class="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-3"
          >
            <svg
              class="w-4 h-4 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"
              />
            </svg>
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              placeholder="Пошук..."
              class="bg-transparent text-sm outline-none w-full"
            />
          </div>
          <RouterLink
            to="/"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500"
            >Головна</RouterLink
          >
          <button
            @click="openContact"
            class="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
            Написати нам
          </button>
        </div>
      </Transition>
    </div>

    <!-- Contact modal -->
    <Transition name="fade">
      <div
        v-if="contactOpen"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        @click.self="contactOpen = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
              </svg>
              <h3 class="text-lg font-bold text-gray-900">Написати нам</h3>
            </div>
            <button @click="contactOpen = false" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5">
            <Transition name="fade" mode="out-in">
              <!-- Success -->
              <div v-if="contactSent" key="sent" class="text-center py-6">
                <div class="text-5xl mb-3">✅</div>
                <p class="text-lg font-semibold text-gray-900 mb-1">Повідомлення відправлено!</p>
                <p class="text-sm text-gray-500 mb-5">Ми зв'яжемося з вами найближчим часом.</p>
                <div class="flex gap-3">
                  <button
                    @click="contactSent = false; contactForm = { name: '', email: '', phone: '', text: '' }"
                    class="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    Написати ще
                  </button>
                  <button
                    @click="contactOpen = false"
                    class="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Закрити
                  </button>
                </div>
              </div>

              <!-- Form -->
              <div v-else key="form" class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 mb-1">Ім'я *</label>
                    <input
                      v-model="contactForm.name"
                      type="text"
                      placeholder="Ваше ім'я"
                      class="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-orange-400 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 mb-1">Телефон</label>
                    <input
                      v-model="contactForm.phone"
                      type="tel"
                      placeholder="+380..."
                      class="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-orange-400 transition"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                  <input
                    v-model="contactForm.email"
                    type="email"
                    placeholder="email@example.com"
                    class="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-orange-400 transition"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Повідомлення *</label>
                  <textarea
                    v-model="contactForm.text"
                    rows="4"
                    placeholder="Ваше питання або пропозиція..."
                    class="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-orange-400 transition resize-none"
                  ></textarea>
                </div>
                <p v-if="contactError" class="text-red-500 text-sm">{{ contactError }}</p>
                <button
                  @click="sendContact"
                  :disabled="contactSending"
                  class="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                >
                  <svg v-if="contactSending" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  {{ contactSending ? "Відправка..." : "Надіслати повідомлення" }}
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
