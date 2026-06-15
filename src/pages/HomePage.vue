<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductsStore } from "../stores/productsStore";
import ProductCard from "../components/ProductCard.vue";

const route = useRoute();
const router = useRouter();
const store = useProductsStore();

// Filters state
const searchQuery = ref(route.query.search || "");
const selectedCategory = ref(route.query.category || "");
const selectedBrands = ref([]);
const minPrice = ref("");
const maxPrice = ref("");
const sortBy = ref("default");
const showFilters = ref(false);
const onlySale = ref(route.query.isSale === "true");
const onlyNew = ref(false);
const onlyInStock = ref(false);

const categories = [
  { slug: "", name: "Всі" },
  { slug: "running", name: "🏃 Бігові" },
  { slug: "casual", name: "👟 Повсякденні" },
  { slug: "basketball", name: "🏀 Баскетбольні" },
  { slug: "training", name: "💪 Тренувальні" },
];

const sortOptions = [
  { value: "default", label: "За замовчуванням" },
  { value: "price_asc", label: "Ціна: від низької" },
  { value: "price_desc", label: "Ціна: від високої" },
  { value: "rating", label: "За рейтингом" },
  { value: "newest", label: "Новинки" },
];

const allBrands = computed(() => {
  const brands = new Set(store.products.map((p) => p.brand));
  return [...brands].sort();
});

const filteredProducts = computed(() => {
  let result = [...store.products];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }

  if (selectedCategory.value) {
    result = result.filter((p) => p.category === selectedCategory.value);
  }

  if (selectedBrands.value.length > 0) {
    result = result.filter((p) => selectedBrands.value.includes(p.brand));
  }

  if (minPrice.value !== "") {
    result = result.filter((p) => p.price >= Number(minPrice.value));
  }

  if (maxPrice.value !== "") {
    result = result.filter((p) => p.price <= Number(maxPrice.value));
  }

  if (onlySale.value) {
    result = result.filter((p) => p.isSale);
  }

  if (onlyNew.value) {
    result = result.filter((p) => p.isNew);
  }

  if (onlyInStock.value) {
    result = result.filter((p) => p.inStock);
  }

  switch (sortBy.value) {
    case "price_asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
  }

  return result;
});

// Sync with route query params
watch(
  () => route.query,
  (q) => {
    searchQuery.value = q.search || "";
    selectedCategory.value = q.category || "";
    onlySale.value = q.isSale === "true";
  },
);


onMounted(() => {
  store.fetchProducts();
});

function resetFilters() {
  searchQuery.value = "";
  selectedCategory.value = "";
  selectedBrands.value = [];
  minPrice.value = "";
  maxPrice.value = "";
  onlySale.value = false;
  onlyNew.value = false;
  onlyInStock.value = false;
  sortBy.value = "default";
  router.push("/");
}

const hasActiveFilters = computed(
  () =>
    searchQuery.value ||
    selectedCategory.value ||
    selectedBrands.value.length > 0 ||
    minPrice.value ||
    maxPrice.value ||
    onlySale.value ||
    onlyNew.value ||
    onlyInStock.value,
);
</script>

<template>
  <div>
    <!-- Hero Banner -->
    <section
      class="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden"
    >
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 text-9xl rotate-12 select-none">
          👟
        </div>
        <div
          class="absolute bottom-10 right-10 text-9xl -rotate-12 select-none"
        >
          👟
        </div>
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] select-none opacity-30"
        >
          👟
        </div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div class="max-w-2xl">
          <span
            class="inline-block bg-orange-500/20 text-orange-400 text-sm font-semibold px-3 py-1 rounded-full mb-4 border border-orange-500/30"
          >
            🔥 Нова колекція 2026
          </span>
          <h1 class="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Знайди<br />
            <span class="text-orange-500">свій стиль</span>
          </h1>
          <p class="text-gray-300 text-lg mb-8 max-w-lg">
            Понад 50 моделей від провідних брендів. Nike, Adidas, Puma та інші —
            знижки до 30%!
          </p>
          <div class="flex flex-wrap gap-3">
            <button
              @click="
                selectedCategory = '';
                showFilters = false;
              "
              class="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-all shadow-lg shadow-orange-500/30 hover:scale-105"
            >
              Переглянути каталог
            </button>
            <button
              @click="
                onlySale = true;
                showFilters = false;
              "
              class="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-all border border-white/20 backdrop-blur-sm"
            >
              🔥 Акції та знижки
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Category tabs -->
    <section class="bg-white border-b border-gray-100 sticky top-16 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          class="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide"
        >
          <button
            v-for="cat in categories"
            :key="cat.slug"
            @click="selectedCategory = cat.slug"
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0"
            :class="
              selectedCategory === cat.slug
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            "
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
    </section>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <!-- Toolbar -->
      <div class="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div class="flex items-center gap-3">
          <button
            @click="showFilters = !showFilters"
            class="flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-medium text-sm transition-all"
            :class="
              showFilters
                ? 'border-orange-500 text-orange-500 bg-orange-50'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            "
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Фільтри
            <span
              v-if="hasActiveFilters"
              class="w-2 h-2 bg-orange-500 rounded-full"
            ></span>
          </button>

          <span class="text-sm text-gray-500">
            <span class="font-semibold text-gray-900">{{
              filteredProducts.length
            }}</span>
            товарів
          </span>

          <button
            v-if="hasActiveFilters"
            @click="resetFilters"
            class="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            Скинути
          </button>
        </div>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:border-orange-400 cursor-pointer bg-white"
        >
          <option
            v-for="opt in sortOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Filters panel -->
      <Transition name="collapse">
        <div
          v-if="showFilters"
          class="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Search -->
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                >Пошук</label
              >
              <div
                class="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border-2 border-gray-200 focus-within:border-orange-400"
              >
                <svg
                  class="w-4 h-4 text-gray-400"
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
                  placeholder="Назва, бренд..."
                  class="text-sm outline-none bg-transparent w-full"
                />
              </div>
            </div>

            <!-- Price range -->
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                >Ціна (₴)</label
              >
              <div class="flex items-center gap-2">
                <input
                  v-model="minPrice"
                  type="number"
                  placeholder="Від"
                  class="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
                />
                <span class="text-gray-400">—</span>
                <input
                  v-model="maxPrice"
                  type="number"
                  placeholder="До"
                  class="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <!-- Brands -->
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                >Бренди</label
              >
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="brand in allBrands"
                  :key="brand"
                  @click="
                    selectedBrands.includes(brand)
                      ? selectedBrands.splice(selectedBrands.indexOf(brand), 1)
                      : selectedBrands.push(brand)
                  "
                  class="px-3 py-1 rounded-full text-xs font-medium transition-all border"
                  :class="
                    selectedBrands.includes(brand)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                  "
                >
                  {{ brand }}
                </button>
              </div>
            </div>

            <!-- Toggles -->
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                >Додатково</label
              >
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="onlySale"
                    class="w-4 h-4 accent-orange-500 rounded"
                  />
                  <span class="text-sm text-gray-700">🔥 Тільки розпродаж</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="onlyNew"
                    class="w-4 h-4 accent-orange-500 rounded"
                  />
                  <span class="text-sm text-gray-700">✨ Тільки новинки</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="onlyInStock"
                    class="w-4 h-4 accent-orange-500 rounded"
                  />
                  <span class="text-sm text-gray-700">✅ Є в наявності</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Loading skeleton -->
      <div
        v-if="store.loading"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
      >
        <div
          v-for="n in 8"
          :key="n"
          class="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
        >
          <div class="aspect-square bg-gray-200"></div>
          <div class="p-4 space-y-2">
            <div class="h-3 bg-gray-200 rounded w-16"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-8 bg-gray-200 rounded-xl mt-3"></div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="store.error"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div class="text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">
          Помилка завантаження
        </h3>
        <p class="text-gray-500 mb-2 text-sm max-w-md">{{ store.error }}</p>
        <code
          class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm mb-6"
          >npm run mock</code
        >
        <button
          @click="store.fetchProducts()"
          class="px-6 py-2.5 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
        >
          Спробувати ще раз
        </button>
      </div>

      <!-- Empty results -->
      <div
        v-else-if="filteredProducts.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Нічого не знайдено</h3>
        <p class="text-gray-500 text-sm mb-6">
          Спробуйте змінити параметри пошуку або фільтри
        </p>
        <button
          @click="resetFilters"
          class="px-6 py-2.5 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
        >
          Скинути фільтри
        </button>
      </div>

      <!-- Products grid -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>

  </div>
</template>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  max-height: 400px;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.fade-msg-enter-active,
.fade-msg-leave-active {
  transition: opacity 0.3s ease;
}
.fade-msg-enter-from,
.fade-msg-leave-to {
  opacity: 0;
}
</style>
