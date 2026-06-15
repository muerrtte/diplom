<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductsStore } from "../stores/productsStore";
import { useCartStore } from "../stores/cartStore";
import { useFavoritesStore } from "../stores/favoritesStore";
import ProductCard from "../components/ProductCard.vue";

const route = useRoute();
const router = useRouter();
const store = useProductsStore();
const cartStore = useCartStore();
const favoritesStore = useFavoritesStore();

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const selectedSize = ref(null);
const selectedColor = ref(0);
const quantity = ref(1);
const addedToCart = ref(false);
const sizeError = ref(false);
const showSizeChart = ref(false);

const isFav = computed(
  () => product.value && favoritesStore.isFavorite(product.value.id),
);

const relatedProducts = computed(() => {
  if (!product.value) return [];
  return store.products
    .filter(
      (p) =>
        p.id !== product.value.id &&
        (p.brand === product.value.brand ||
          p.category === product.value.category),
    )
    .slice(0, 4);
});

const discount = computed(() => {
  if (!product.value?.oldPrice) return null;
  return Math.round((1 - product.value.price / product.value.oldPrice) * 100);
});

function formatPrice(price) {
  return price.toLocaleString("uk-UA") + " ₴";
}

function selectSize(size) {
  selectedSize.value = size;
  sizeError.value = false;
}

function addToCart() {
  if (!selectedSize.value) {
    sizeError.value = true;
    return;
  }
  for (let i = 0; i < quantity.value; i++) {
    cartStore.addItem(product.value, selectedSize.value);
  }
  addedToCart.value = true;
  setTimeout(() => (addedToCart.value = false), 2000);
}

async function loadProduct() {
  loading.value = true;
  error.value = null;
  try {
    product.value = await store.fetchProduct(route.params.id);
    if (store.products.length === 0) {
      await store.fetchProducts();
    }
  } catch (e) {
    error.value = "Товар не знайдено";
  } finally {
    loading.value = false;
  }
}

onMounted(loadProduct);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <RouterLink to="/" class="hover:text-orange-500 transition-colors"
        >Головна</RouterLink
      >
      <span>/</span>
      <span v-if="product" class="text-gray-800 font-medium truncate max-w-xs"
        >{{ product.brand }} {{ product.name }}</span
      >
    </nav>

    <!-- Loading -->
    <div v-if="loading" class="grid md:grid-cols-2 gap-10 animate-pulse">
      <div class="aspect-square bg-gray-200 rounded-3xl"></div>
      <div class="space-y-4">
        <div class="h-5 bg-gray-200 rounded w-24"></div>
        <div class="h-8 bg-gray-200 rounded w-2/3"></div>
        <div class="h-4 bg-gray-200 rounded w-1/3"></div>
        <div class="h-10 bg-gray-200 rounded w-1/2"></div>
        <div class="flex gap-2 mt-4">
          <div
            v-for="n in 6"
            :key="n"
            class="w-12 h-12 bg-gray-200 rounded-xl"
          ></div>
        </div>
        <div class="h-14 bg-gray-200 rounded-2xl mt-6"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="text-6xl mb-4">😕</div>
      <h3 class="text-xl font-bold text-gray-800 mb-3">{{ error }}</h3>
      <button
        @click="router.back()"
        class="px-6 py-2.5 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600"
      >
        Назад
      </button>
    </div>

    <!-- Product detail -->
    <div v-else-if="product">
      <div class="grid md:grid-cols-2 gap-10 lg:gap-16">
        <!-- Image -->
        <div class="relative">
          <div
            class="aspect-square rounded-3xl overflow-hidden bg-gray-50 shadow-sm"
          >
            <img
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Badges -->
          <div class="absolute top-4 left-4 flex gap-2">
            <span
              v-if="product.isNew"
              class="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full"
              >NEW</span
            >
            <span
              v-if="product.isSale"
              class="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full"
              >SALE -{{ discount }}%</span
            >
          </div>
        </div>

        <!-- Info -->
        <div>
          <div class="flex items-start justify-between mb-2">
            <p
              class="text-sm font-bold text-orange-500 uppercase tracking-widest"
            >
              {{ product.brand }}
            </p>
            <!-- Favorites -->
            <button
              @click="favoritesStore.toggle(product)"
              class="p-2 rounded-full hover:bg-gray-100 transition-colors"
              :class="isFav ? 'text-red-500' : 'text-gray-400'"
            >
              <svg
                class="w-6 h-6 transition-all"
                :class="isFav ? 'fill-red-500 scale-110' : 'fill-none'"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>
          </div>

          <h1 class="text-3xl font-extrabold text-gray-900 mb-3">
            {{ product.name }}
          </h1>

          <!-- Rating -->
          <div class="flex items-center gap-2 mb-5">
            <div class="flex">
              <svg
                v-for="n in 5"
                :key="n"
                class="w-5 h-5"
                :class="
                  n <= Math.round(product.rating)
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
            <span class="font-semibold text-gray-700">{{
              product.rating
            }}</span>
            <span class="text-gray-400 text-sm"
              >{{ product.reviewsCount }} відгуків</span
            >
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3 mb-6">
            <span class="text-4xl font-extrabold text-gray-900">{{
              formatPrice(product.price)
            }}</span>
            <span
              v-if="product.oldPrice"
              class="text-xl text-gray-400 line-through"
              >{{ formatPrice(product.oldPrice) }}</span
            >
            <span
              v-if="discount"
              class="px-2.5 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full"
              >-{{ discount }}%</span
            >
          </div>

          <!-- Stock status -->
          <div class="flex items-center gap-2 mb-6">
            <div
              class="w-2 h-2 rounded-full"
              :class="product.inStock ? 'bg-green-500' : 'bg-red-400'"
            ></div>
            <span
              class="text-sm font-medium"
              :class="product.inStock ? 'text-green-600' : 'text-red-500'"
            >
              {{ product.inStock ? "Є в наявності" : "Немає в наявності" }}
            </span>
          </div>

          <!-- Colors -->
          <div v-if="product.colors?.length" class="mb-6">
            <p class="text-sm font-semibold text-gray-700 mb-2">
              Колір:
              <span class="text-gray-500 font-normal">{{
                product.colors[selectedColor]
              }}</span>
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(color, idx) in product.colors"
                :key="idx"
                @click="selectedColor = idx"
                class="px-3 py-1.5 rounded-full text-sm border-2 transition-all font-medium"
                :class="
                  selectedColor === idx
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                "
              >
                {{ color }}
              </button>
            </div>
          </div>

          <!-- Sizes -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-semibold text-gray-700">Розмір (EU)</p>
              <button @click="showSizeChart = true" class="text-xs text-orange-500 hover:underline">
                Таблиця розмірів
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="size in product.sizes"
                :key="size"
                @click="selectSize(size)"
                :disabled="!product.inStock"
                class="w-12 h-12 rounded-xl border-2 text-sm font-semibold transition-all"
                :class="
                  selectedSize === size
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : product.inStock
                      ? 'border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500'
                      : 'border-gray-100 text-gray-300 cursor-not-allowed'
                "
              >
                {{ size }}
              </button>
            </div>
            <p
              v-if="sizeError"
              class="text-red-500 text-xs mt-2 flex items-center gap-1"
            >
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
                />
              </svg>
              Будь ласка, оберіть розмір
            </p>
          </div>

          <!-- Quantity + Add to cart -->
          <div v-if="product.inStock" class="flex gap-3 mb-6">
            <div
              class="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                @click="quantity = Math.max(1, quantity - 1)"
                class="px-4 py-3 hover:bg-gray-50 transition-colors text-gray-600"
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
                    stroke-width="2.5"
                    d="M19.5 12h-15"
                  />
                </svg>
              </button>
              <span
                class="px-4 py-3 font-bold text-gray-900 min-w-[50px] text-center"
                >{{ quantity }}</span
              >
              <button
                @click="quantity++"
                class="px-4 py-3 hover:bg-gray-50 transition-colors text-gray-600"
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
                    stroke-width="2.5"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </div>

            <button
              @click="addToCart"
              class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-lg transition-all shadow-lg"
              :class="
                addedToCart
                  ? 'bg-green-500 text-white shadow-green-500/25'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25 hover:scale-[1.02]'
              "
            >
              <svg
                v-if="addedToCart"
                class="w-5 h-5"
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
                class="w-5 h-5"
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
              {{ addedToCart ? "Додано до кошика!" : "Додати до кошика" }}
            </button>
          </div>

          <!-- Perks -->
          <div class="grid grid-cols-3 gap-3 py-4 border-t border-gray-100">
            <div class="flex flex-col items-center gap-1 text-center">
              <span class="text-2xl">🚚</span>
              <span class="text-xs text-gray-500 font-medium"
                >Безкоштовна доставка</span
              >
            </div>
            <div class="flex flex-col items-center gap-1 text-center">
              <span class="text-2xl">🔄</span>
              <span class="text-xs text-gray-500 font-medium"
                >Повернення 14 днів</span
              >
            </div>
            <div class="flex flex-col items-center gap-1 text-center">
              <span class="text-2xl">✅</span>
              <span class="text-xs text-gray-500 font-medium"
                >Гарантія оригіналу</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="mt-12">
        <h2 class="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">📋 Опис товару</h2>
        <p class="text-gray-600 leading-relaxed text-base mb-6">{{ product.description }}</p>
        <div class="bg-gray-50 rounded-2xl p-5 max-w-sm">
          <h4 class="font-semibold text-gray-900 mb-3">Характеристики</h4>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500">Бренд</dt>
              <dd class="font-medium text-gray-900">{{ product.brand }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Категорія</dt>
              <dd class="font-medium text-gray-900 capitalize">{{ product.category }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Стать</dt>
              <dd class="font-medium text-gray-900">
                {{ product.gender === "male" ? "Чоловіча" : product.gender === "female" ? "Жіноча" : "Унісекс" }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Розміри</dt>
              <dd class="font-medium text-gray-900">{{ product.sizes.join(", ") }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Related products -->
      <div v-if="relatedProducts.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Схожі товари</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
          <ProductCard v-for="p in relatedProducts" :key="p.id" :product="p" />
        </div>
      </div>
    </div>
  </div>

  <!-- Size chart modal -->
  <Transition name="fade">
    <div
      v-if="showSizeChart"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      @click.self="showSizeChart = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">📏 Таблиця розмірів</h3>
          <button @click="showSizeChart = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="px-6 py-4">
          <p class="text-sm text-gray-500 mb-3">Розміри вказані в EU. Виміряйте стопу в сантиметрах.</p>
          <div class="overflow-x-auto">
            <table class="w-full text-center text-sm border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-3 py-2 border border-gray-200 font-semibold">EU</th>
                  <th class="px-3 py-2 border border-gray-200 font-semibold">US (чол)</th>
                  <th class="px-3 py-2 border border-gray-200 font-semibold">US (жін)</th>
                  <th class="px-3 py-2 border border-gray-200 font-semibold">см</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in [[36,'4','5.5','22.5'],[37,'4.5','6','23'],[38,'5','6.5','23.5'],[39,'6','7.5','24.5'],[40,'7','8.5','25'],[41,'8','9.5','25.5'],[42,'9','10.5','26.5'],[43,'10','11.5','27'],[44,'11','12.5','27.5'],[45,'12','13.5','28.5'],[46,'13','14.5','29']]" :key="row[0]"
                  :class="product?.sizes?.includes(row[0]) ? 'bg-orange-50' : ''"
                  class="hover:bg-orange-50 transition-colors">
                  <td class="px-3 py-2 border border-gray-200 font-semibold" :class="product?.sizes?.includes(row[0]) ? 'text-orange-600' : ''">{{ row[0] }}</td>
                  <td class="px-3 py-2 border border-gray-200">{{ row[1] }}</td>
                  <td class="px-3 py-2 border border-gray-200">{{ row[2] }}</td>
                  <td class="px-3 py-2 border border-gray-200">{{ row[3] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-gray-400 mt-3">Розміри цього товару, що є в наявності, виділені кольором.</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
