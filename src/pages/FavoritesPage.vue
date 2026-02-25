<script setup>
import { computed } from "vue";
import { useFavoritesStore } from "../stores/favoritesStore";
import { useCartStore } from "../stores/cartStore";
import ProductCard from "../components/ProductCard.vue";

const favoritesStore = useFavoritesStore();
const cartStore = useCartStore();

const products = computed(() =>
  favoritesStore.items.map((item) => ({
    ...item,
    sizes: item.sizes || [],
    inStock: item.inStock !== false,
    isSale: item.isSale || false,
    isNew: item.isNew || false,
    reviewsCount: item.reviewsCount || 0,
  })),
);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900">Обране</h1>
        <p class="text-gray-500 mt-1">
          {{ favoritesStore.total }}
          {{
            favoritesStore.total === 1
              ? "товар"
              : favoritesStore.total < 5
                ? "товари"
                : "товарів"
          }}
        </p>
      </div>
      <button
        v-if="favoritesStore.total > 0"
        @click="cartStore.isOpen = true"
        class="px-5 py-2.5 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors text-sm"
      >
        Перейти до кошика
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="favoritesStore.total === 0"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <div class="text-7xl mb-6">🤍</div>
      <h3 class="text-xl font-bold text-gray-800 mb-3">
        Список обраного порожній
      </h3>
      <p class="text-gray-400 mb-8 max-w-md">
        Додавайте кросівки до обраного, натискаючи ❤️ на картках товарів
      </p>
      <RouterLink
        to="/"
        class="px-8 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
      >
        Перейти до каталогу
      </RouterLink>
    </div>

    <!-- Products grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>
