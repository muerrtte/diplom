<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useCartStore } from "../stores/cartStore";
import { useFavoritesStore } from "../stores/favoritesStore";

const props = defineProps({
  product: { type: Object, required: true },
});

const cartStore = useCartStore();
const favoritesStore = useFavoritesStore();

const showSizes = ref(false);
const addedToCart = ref(false);
const cardRef = ref(null);

function onClickOutside(e) {
  if (showSizes.value && cardRef.value && !cardRef.value.contains(e.target)) {
    showSizes.value = false;
  }
}
onMounted(() => document.addEventListener("click", onClickOutside));
onUnmounted(() => document.removeEventListener("click", onClickOutside));

function toggleFavorite(e) {
  e.preventDefault();
  e.stopPropagation();
  favoritesStore.toggle(props.product);
}

function quickAddToCart(e, size) {
  e.preventDefault();
  e.stopPropagation();
  cartStore.addItem(props.product, size);
  showSizes.value = false;
  addedToCart.value = true;
  setTimeout(() => (addedToCart.value = false), 1800);
}

function toggleSizes(e) {
  e.preventDefault();
  e.stopPropagation();
  showSizes.value = !showSizes.value;
}

function formatPrice(price) {
  return price.toLocaleString("uk-UA") + " ₴";
}

function renderStars(rating) {
  return Math.round(rating);
}
</script>

<template>
  <RouterLink
    ref="cardRef"
    :to="`/product/${product.id}`"
    class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 relative"
  >
    <!-- Image container -->
    <div class="relative overflow-hidden bg-gray-50 aspect-square">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      <!-- Badges -->
      <div class="absolute top-3 left-3 flex flex-col gap-1.5">
        <span
          v-if="product.isNew"
          class="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full uppercase tracking-wide"
        >
          New
        </span>
        <span
          v-if="product.isSale"
          class="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full uppercase tracking-wide"
        >
          Sale
        </span>
        <span
          v-if="!product.inStock"
          class="px-2 py-0.5 bg-gray-600 text-white text-xs font-bold rounded-full"
        >
          Немає
        </span>
      </div>

      <!-- Favorites button -->
      <button
        @click="toggleFavorite"
        class="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        :class="favoritesStore.isFavorite(product.id) ? 'opacity-100' : ''"
      >
        <svg
          class="w-5 h-5 transition-colors"
          :class="
            favoritesStore.isFavorite(product.id)
              ? 'fill-red-500 stroke-red-500'
              : 'fill-none stroke-gray-500'
          "
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>

      <!-- Quick sizes panel -->
      <Transition name="sizes-up">
        <div
          v-if="showSizes && product.inStock"
          @click.stop
          class="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3"
        >
          <p class="text-xs text-gray-500 mb-2 font-medium">Оберіть розмір:</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="size in product.sizes"
              :key="size"
              @click="(e) => quickAddToCart(e, size)"
              class="px-2.5 py-1 text-xs bg-gray-100 hover:bg-orange-500 hover:text-white rounded-lg font-medium transition-colors"
            >
              {{ size }}
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Product info -->
    <div class="p-4">
      <p
        class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1"
      >
        {{ product.brand }}
      </p>
      <h3
        class="font-semibold text-gray-900 text-sm leading-snug mb-2 truncate"
      >
        {{ product.name }}
      </h3>

      <!-- Rating -->
      <div class="flex items-center gap-1.5 mb-3">
        <div class="flex">
          <svg
            v-for="n in 5"
            :key="n"
            class="w-3.5 h-3.5"
            :class="
              n <= renderStars(product.rating)
                ? 'fill-amber-400 stroke-amber-400'
                : 'fill-gray-200 stroke-gray-200'
            "
            viewBox="0 0 24 24"
          >
            <path
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z"
            />
          </svg>
        </div>
        <span class="text-xs text-gray-400">({{ product.reviewsCount }})</span>
      </div>

      <!-- Price & Cart -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-baseline gap-2">
            <span class="font-bold text-gray-900">{{
              formatPrice(product.price)
            }}</span>
            <span
              v-if="product.oldPrice"
              class="text-xs text-gray-400 line-through"
              >{{ formatPrice(product.oldPrice) }}</span
            >
          </div>
          <span
            v-if="product.oldPrice"
            class="text-xs text-green-600 font-semibold"
          >
            -{{ Math.round((1 - product.price / product.oldPrice) * 100) }}%
          </span>
        </div>

        <!-- Add to cart button -->
        <button
          v-if="product.inStock"
          @click="toggleSizes"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          :class="
            addedToCart
              ? 'bg-green-500 text-white'
              : showSizes
                ? 'bg-orange-500 text-white'
                : 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white'
          "
        >
          <svg
            v-if="addedToCart"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          <svg
            v-else
            class="w-4 h-4"
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
          <span>{{ addedToCart ? "Додано!" : "В кошик" }}</span>
        </button>
        <span
          v-else
          class="text-xs text-gray-400 font-medium px-3 py-2 bg-gray-50 rounded-xl"
          >Немає в наявності</span
        >
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.sizes-up-enter-active,
.sizes-up-leave-active {
  transition: all 0.2s ease;
}
.sizes-up-enter-from,
.sizes-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
