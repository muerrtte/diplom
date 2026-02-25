<script setup>
import { ref, computed, onMounted } from "vue";
import ProductFormModal from "../components/ProductFormModal.vue";

// --- State ---
const products = ref([]);
const loading = ref(false);
const error = ref(null);
const activeTab = ref("products"); // 'dashboard' | 'products'

// Modal state
const showModal = ref(false);
const editingProduct = ref(null);
const deleteConfirmId = ref(null);

// Search / filter
const searchQuery = ref("");
const filterCategory = ref("");

// --- API helpers ---
async function fetchProducts() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error();
    products.value = await res.json();
  } catch {
    error.value = "Не вдалося завантажити товари. Запустіть: npm run mock";
  } finally {
    loading.value = false;
  }
}

async function saveProduct(data) {
  if (data.id) {
    // Update
    const res = await fetch(`/api/products/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    const idx = products.value.findIndex((p) => p.id === updated.id);
    if (idx >= 0) products.value[idx] = updated;
  } else {
    // Create
    const newId = Math.max(0, ...products.value.map((p) => p.id)) + 1;
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, id: newId }),
    });
    const created = await res.json();
    products.value.push(created);
  }
  showModal.value = false;
  editingProduct.value = null;
}

async function deleteProduct(id) {
  await fetch(`/api/products/${id}`, { method: "DELETE" });
  products.value = products.value.filter((p) => p.id !== id);
  deleteConfirmId.value = null;
}

// --- Actions ---
function openCreate() {
  editingProduct.value = null;
  showModal.value = true;
}

function openEdit(product) {
  editingProduct.value = { ...product };
  showModal.value = true;
}

// --- Computed ---
const filteredProducts = computed(() => {
  let list = products.value;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }
  if (filterCategory.value) {
    list = list.filter((p) => p.category === filterCategory.value);
  }
  return list;
});

const stats = computed(() => ({
  total: products.value.length,
  inStock: products.value.filter((p) => p.inStock).length,
  onSale: products.value.filter((p) => p.isSale).length,
  newItems: products.value.filter((p) => p.isNew).length,
  avgPrice: products.value.length
    ? Math.round(
        products.value.reduce((s, p) => s + p.price, 0) / products.value.length,
      )
    : 0,
  brands: [...new Set(products.value.map((p) => p.brand))].length,
}));

const categoryLabels = {
  running: "🏃 Бігові",
  casual: "👟 Повсякденні",
  basketball: "🏀 Баскетбольні",
  training: "💪 Тренувальні",
};

function formatPrice(p) {
  return p.toLocaleString("uk-UA") + " ₴";
}

onMounted(fetchProducts);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <RouterLink
            to="/"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </RouterLink>
          <div class="w-px h-5 bg-gray-200"></div>
          <span class="text-lg font-bold text-gray-900">⚙️ Адмін панель</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <button
            @click="activeTab = 'dashboard'"
            class="px-3 py-1.5 rounded-lg font-medium transition-colors"
            :class="
              activeTab === 'dashboard'
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-500 hover:bg-gray-100'
            "
          >
            📊 Дашборд
          </button>
          <button
            @click="activeTab = 'products'"
            class="px-3 py-1.5 rounded-lg font-medium transition-colors"
            :class="
              activeTab === 'products'
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-500 hover:bg-gray-100'
            "
          >
            👟 Товари
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <!-- Error banner -->
      <div
        v-if="error"
        class="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
      >
        <span class="text-2xl">⚠️</span>
        <div>
          <p class="font-semibold text-red-800">Помилка підключення до API</p>
          <p class="text-red-600 text-sm mt-0.5">{{ error }}</p>
          <code
            class="mt-2 inline-block bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm"
            >npm run mock</code
          >
        </div>
        <button
          @click="fetchProducts"
          class="ml-auto px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
        >
          Повторити
        </button>
      </div>

      <!-- === DASHBOARD TAB === -->
      <div v-if="activeTab === 'dashboard'">
        <h2 class="text-xl font-bold text-gray-900 mb-5">
          Статистика магазину
        </h2>

        <!-- Stats grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 col-span-2 md:col-span-1"
          >
            <p
              class="text-xs text-gray-400 font-medium uppercase tracking-wide"
            >
              Товарів
            </p>
            <p class="text-3xl font-extrabold text-gray-900 mt-1">
              {{ stats.total }}
            </p>
            <p class="text-xs text-gray-400 mt-1">позицій</p>
          </div>
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <p
              class="text-xs text-gray-400 font-medium uppercase tracking-wide"
            >
              В наявності
            </p>
            <p class="text-3xl font-extrabold text-green-600 mt-1">
              {{ stats.inStock }}
            </p>
            <p class="text-xs text-gray-400 mt-1">шт</p>
          </div>
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <p
              class="text-xs text-gray-400 font-medium uppercase tracking-wide"
            >
              Розпродаж
            </p>
            <p class="text-3xl font-extrabold text-red-500 mt-1">
              {{ stats.onSale }}
            </p>
            <p class="text-xs text-gray-400 mt-1">акцій</p>
          </div>
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <p
              class="text-xs text-gray-400 font-medium uppercase tracking-wide"
            >
              Новинки
            </p>
            <p class="text-3xl font-extrabold text-blue-500 mt-1">
              {{ stats.newItems }}
            </p>
            <p class="text-xs text-gray-400 mt-1">шт</p>
          </div>
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <p
              class="text-xs text-gray-400 font-medium uppercase tracking-wide"
            >
              Брендів
            </p>
            <p class="text-3xl font-extrabold text-purple-500 mt-1">
              {{ stats.brands }}
            </p>
            <p class="text-xs text-gray-400 mt-1">різних</p>
          </div>
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <p
              class="text-xs text-gray-400 font-medium uppercase tracking-wide"
            >
              Сер. ціна
            </p>
            <p class="text-2xl font-extrabold text-orange-500 mt-1">
              {{ stats.avgPrice.toLocaleString("uk-UA") }}
            </p>
            <p class="text-xs text-gray-400 mt-1">₴</p>
          </div>
        </div>

        <!-- Products by category -->
        <div class="grid md:grid-cols-2 gap-6">
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <h3 class="font-bold text-gray-900 mb-4">Товари по категоріях</h3>
            <div class="space-y-3">
              <div
                v-for="(label, slug) in categoryLabels"
                :key="slug"
                class="flex items-center gap-3"
              >
                <span class="text-lg w-6">{{ label.split(" ")[0] }}</span>
                <div class="flex-1">
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">{{
                      label.split(" ").slice(1).join(" ")
                    }}</span>
                    <span class="font-semibold">{{
                      products.filter((p) => p.category === slug).length
                    }}</span>
                  </div>
                  <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-orange-500 rounded-full transition-all duration-500"
                      :style="{
                        width: stats.total
                          ? (products.filter((p) => p.category === slug)
                              .length /
                              stats.total) *
                              100 +
                            '%'
                          : '0%',
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Brands table -->
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <h3 class="font-bold text-gray-900 mb-4">Товари по брендах</h3>
            <div class="space-y-2">
              <div
                v-for="brand in [
                  ...new Set(products.map((p) => p.brand)),
                ].sort()"
                :key="brand"
                class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <span class="text-sm font-medium text-gray-700">{{
                  brand
                }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-400"
                    >{{
                      products.filter((p) => p.brand === brand).length
                    }}
                    шт</span
                  >
                  <span class="w-2 h-2 bg-orange-400 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- === PRODUCTS TAB === -->
      <div v-if="activeTab === 'products'">
        <!-- Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div class="flex items-center gap-3 flex-wrap">
            <!-- Search -->
            <div
              class="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:border-orange-400 transition-colors"
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
                placeholder="Пошук товарів..."
                class="text-sm outline-none bg-transparent w-48"
              />
            </div>
            <!-- Category filter -->
            <select
              v-model="filterCategory"
              class="px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 cursor-pointer"
            >
              <option value="">Всі категорії</option>
              <option
                v-for="(label, slug) in categoryLabels"
                :key="slug"
                :value="slug"
              >
                {{ label }}
              </option>
            </select>
            <span class="text-sm text-gray-500">
              Показано:
              <span class="font-semibold text-gray-800">{{
                filteredProducts.length
              }}</span>
              з {{ products.length }}
            </span>
          </div>

          <button
            @click="openCreate"
            class="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-500/25"
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
            Додати товар
          </button>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loading" class="space-y-3">
          <div
            v-for="n in 6"
            :key="n"
            class="bg-white rounded-2xl h-16 animate-pulse border border-gray-100"
          ></div>
        </div>

        <!-- Products table -->
        <div
          v-else-if="filteredProducts.length > 0"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th
                    class="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide w-12"
                  >
                    ID
                  </th>
                  <th
                    class="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide"
                  >
                    Товар
                  </th>
                  <th
                    class="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide hidden md:table-cell"
                  >
                    Категорія
                  </th>
                  <th
                    class="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide"
                  >
                    Ціна
                  </th>
                  <th
                    class="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide hidden lg:table-cell"
                  >
                    Рейтинг
                  </th>
                  <th
                    class="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide hidden sm:table-cell"
                  >
                    Статус
                  </th>
                  <th
                    class="text-right px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide"
                  >
                    Дії
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 text-gray-400 font-mono text-xs">
                    {{ product.id }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <img
                        :src="product.image"
                        :alt="product.name"
                        class="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0"
                      />
                      <div class="min-w-0">
                        <p
                          class="font-semibold text-gray-900 truncate max-w-[180px]"
                        >
                          {{ product.name }}
                        </p>
                        <p class="text-xs text-orange-500 font-medium">
                          {{ product.brand }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 hidden md:table-cell">
                    <span
                      class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                    >
                      {{ categoryLabels[product.category] || product.category }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div>
                      <span class="font-bold text-gray-900">{{
                        formatPrice(product.price)
                      }}</span>
                      <span
                        v-if="product.oldPrice"
                        class="block text-xs text-gray-400 line-through"
                        >{{ formatPrice(product.oldPrice) }}</span
                      >
                    </div>
                  </td>
                  <td class="px-4 py-3 hidden lg:table-cell">
                    <div class="flex items-center gap-1">
                      <span class="text-amber-400">★</span>
                      <span class="font-medium text-gray-700">{{
                        product.rating
                      }}</span>
                      <span class="text-gray-400 text-xs"
                        >({{ product.reviewsCount }})</span
                      >
                    </div>
                  </td>
                  <td class="px-4 py-3 hidden sm:table-cell">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-if="product.inStock"
                        class="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium"
                        >✓ Є</span
                      >
                      <span
                        v-else
                        class="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium"
                        >✗ Немає</span
                      >
                      <span
                        v-if="product.isNew"
                        class="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        >New</span
                      >
                      <span
                        v-if="product.isSale"
                        class="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium"
                        >Sale</span
                      >
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-2">
                      <!-- View -->
                      <RouterLink
                        :to="`/product/${product.id}`"
                        target="_blank"
                        class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Переглянути"
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
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                          />
                        </svg>
                      </RouterLink>
                      <!-- Edit -->
                      <button
                        @click="openEdit(product)"
                        class="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Редагувати"
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
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                          />
                        </svg>
                      </button>
                      <!-- Delete -->
                      <button
                        @click="deleteConfirmId = product.id"
                        class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Видалити"
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
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else-if="!loading"
          class="text-center py-16 bg-white rounded-2xl border border-gray-100"
        >
          <div class="text-5xl mb-3">🔍</div>
          <p class="text-gray-500">Товарів не знайдено</p>
        </div>
      </div>
    </div>

    <!-- Delete confirm dialog -->
    <Transition name="fade">
      <div
        v-if="deleteConfirmId"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
          <div class="text-4xl mb-3 text-center">🗑️</div>
          <h3 class="text-lg font-bold text-gray-900 text-center mb-2">
            Видалити товар?
          </h3>
          <p class="text-gray-500 text-sm text-center mb-6">
            {{ products.find((p) => p.id === deleteConfirmId)?.name }} буде
            видалено назавжди.
          </p>
          <div class="flex gap-3">
            <button
              @click="deleteConfirmId = null"
              class="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Скасувати
            </button>
            <button
              @click="deleteProduct(deleteConfirmId)"
              class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
            >
              Видалити
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Product Form Modal -->
    <ProductFormModal
      v-if="showModal"
      :product="editingProduct"
      @save="saveProduct"
      @close="
        showModal = false;
        editingProduct = null;
      "
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
