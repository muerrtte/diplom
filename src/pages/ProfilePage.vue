<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { useOrdersStore } from "../stores/ordersStore";

const router = useRouter();
const userStore = useUserStore();
const ordersStore = useOrdersStore();

const activeTab = ref("orders"); // 'orders' | 'messages'
const orders = ref([]);
const loading = ref(false);
const expandedOrder = ref(null);

// Messages from admin
const adminMessages = ref([]);
const messagesLoading = ref(false);

async function loadAdminMessages() {
  if (!userStore.currentUser?.email) return;
  messagesLoading.value = true;
  try {
    const res = await fetch(`/api/messages?fromAdmin=true&toEmail=${encodeURIComponent(userStore.currentUser.email)}&_sort=createdAt&_order=desc`);
    adminMessages.value = await res.json();
  } finally {
    messagesLoading.value = false;
  }
}

const unreadMessages = computed(() => adminMessages.value.filter(m => !m.read).length);

const editOpen = ref(false);
const editForm = ref({ name: "", email: "", phone: "" });
const editLoading = ref(false);
const editError = ref("");
const editSuccess = ref(false);

function openEdit() {
  editForm.value = {
    name: userStore.currentUser?.name || "",
    email: userStore.currentUser?.email || "",
    phone: userStore.currentUser?.phone || "",
  };
  editError.value = "";
  editSuccess.value = false;
  editOpen.value = true;
}

async function saveEdit() {
  editError.value = "";
  editSuccess.value = false;
  if (!editForm.value.name.trim()) {
    editError.value = "Ім'я не може бути порожнім";
    return;
  }
  editLoading.value = true;
  try {
    await userStore.updateProfile({
      name: editForm.value.name.trim(),
      email: editForm.value.email.trim(),
      phone: editForm.value.phone.trim(),
    });
    editOpen.value = false;
    editSuccess.value = false;
  } catch (e) {
    editError.value = e.message;
  } finally {
    editLoading.value = false;
  }
}

const statusLabels = {
  new: { label: "Нове", color: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Підтверджено", color: "bg-yellow-100 text-yellow-700" },
  shipped: { label: "Відправлено", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Доставлено", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Скасовано", color: "bg-red-100 text-red-700" },
};

function formatPrice(price) {
  return price.toLocaleString("uk-UA") + " ₴";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function handleLogout() {
  userStore.logout();
  router.push("/");
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push("/login");
    return;
  }
  loading.value = true;
  try {
    orders.value = await ordersStore.fetchUserOrders(userStore.currentUser.id);
  } finally {
    loading.value = false;
  }
  await loadAdminMessages();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <!-- Profile header -->
      <div
        class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shrink-0"
          >
            {{ userStore.currentUser?.name?.charAt(0)?.toUpperCase() }}
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">
              {{ userStore.currentUser?.name }}
            </h1>
            <p class="text-gray-500 text-sm">
              {{ userStore.currentUser?.email }}
            </p>
            <p
              v-if="userStore.currentUser?.phone"
              class="text-gray-400 text-xs mt-0.5"
            >
              {{ userStore.currentUser?.phone }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="openEdit"
            class="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-colors text-sm font-medium"
            title="Редагувати профіль"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            Редагувати
          </button>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
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

      <!-- Edit profile modal -->
      <Transition name="fade">
        <div
          v-if="editOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="editOpen = false"></div>
          <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-lg font-bold text-gray-900">Редагувати профіль</h2>
              <button @click="editOpen = false" class="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ім'я</label>
                <input
                  v-model="editForm.name"
                  type="text"
                  placeholder="Ваше ім'я"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-model="editForm.email"
                  type="email"
                  placeholder="email@example.com"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input
                  v-model="editForm.phone"
                  type="tel"
                  placeholder="+380 XX XXX XX XX"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm"
                />
              </div>
            </div>

            <p v-if="editError" class="mt-3 text-sm text-red-500">{{ editError }}</p>

            <div class="mt-5 flex gap-3">
              <button
                @click="editOpen = false"
                class="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Скасувати
              </button>
              <button
                @click="saveEdit"
                :disabled="editLoading || editSuccess"
                class="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <svg v-if="editLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <svg v-else-if="editSuccess" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ editSuccess ? "Збережено!" : editLoading ? "Збереження..." : "Зберегти" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Tabs -->
      <div class="flex gap-2 mb-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
        <button
          @click="activeTab = 'orders'"
          class="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
          :class="activeTab === 'orders' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
        >
          📦 Мої замовлення
          <span v-if="orders.length" class="ml-1.5 text-xs opacity-80">{{ orders.length }}</span>
        </button>
        <button
          @click="activeTab = 'messages'"
          class="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all relative"
          :class="activeTab === 'messages' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
        >
          ✉️ Повідомлення
          <span
            v-if="unreadMessages > 0"
            class="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full"
            :class="activeTab === 'messages' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'"
          >{{ unreadMessages }}</span>
        </button>
      </div>

      <!-- Orders section -->
      <div v-if="activeTab === 'orders'">
        <h2 class="text-lg font-bold text-gray-900 mb-4">
          📦 Мої замовлення
          <span
            v-if="orders.length"
            class="text-sm font-normal text-gray-400 ml-2"
            >{{ orders.length }} шт</span
          >
        </h2>

        <!-- Loading -->
        <div v-if="loading" class="space-y-3">
          <div
            v-for="n in 3"
            :key="n"
            class="bg-white rounded-2xl h-24 animate-pulse border border-gray-100"
          ></div>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="orders.length === 0"
          class="bg-white rounded-3xl border border-gray-100 p-12 text-center"
        >
          <div class="text-5xl mb-4">📦</div>
          <h3 class="font-semibold text-gray-700 mb-2">Замовлень ще немає</h3>
          <p class="text-gray-400 text-sm mb-6">
            Оформіть своє перше замовлення прямо зараз!
          </p>
          <RouterLink
            to="/"
            class="inline-block px-6 py-2.5 bg-orange-500 text-white rounded-2xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Перейти до каталогу
          </RouterLink>
        </div>

        <!-- Orders list -->
        <div v-else class="space-y-4">
          <div
            v-for="order in orders"
            :key="order.id"
            class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <!-- Order header -->
            <div
              class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              @click="
                expandedOrder = expandedOrder === order.id ? null : order.id
              "
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-sm shrink-0"
                >
                  #{{ order.id }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">
                    {{ order.items?.length }} товар(и) ·
                    {{ formatPrice(order.total) }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ formatDate(order.createdAt) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="
                    statusLabels[order.status]?.color ||
                    'bg-gray-100 text-gray-600'
                  "
                >
                  {{ statusLabels[order.status]?.label || order.status }}
                </span>
                <svg
                  class="w-4 h-4 text-gray-400 transition-transform"
                  :class="{ 'rotate-180': expandedOrder === order.id }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>

            <!-- Order details (expanded) -->
            <Transition name="expand">
              <div
                v-if="expandedOrder === order.id"
                class="border-t border-gray-100 px-5 py-4"
              >
                <!-- Delivery info -->
                <div
                  class="grid grid-cols-2 gap-3 mb-4 text-sm bg-gray-50 rounded-xl p-3"
                >
                  <div>
                    <p class="text-gray-400 text-xs mb-0.5">Отримувач</p>
                    <p class="font-medium text-gray-800">
                      {{ order.customerName }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-400 text-xs mb-0.5">Телефон</p>
                    <p class="font-medium text-gray-800">
                      {{ order.customerPhone }}
                    </p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-gray-400 text-xs mb-0.5">Адреса доставки</p>
                    <p class="font-medium text-gray-800">
                      {{ order.city }}, {{ order.address }}
                    </p>
                  </div>
                  <div v-if="order.comment" class="col-span-2">
                    <p class="text-gray-400 text-xs mb-0.5">Коментар</p>
                    <p class="font-medium text-gray-800">{{ order.comment }}</p>
                  </div>
                </div>

                <!-- Items -->
                <div class="space-y-2">
                  <div
                    v-for="item in order.items"
                    :key="`${item.id}-${item.size}`"
                    class="flex items-center gap-3"
                  >
                    <img
                      :src="item.image"
                      :alt="item.name"
                      class="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-gray-800 truncate">
                        {{ item.brand }} {{ item.name }}
                      </p>
                      <p class="text-xs text-gray-500">
                        Розмір {{ item.size }} · {{ item.quantity }} шт
                      </p>
                    </div>
                    <span class="text-sm font-bold text-gray-900 shrink-0">
                      {{ formatPrice(item.price * item.quantity) }}
                    </span>
                  </div>
                </div>

                <div
                  class="flex justify-between items-center mt-4 pt-3 border-t border-gray-100"
                >
                  <span class="text-sm text-gray-500">Разом:</span>
                  <span class="font-bold text-lg text-orange-500">
                    {{ formatPrice(order.total) }}
                  </span>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Messages section -->
      <div v-if="activeTab === 'messages'">
        <h2 class="text-lg font-bold text-gray-900 mb-4">✉️ Повідомлення від адміна</h2>

        <!-- Loading -->
        <div v-if="messagesLoading" class="space-y-3">
          <div v-for="n in 3" :key="n" class="bg-white rounded-2xl h-20 animate-pulse border border-gray-100"></div>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="adminMessages.length === 0"
          class="bg-white rounded-3xl border border-gray-100 p-12 text-center"
        >
          <div class="text-5xl mb-4">💬</div>
          <h3 class="font-semibold text-gray-700 mb-2">Повідомлень ще немає</h3>
          <p class="text-gray-400 text-sm">Тут з'являться відповіді від адміністратора</p>
        </div>

        <!-- Messages list -->
        <div v-else class="space-y-3">
          <div
            v-for="msg in adminMessages"
            :key="msg.id"
            class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
            :class="{ 'border-l-4 border-l-orange-400': !msg.read }"
          >
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold shrink-0">А</div>
                <span class="font-semibold text-gray-800 text-sm">Адміністратор</span>
                <span v-if="!msg.read" class="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">Нове</span>
              </div>
              <span class="text-xs text-gray-400 shrink-0">{{ formatDate(msg.createdAt) }}</span>
            </div>
            <p class="text-gray-700 text-sm leading-relaxed">{{ msg.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
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
