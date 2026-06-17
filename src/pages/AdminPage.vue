<script setup>
import { ref, computed, onMounted } from "vue";
import ProductFormModal from "../components/ProductFormModal.vue";
import { useProductsStore } from "../stores/productsStore";
import { useAuthStore } from "../stores/authStore";
import { useOrdersStore } from "../stores/ordersStore";
import { useMessagesStore } from "../stores/messagesStore";
import { useRouter } from "vue-router";

const store = useProductsStore();
const auth = useAuthStore();
const ordersStore = useOrdersStore();
const messagesStore = useMessagesStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push("/");
}

// --- State ---
const activeTab = ref("products"); // 'dashboard' | 'products' | 'orders' | 'users'

// Modal state
const showModal = ref(false);
const editingProduct = ref(null);
const deleteConfirmId = ref(null);

// Search / filter
const searchQuery = ref("");
const filterCategory = ref("");

// Orders & users state
const allUsers = ref([]);
const orderSearch = ref("");
const selectedOrderStatus = ref("");
const expandedOrder = ref(null);
const userSearch = ref("");
const deleteOrderConfirmId = ref(null);

// Toast notification
const toast = ref(null); // { type: 'success'|'error', message: '' }
let toastTimer = null;

// Write to client modal
const showWriteModal = ref(false);
const writeForm = ref({ userId: "", email: "", text: "" });
const writeSending = ref(false);
const writeSent = ref(false);

function openWriteModal() {
  writeForm.value = { userId: "", email: "", text: "" };
  writeSent.value = false;
  showWriteModal.value = true;
}

async function sendToClient() {
  if (!writeForm.value.text.trim()) return;
  const user = allUsers.value.find((u) => String(u.id) === String(writeForm.value.userId));
  const toEmail = user?.email || writeForm.value.email;
  if (!toEmail) return;
  writeSending.value = true;
  try {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Адмін SneakShop",
        email: "admin@sneakshop.com",
        phone: "",
        text: writeForm.value.text,
        toEmail,
        toName: user?.name || toEmail,
        fromAdmin: true,
        read: true,
        createdAt: new Date().toISOString(),
      }),
    });
    writeSent.value = true;
    showToast("success", `✅ Повідомлення надіслано до ${user?.name || toEmail}`);
  } catch {
    showToast("error", "❌ Помилка відправки");
  } finally {
    writeSending.value = false;
  }
}

function showToast(type, message) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { type, message };
  toastTimer = setTimeout(() => (toast.value = null), 3500);
}

// --- Actions ---
async function saveProduct(data) {
  try {
    if (data.id) {
      await store.updateProduct(data);
      showToast("success", `✅ Товар «${data.name}» оновлено`);
    } else {
      await store.addProduct(data);
      showToast("success", `✅ Товар «${data.name}» успішно додано на сайт`);
    }
    showModal.value = false;
    editingProduct.value = null;
  } catch (e) {
    showToast("error", `❌ ${e.message}`);
  }
}

async function deleteProduct(id) {
  const product = store.products.find((p) => p.id === id);
  try {
    await store.deleteProduct(id);
    deleteConfirmId.value = null;
    showToast("success", `🗑️ Товар «${product?.name}» видалено`);
  } catch (e) {
    showToast("error", `❌ ${e.message}`);
  }
}

function openCreate() {
  editingProduct.value = null;
  showModal.value = true;
}

function openEdit(product) {
  editingProduct.value = { ...product };
  showModal.value = true;
}

async function changeOrderStatus(order, status) {
  try {
    await ordersStore.updateOrderStatus(order.id, status);
    showToast("success", `✅ Статус замовлення #${order.id} змінено`);
  } catch (e) {
    showToast("error", `❌ ${e.message}`);
  }
}

async function deleteOrder(id) {
  try {
    await ordersStore.deleteOrder(id);
    deleteOrderConfirmId.value = null;
    if (expandedOrder.value === id) expandedOrder.value = null;
    showToast("success", `🗑️ Замовлення #${id} видалено`);
  } catch (e) {
    showToast("error", `❌ ${e.message}`);
  }
}

// --- Computed ---
const products = computed(() => store.products);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

const filteredProducts = computed(() => {
  let list = store.products;
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

const filteredOrders = computed(() => {
  let list = ordersStore.orders;
  if (orderSearch.value.trim()) {
    const q = orderSearch.value.toLowerCase();
    list = list.filter(
      (o) =>
        String(o.id).includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.includes(q) ||
        o.customerEmail?.toLowerCase().includes(q),
    );
  }
  if (selectedOrderStatus.value) {
    list = list.filter((o) => o.status === selectedOrderStatus.value);
  }
  return list;
});

const filteredUsers = computed(() => {
  if (!userSearch.value.trim()) return allUsers.value;
  const q = userSearch.value.toLowerCase();
  return allUsers.value.filter(
    (u) =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q),
  );
});

const orderStatusLabels = {
  new: { label: "Нове", color: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Підтверджено", color: "bg-yellow-100 text-yellow-700" },
  shipped: { label: "Відправлено", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Доставлено", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Скасовано", color: "bg-red-100 text-red-700" },
};

function formatDate(d) {
  return new Date(d).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const stats = computed(() => ({
  total: store.products.length,
  inStock: store.products.filter((p) => p.inStock).length,
  onSale: store.products.filter((p) => p.isSale).length,
  newItems: store.products.filter((p) => p.isNew).length,
  avgPrice: store.products.length
    ? Math.round(store.products.reduce((s, p) => s + p.price, 0) / store.products.length)
    : 0,
  brands: [...new Set(store.products.map((p) => p.brand))].length,
  totalRevenue: ordersStore.orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + (o.total || 0), 0),
  cashPending: ordersStore.orders
    .filter((o) => o.paymentMethod === "cash" && !["cancelled","delivered"].includes(o.status))
    .reduce((s, o) => s + (o.total || 0), 0),
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

onMounted(async () => {
  await store.fetchProducts();
  await ordersStore.fetchOrders();
  allUsers.value = await ordersStore.fetchAllUsers();
  await messagesStore.fetchMessages();
});
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
          <button
            @click="activeTab = 'orders'"
            class="px-3 py-1.5 rounded-lg font-medium transition-colors relative"
            :class="
              activeTab === 'orders'
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-500 hover:bg-gray-100'
            "
          >
            📦 Замовлення
            <span
              v-if="ordersStore.orders.length > 0"
              class="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
            >
              {{
                ordersStore.orders.filter((o) => o.status === "new").length ||
                ""
              }}
            </span>
          </button>
          <button
            @click="activeTab = 'users'"
            class="px-3 py-1.5 rounded-lg font-medium transition-colors"
            :class="
              activeTab === 'users'
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-500 hover:bg-gray-100'
            "
          >
            👥 Користувачі
          </button>
          <button
            @click="activeTab = 'messages'"
            class="px-3 py-1.5 rounded-lg font-medium transition-colors relative"
            :class="
              activeTab === 'messages'
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-500 hover:bg-gray-100'
            "
          >
            ✉️ Повідомлення
            <span
              v-if="messagesStore.unreadCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
            >
              {{ messagesStore.unreadCount > 9 ? "9+" : messagesStore.unreadCount }}
            </span>
          </button>
          <div class="w-px h-5 bg-gray-200 mx-1"></div>
          <button
            @click="openWriteModal"
            class="px-3 py-1.5 rounded-lg font-medium transition-colors text-white bg-orange-500 hover:bg-orange-600 flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
            </svg>
            Написати клієнту
          </button>
          <div class="w-px h-5 bg-gray-200 mx-1"></div>
          <button
            @click="handleLogout"
            class="px-3 py-1.5 rounded-lg font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-1.5"
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
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
            Вийти
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
          @click="store.fetchProducts"
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
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 mb-8">
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
          <!-- Нові картки: замовлення та користувачі -->
          <div
            class="bg-orange-500 rounded-2xl p-4 shadow-sm col-span-1 cursor-pointer hover:bg-orange-600 transition-colors"
            @click="activeTab = 'orders'"
          >
            <p
              class="text-xs text-orange-100 font-medium uppercase tracking-wide"
            >
              Замовлень
            </p>
            <p class="text-3xl font-extrabold text-white mt-1">
              {{ ordersStore.orders.length }}
            </p>
            <p class="text-xs text-orange-200 mt-1">
              нових:
              {{ ordersStore.orders.filter((o) => o.status === "new").length }}
            </p>
          </div>
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-orange-300 transition-colors"
            @click="activeTab = 'users'"
          >
            <p
              class="text-xs text-gray-400 font-medium uppercase tracking-wide"
            >
              Клієнтів
            </p>
            <p class="text-3xl font-extrabold text-gray-900 mt-1">
              {{ allUsers.length }}
            </p>
            <p class="text-xs text-gray-400 mt-1">акаунтів</p>
          </div>
          <div
            class="rounded-2xl p-4 shadow-sm border cursor-pointer transition-colors col-span-1"
            :class="messagesStore.unreadCount > 0 ? 'bg-red-500 border-red-400 hover:bg-red-600' : 'bg-white border-gray-100 hover:border-orange-300'"
            @click="activeTab = 'messages'"
          >
            <p class="text-xs font-medium uppercase tracking-wide" :class="messagesStore.unreadCount > 0 ? 'text-red-100' : 'text-gray-400'">
              Повідомлень
            </p>
            <p class="text-3xl font-extrabold mt-1" :class="messagesStore.unreadCount > 0 ? 'text-white' : 'text-gray-900'">
              {{ messagesStore.messages.length }}
            </p>
            <p class="text-xs mt-1" :class="messagesStore.unreadCount > 0 ? 'text-red-200' : 'text-gray-400'">
              нових: {{ messagesStore.unreadCount }}
            </p>
          </div>
        </div>

        <!-- Revenue block -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 shadow-md text-white">
            <p class="text-xs text-green-100 font-semibold uppercase tracking-wide mb-1">💰 Загальний дохід</p>
            <p class="text-4xl font-extrabold">{{ stats.totalRevenue.toLocaleString("uk-UA") }} ₴</p>
            <p class="text-green-200 text-sm mt-2">По всіх замовленнях (крім скасованих)</p>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">💵 Очікується готівкою</p>
            <p class="text-4xl font-extrabold text-orange-500">{{ stats.cashPending.toLocaleString("uk-UA") }} ₴</p>
            <p class="text-gray-400 text-sm mt-2">Активні замовлення з оплатою при отриманні</p>
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
                    <div class="flex flex-wrap gap-1 items-center">
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
                        v-if="product.stock !== undefined"
                        class="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium"
                        >{{ product.stock }} шт</span
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

      <!-- === ORDERS TAB === -->
      <div v-if="activeTab === 'orders'">
        <!-- Toolbar -->
        <div class="flex flex-wrap items-center gap-3 mb-5">
          <div class="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:border-orange-400 transition-colors">
            <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/>
            </svg>
            <input v-model="orderSearch" placeholder="Ім'я, email, місто..." class="text-sm outline-none bg-transparent w-48"/>
          </div>
          <select v-model="selectedOrderStatus" class="px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 cursor-pointer">
            <option value="">Всі статуси</option>
            <option v-for="(info, key) in orderStatusLabels" :key="key" :value="key">{{ info.label }}</option>
          </select>
          <span class="text-sm text-gray-500">
            Знайдено: <span class="font-semibold text-gray-800">{{ filteredOrders.length }}</span> з {{ ordersStore.orders.length }}
          </span>
        </div>

        <!-- Loading -->
        <div v-if="ordersStore.loading" class="space-y-3">
          <div v-for="n in 4" :key="n" class="bg-white rounded-2xl h-20 animate-pulse border border-gray-100"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredOrders.length === 0" class="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div class="text-5xl mb-3">📦</div>
          <p class="text-gray-500">Замовлень не знайдено</p>
        </div>

        <!-- Orders list -->
        <div v-else class="space-y-3">
          <div v-for="order in filteredOrders" :key="order.id" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <!-- Compact row -->
            <div class="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              @click="expandedOrder = expandedOrder === order.id ? null : order.id">

              <!-- Order # -->
              <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-extrabold text-sm shrink-0">
                #{{ order.id }}
              </div>

              <!-- Main info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-gray-900 text-sm">{{ order.customerName }}</span>
                  <span class="text-gray-400 text-xs">{{ order.customerPhone }}</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                  <span>{{ formatDate(order.createdAt) }}</span>
                  <span>·</span>
                  <span>{{ order.items?.length }} поз.</span>
                  <span>·</span>
                  <span class="font-semibold text-gray-700">{{ formatPrice(order.total) }}</span>
                  <span>·</span>
                  <!-- Delivery badge -->
                  <span class="inline-flex items-center gap-0.5">
                    {{ order.deliveryMethod === 'nova_poshta' ? '📦 Нова Пошта' : order.deliveryMethod === 'ukr_poshta' ? '✉️ Укрпошта' : order.deliveryMethod === 'pickup' ? '🏪 Самовивіз' : '📦 Доставка' }}
                  </span>
                  <span>·</span>
                  <!-- Payment badge -->
                  <span :class="order.paymentMethod === 'card' ? 'text-green-600 font-semibold' : 'text-gray-500'">
                    {{ order.paymentMethod === 'card' ? '💳 Оплачено' : '💵 Готівка' }}
                  </span>
                </div>
              </div>

              <!-- Status selector -->
              <select :value="order.status" @change="changeOrderStatus(order, $event.target.value)" @click.stop
                class="px-2 py-1.5 rounded-xl border-2 border-gray-200 text-xs font-semibold focus:outline-none focus:border-orange-400 cursor-pointer shrink-0"
                :class="orderStatusLabels[order.status]?.color">
                <option v-for="(info, key) in orderStatusLabels" :key="key" :value="key">{{ info.label }}</option>
              </select>

              <!-- Delete order button -->
              <button
                @click.stop="deleteOrderConfirmId = order.id"
                class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="Видалити замовлення"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                </svg>
              </button>

              <svg class="w-4 h-4 text-gray-400 transition-transform shrink-0" :class="{ 'rotate-180': expandedOrder === order.id }"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
              </svg>
            </div>

            <!-- Expanded details -->
            <Transition name="fade">
              <div v-if="expandedOrder === order.id" class="border-t border-gray-100 bg-gray-50">

                <!-- ── Shipping card ── -->
                <div class="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-3">

                  <!-- Recipient -->
                  <div class="bg-white rounded-xl p-4 border border-gray-100">
                    <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">👤 Отримувач</p>
                    <p class="font-bold text-gray-900 text-sm">{{ order.customerName }}</p>
                    <p class="text-gray-600 text-xs mt-1">{{ order.customerPhone }}</p>
                    <p class="text-gray-500 text-xs">{{ order.customerEmail || '—' }}</p>
                  </div>

                  <!-- Delivery -->
                  <div class="bg-white rounded-xl p-4 border border-gray-100">
                    <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">🚚 Доставка</p>
                    <p class="font-bold text-gray-900 text-sm">
                      {{ order.deliveryMethod === 'nova_poshta' ? 'Нова Пошта' : order.deliveryMethod === 'ukr_poshta' ? 'Укрпошта' : order.deliveryMethod === 'pickup' ? 'Самовивіз' : 'Доставка' }}
                    </p>
                    <p class="text-gray-700 text-xs mt-1 font-semibold">{{ order.city }}</p>
                    <p class="text-gray-500 text-xs">{{ order.address }}</p>
                    <div v-if="order.comment" class="mt-2 pt-2 border-t border-gray-100">
                      <p class="text-[10px] text-gray-400 uppercase font-semibold">Коментар</p>
                      <p class="text-xs text-gray-600 mt-0.5">{{ order.comment }}</p>
                    </div>
                  </div>

                  <!-- Payment -->
                  <div class="bg-white rounded-xl p-4 border border-gray-100">
                    <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">💳 Оплата</p>
                    <div v-if="order.paymentMethod === 'card'" class="flex items-center gap-2 mb-1">
                      <span class="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                      <span class="font-bold text-green-700 text-sm">Оплачено карткою</span>
                    </div>
                    <div v-else class="flex items-center gap-2 mb-1">
                      <span class="w-2 h-2 rounded-full bg-yellow-400 shrink-0"></span>
                      <span class="font-bold text-yellow-700 text-sm">Готівка при отриманні</span>
                    </div>
                    <div class="mt-3 pt-2 border-t border-gray-100">
                      <p class="text-[11px] text-gray-400 uppercase font-semibold">Сума до отримання</p>
                      <p class="text-xl font-extrabold mt-0.5" :class="order.paymentMethod === 'card' ? 'text-green-600 line-through opacity-50' : 'text-orange-500'">
                        {{ formatPrice(order.total) }}
                      </p>
                      <p v-if="order.paymentMethod === 'card'" class="text-xs text-green-600 font-semibold -mt-1">вже сплачено</p>
                    </div>
                  </div>
                </div>

                <!-- ── Items list ── -->
                <div class="px-5 pb-4">
                  <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">📦 Склад замовлення ({{ order.items?.length }} поз.)</p>
                  <div class="space-y-2">
                    <div v-for="item in order.items" :key="`${item.id}-${item.size}`"
                      class="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                      <img :src="item.image" :alt="item.name" class="w-12 h-12 rounded-lg object-cover shrink-0"/>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-gray-800">{{ item.brand }} {{ item.name }}</p>
                        <div class="flex items-center gap-3 mt-0.5">
                          <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">EU {{ item.size }}</span>
                          <span class="text-xs text-gray-500">{{ item.quantity }} шт × {{ formatPrice(item.price) }}</span>
                        </div>
                      </div>
                      <span class="text-sm font-extrabold text-gray-900 shrink-0">{{ formatPrice(item.price * item.quantity) }}</span>
                    </div>
                  </div>

                  <!-- Total row -->
                  <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div class="text-sm text-gray-500">
                      Доставка: <span class="text-green-600 font-semibold">Безкоштовно</span>
                    </div>
                    <div class="text-right">
                      <span class="text-xs text-gray-400 block">Разом до сплати</span>
                      <span class="text-2xl font-extrabold text-orange-500">{{ formatPrice(order.total) }}</span>
                    </div>
                  </div>
                </div>

              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- === USERS TAB === -->
      <div v-if="activeTab === 'users'">
        <!-- Toolbar -->
        <div class="flex items-center gap-3 mb-5">
          <div
            class="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:border-orange-400 transition-colors"
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
              v-model="userSearch"
              placeholder="Пошук користувачів..."
              class="text-sm outline-none bg-transparent w-48"
            />
          </div>
          <span class="text-sm text-gray-500">
            Всього:
            <span class="font-semibold text-gray-800">{{
              allUsers.length
            }}</span>
            користувач(ів)
          </span>
        </div>

        <!-- Empty -->
        <div
          v-if="allUsers.length === 0"
          class="text-center py-16 bg-white rounded-2xl border border-gray-100"
        >
          <div class="text-5xl mb-3">👥</div>
          <p class="text-gray-500">Зареєстрованих користувачів ще немає</p>
        </div>

        <!-- Users table -->
        <div
          v-else
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th
                    class="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide w-10"
                  >
                    ID
                  </th>
                  <th
                    class="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide"
                  >
                    Користувач
                  </th>
                  <th
                    class="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide hidden md:table-cell"
                  >
                    Телефон
                  </th>
                  <th
                    class="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide hidden lg:table-cell"
                  >
                    Дата реєстрації
                  </th>
                  <th
                    class="text-left px-4 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide"
                  >
                    Замовлень
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 text-gray-400 font-mono text-xs">
                    {{ user.id }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs shrink-0"
                      >
                        {{ user.name?.charAt(0)?.toUpperCase() }}
                      </div>
                      <div>
                        <p class="font-semibold text-gray-900">
                          {{ user.name }}
                        </p>
                        <p class="text-xs text-gray-400">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 hidden md:table-cell text-gray-600">
                    {{ user.phone || "—" }}
                  </td>
                  <td
                    class="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs"
                  >
                    {{ user.createdAt ? formatDate(user.createdAt) : "—" }}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold"
                    >
                      {{
                        ordersStore.orders.filter((o) => o.userId === user.id)
                          .length
                      }}
                      шт
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- === MESSAGES TAB === -->
      <div v-if="activeTab === 'messages'">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xl font-bold text-gray-900">
            Повідомлення від користувачів
            <span v-if="messagesStore.unreadCount > 0" class="ml-2 text-sm font-normal text-red-500">
              {{ messagesStore.unreadCount }} непрочитаних
            </span>
          </h2>
        </div>

        <!-- Loading -->
        <div v-if="messagesStore.loading" class="space-y-3">
          <div v-for="n in 3" :key="n" class="bg-white rounded-2xl h-20 animate-pulse border border-gray-100"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="messagesStore.messages.length === 0" class="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div class="text-5xl mb-3">✉️</div>
          <p class="text-gray-500">Повідомлень ще немає</p>
        </div>

        <!-- Messages list -->
        <div v-else class="space-y-3">
          <div
            v-for="msg in messagesStore.messages"
            :key="msg.id"
            class="bg-white rounded-2xl shadow-sm border overflow-hidden transition-all"
            :class="msg.read ? 'border-gray-100' : 'border-orange-200 shadow-orange-100'"
          >
            <div class="flex items-start gap-4 px-5 py-4">
              <!-- Unread dot -->
              <div class="shrink-0 mt-1">
                <div
                  class="w-2.5 h-2.5 rounded-full mt-1"
                  :class="msg.read ? 'bg-gray-200' : 'bg-orange-500'"
                ></div>
              </div>
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap mb-1">
                  <span class="font-semibold text-gray-900">{{ msg.name }}</span>
                  <span v-if="msg.email" class="text-xs text-gray-400">{{ msg.email }}</span>
                  <span v-if="msg.phone" class="text-xs text-gray-400">{{ msg.phone }}</span>
                  <span class="text-xs text-gray-300 ml-auto">{{ formatDate(msg.createdAt) }}</span>
                </div>
                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ msg.text }}</p>
              </div>
              <!-- Actions -->
              <div class="flex items-center gap-1 shrink-0">
                <button
                  v-if="!msg.read"
                  @click="messagesStore.markAsRead(msg.id)"
                  class="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                  title="Позначити як прочитане"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </button>
                <button
                  @click="messagesStore.deleteMessage(msg.id)"
                  class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Видалити"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Write to client modal -->
    <Transition name="fade">
      <div
        v-if="showWriteModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        @click.self="showWriteModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
              </svg>
              <h3 class="text-lg font-bold text-gray-900">Написати клієнту</h3>
            </div>
            <button @click="showWriteModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5">
            <Transition name="fade" mode="out-in">
              <!-- Success state -->
              <div v-if="writeSent" key="sent" class="text-center py-6">
                <div class="text-5xl mb-3">✅</div>
                <p class="text-lg font-semibold text-gray-900 mb-1">Повідомлення надіслано!</p>
                <p class="text-sm text-gray-500 mb-5">Клієнт отримає ваше повідомлення.</p>
                <div class="flex gap-3">
                  <button
                    @click="writeSent = false; writeForm = { userId: '', email: '', text: '' }"
                    class="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    Написати ще
                  </button>
                  <button
                    @click="showWriteModal = false"
                    class="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Закрити
                  </button>
                </div>
              </div>

              <!-- Form -->
              <div v-else key="form" class="space-y-4">
                <!-- Recipient -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Отримувач</label>
                  <select
                    v-model="writeForm.userId"
                    class="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-orange-400 bg-white"
                  >
                    <option value="">— Вибрати клієнта зі списку —</option>
                    <option
                      v-for="u in allUsers"
                      :key="u.id"
                      :value="String(u.id)"
                    >
                      {{ u.name }} ({{ u.email }})
                    </option>
                  </select>
                  <div class="flex items-center gap-2 mt-2">
                    <div class="flex-1 h-px bg-gray-200"></div>
                    <span class="text-xs text-gray-400">або вручну</span>
                    <div class="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <input
                    v-model="writeForm.email"
                    :disabled="!!writeForm.userId"
                    type="email"
                    placeholder="email клієнта"
                    class="mt-2 w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-orange-400 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                <!-- Message -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Повідомлення *</label>
                  <textarea
                    v-model="writeForm.text"
                    rows="5"
                    placeholder="Текст вашого повідомлення..."
                    class="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none"
                  ></textarea>
                </div>

                <!-- Actions -->
                <div class="flex gap-3 pt-1">
                  <button
                    @click="showWriteModal = false"
                    class="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    Скасувати
                  </button>
                  <button
                    @click="sendToClient"
                    :disabled="writeSending || (!writeForm.userId && !writeForm.email) || !writeForm.text.trim()"
                    class="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg v-if="writeSending" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {{ writeSending ? "Відправка..." : "Надіслати" }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete order confirm dialog -->
    <Transition name="fade">
      <div
        v-if="deleteOrderConfirmId"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
          <div class="text-4xl mb-3 text-center">🗑️</div>
          <h3 class="text-lg font-bold text-gray-900 text-center mb-2">
            Видалити замовлення?
          </h3>
          <p class="text-gray-500 text-sm text-center mb-6">
            Замовлення #{{ deleteOrderConfirmId }} буде видалено назавжди.
          </p>
          <div class="flex gap-3">
            <button
              @click="deleteOrderConfirmId = null"
              class="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Скасувати
            </button>
            <button
              @click="deleteOrder(deleteOrderConfirmId)"
              class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
            >
              Видалити
            </button>
          </div>
        </div>
      </div>
    </Transition>

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

    <!-- Toast notification -->
    <Transition name="toast">
      <div
        v-if="toast"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 min-w-[260px] max-w-sm"
        :class="
          toast.type === 'success'
            ? 'bg-gray-900 text-white'
            : 'bg-red-600 text-white'
        "
      >
        {{ toast.message }}
      </div>
    </Transition>
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

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}
</style>
