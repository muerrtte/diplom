<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { useOrdersStore } from "../stores/ordersStore";

const router = useRouter();
const userStore = useUserStore();
const ordersStore = useOrdersStore();

const orders = ref([]);
const loading = ref(false);
const expandedOrder = ref(null);

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

      <!-- Orders section -->
      <div>
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
</style>
