<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCartStore } from "../stores/cartStore";
import { useFavoritesStore } from "../stores/favoritesStore";

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const favoritesStore = useFavoritesStore();

const searchQuery = ref("");
const mobileMenuOpen = ref(false);

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({
      path: "/",
      query: { ...route.query, search: searchQuery.value.trim() },
    });
    mobileMenuOpen.value = false;
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
          <RouterLink
            :to="{ path: '/', query: { category: 'running' } }"
            class="px-3 py-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all"
          >
            Бігові
          </RouterLink>
          <RouterLink
            :to="{ path: '/', query: { category: 'casual' } }"
            class="px-3 py-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all"
          >
            Повсякденні
          </RouterLink>
          <RouterLink
            :to="{ path: '/', query: { isSale: 'true' } }"
            class="px-3 py-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-all font-semibold"
          >
            🔥 Розпродаж
          </RouterLink>
          <RouterLink
            to="/admin"
            class="px-3 py-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all"
            active-class="text-orange-500 bg-orange-50"
          >
            ⚙️ Адмін
          </RouterLink>
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
          <RouterLink
            :to="{ path: '/', query: { category: 'running' } }"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500"
            >Бігові</RouterLink
          >
          <RouterLink
            :to="{ path: '/', query: { category: 'casual' } }"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500"
            >Повсякденні</RouterLink
          >
          <RouterLink
            :to="{ path: '/', query: { isSale: 'true' } }"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-lg text-red-500 font-semibold hover:bg-red-50"
            >🔥 Розпродаж</RouterLink
          >
        </div>
      </Transition>
    </div>
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
</style>
