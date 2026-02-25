<script setup>
import { ref, watch } from "vue";
import { useCartStore } from "../stores/cartStore";
import { useUserStore } from "../stores/userStore";
import { useOrdersStore } from "../stores/ordersStore";
import { useProductsStore } from "../stores/productsStore";

const emit = defineEmits(["close", "success"]);

const cartStore = useCartStore();
const userStore = useUserStore();
const ordersStore = useOrdersStore();
const productsStore = useProductsStore();

// Режим: 'guest' | 'login' | 'register'
const mode = ref(userStore.isLoggedIn ? "guest" : "guest");

const form = ref({
  name: userStore.currentUser?.name || "",
  email: userStore.currentUser?.email || "",
  phone: userStore.currentUser?.phone || "",
  city: "",
  address: "",
  comment: "",
  password: "",
  confirmPassword: "",
});

const loading = ref(false);
const error = ref("");
const step = ref("form"); // 'form' | 'success'
const placedOrder = ref(null);

// Заповнити форму при логіні
watch(
  () => userStore.currentUser,
  (user) => {
    if (user) {
      form.value.name = user.name || "";
      form.value.email = user.email || "";
      form.value.phone = user.phone || "";
    }
  },
);

function formatPrice(price) {
  return price.toLocaleString("uk-UA") + " ₴";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function submitOrder() {
  error.value = "";

  // Базова валідація
  if (!form.value.name.trim()) {
    error.value = "Вкажіть ваше ім'я";
    return;
  }
  if (!form.value.phone.trim()) {
    error.value = "Вкажіть номер телефону";
    return;
  }
  if (!form.value.email.trim()) {
    error.value = "Вкажіть email";
    return;
  }
  if (!form.value.city.trim()) {
    error.value = "Вкажіть місто";
    return;
  }
  if (!form.value.address.trim()) {
    error.value = "Вкажіть адресу доставки";
    return;
  }

  if (mode.value === "register") {
    if (!form.value.password) {
      error.value = "Введіть пароль";
      return;
    }
    if (form.value.password.length < 6) {
      error.value = "Пароль повинен містити мінімум 6 символів";
      return;
    }
    if (form.value.password !== form.value.confirmPassword) {
      error.value = "Паролі не співпадають";
      return;
    }
  }

  if (mode.value === "login" && !form.value.password) {
    error.value = "Введіть пароль";
    return;
  }

  loading.value = true;
  try {
    let userId = null;

    // Реєстрація / Вхід
    if (mode.value === "register") {
      const user = await userStore.register({
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        password: form.value.password,
      });
      userId = user.id;
    } else if (mode.value === "login") {
      const user = await userStore.login(form.value.email, form.value.password);
      userId = user.id;
      // Оновити дані форми
      form.value.name = user.name || form.value.name;
      form.value.phone = user.phone || form.value.phone;
    } else if (userStore.isLoggedIn) {
      userId = userStore.currentUser.id;
    }

    // Створити замовлення
    const order = await ordersStore.createOrder({
      userId,
      customerName: form.value.name,
      customerEmail: form.value.email,
      customerPhone: form.value.phone,
      city: form.value.city,
      address: form.value.address,
      comment: form.value.comment || "",
      items: cartStore.items.map((i) => ({ ...i })),
      total: cartStore.totalPrice,
    });

    // Зменшити залишок товарів
    for (const item of cartStore.items) {
      await productsStore.decreaseStock(item.id, item.quantity);
    }

    // Очистити кошик
    cartStore.clearCart();
    cartStore.isOpen = false;

    placedOrder.value = order;
    step.value = "success";
  } catch (e) {
    error.value = e.message || "Помилка оформлення замовлення";
  } finally {
    loading.value = false;
  }
}

function closeModal() {
  if (step.value === "success") {
    emit("success", placedOrder.value);
  }
  emit("close");
}
</script>

<template>
  <!-- Overlay -->
  <div
    class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
    @click.self="closeModal"
  >
    <!-- Modal -->
    <div
      class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <!-- === SUCCESS SCREEN === -->
      <div v-if="step === 'success'" class="p-8 text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Замовлення оформлено!
        </h2>
        <p class="text-gray-500 mb-1">
          Номер замовлення:
          <span class="font-bold text-orange-500">#{{ placedOrder?.id }}</span>
        </p>
        <p class="text-gray-500 text-sm mb-6">
          Ми зв'яжемося з вами за номером
          <strong>{{ placedOrder?.customerPhone }}</strong> для підтвердження.
        </p>

        <!-- Summary -->
        <div
          class="bg-gray-50 rounded-2xl p-4 text-left space-y-2 mb-6 text-sm"
        >
          <div class="flex justify-between">
            <span class="text-gray-500">Отримувач:</span>
            <span class="font-semibold">{{ placedOrder?.customerName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Адреса:</span>
            <span class="font-semibold text-right max-w-[220px]"
              >{{ placedOrder?.city }}, {{ placedOrder?.address }}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Товарів:</span>
            <span class="font-semibold">{{ placedOrder?.items?.length }}</span>
          </div>
          <div
            class="flex justify-between pt-2 border-t border-gray-200 text-base"
          >
            <span class="font-semibold">Разом:</span>
            <span class="font-bold text-orange-500">{{
              formatPrice(placedOrder?.total || 0)
            }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            v-if="userStore.isLoggedIn"
            @click="
              $router.push('/profile');
              closeModal();
            "
            class="flex-1 py-3 border-2 border-orange-500 text-orange-500 font-semibold rounded-2xl hover:bg-orange-50 transition-colors"
          >
            Мої замовлення
          </button>
          <button
            @click="closeModal"
            class="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors"
          >
            Продовжити покупки
          </button>
        </div>
      </div>

      <!-- === ORDER FORM === -->
      <div v-else>
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100"
        >
          <h2 class="text-xl font-bold text-gray-900">
            🛍️ Оформлення замовлення
          </h2>
          <button
            @click="closeModal"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="px-6 py-5 space-y-5">
          <!-- Mode selector (тільки якщо не залогінений) -->
          <div v-if="!userStore.isLoggedIn">
            <p class="text-sm text-gray-500 mb-2 font-medium">Ви:</p>
            <div class="flex gap-2">
              <button
                @click="mode = 'guest'"
                class="flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors"
                :class="
                  mode === 'guest'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                "
              >
                👤 Гість
              </button>
              <button
                @click="mode = 'login'"
                class="flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors"
                :class="
                  mode === 'login'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                "
              >
                🔑 Увійти
              </button>
              <button
                @click="mode = 'register'"
                class="flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors"
                :class="
                  mode === 'register'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                "
              >
                ✨ Реєстрація
              </button>
            </div>
          </div>

          <!-- Logged in banner -->
          <div
            v-if="userStore.isLoggedIn"
            class="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3"
          >
            <div
              class="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            >
              {{ userStore.currentUser.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-green-800 text-sm">
                {{ userStore.currentUser.name }}
              </p>
              <p class="text-green-600 text-xs truncate">
                {{ userStore.currentUser.email }}
              </p>
            </div>
            <button
              @click="userStore.logout()"
              class="text-xs text-green-600 hover:text-red-500 font-medium transition-colors"
            >
              Вийти
            </button>
          </div>

          <!-- Контактні дані -->
          <div class="space-y-3">
            <h3
              class="font-semibold text-gray-800 text-sm uppercase tracking-wide"
            >
              Контактні дані
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <label class="block text-xs text-gray-500 mb-1"
                  >Ім'я та прізвище *</label
                >
                <input
                  v-model="form.name"
                  placeholder="Іван Петренко"
                  class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1"
                  >Телефон *</label
                >
                <input
                  v-model="form.phone"
                  placeholder="+380 XX XXX XX XX"
                  class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Email *</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="email@example.com"
                  :readonly="userStore.isLoggedIn"
                  class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  :class="{ 'bg-gray-50 text-gray-500': userStore.isLoggedIn }"
                />
              </div>
            </div>
          </div>

          <!-- Адреса доставки -->
          <div class="space-y-3">
            <h3
              class="font-semibold text-gray-800 text-sm uppercase tracking-wide"
            >
              Адреса доставки
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Місто *</label>
                <input
                  v-model="form.city"
                  placeholder="Київ"
                  class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1"
                  >Вулиця, будинок *</label
                >
                <input
                  v-model="form.address"
                  placeholder="вул. Хрещатик, 1"
                  class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-xs text-gray-500 mb-1"
                  >Коментар до замовлення</label
                >
                <textarea
                  v-model="form.comment"
                  placeholder="Побажання, час доставки..."
                  rows="2"
                  class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Пароль (для логіну/реєстрації) -->
          <div
            v-if="mode === 'login' || mode === 'register'"
            class="space-y-3 border-t border-gray-100 pt-4"
          >
            <h3
              class="font-semibold text-gray-800 text-sm uppercase tracking-wide"
            >
              {{
                mode === "register" ? "Створити аккаунт" : "Увійти до аккаунту"
              }}
            </h3>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Пароль *</label>
              <input
                v-model="form.password"
                type="password"
                placeholder="Мінімум 6 символів"
                class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div v-if="mode === 'register'">
              <label class="block text-xs text-gray-500 mb-1"
                >Повторіть пароль *</label
              >
              <input
                v-model="form.confirmPassword"
                type="password"
                placeholder="Повторіть пароль"
                class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <p v-if="mode === 'register'" class="text-xs text-gray-400">
              ✨ Після реєстрації ви зможете стежити за статусом замовлень
            </p>
          </div>

          <!-- Зміст кошика -->
          <div class="border-t border-gray-100 pt-4">
            <h3
              class="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3"
            >
              Ваше замовлення ({{ cartStore.totalItems }} шт)
            </h3>
            <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
              <div
                v-for="item in cartStore.items"
                :key="`${item.id}-${item.size}`"
                class="flex items-center gap-3 bg-gray-50 rounded-xl p-2"
              >
                <img
                  :src="item.image"
                  :alt="item.name"
                  class="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate">
                    {{ item.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Розмір {{ item.size }} × {{ item.quantity }}
                  </p>
                </div>
                <span class="text-sm font-bold text-gray-900 shrink-0">
                  {{ formatPrice(item.price * item.quantity) }}
                </span>
              </div>
            </div>
            <div
              class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"
            >
              <span class="font-semibold text-gray-700">Разом до сплати:</span>
              <span class="font-bold text-xl text-orange-500">
                {{ formatPrice(cartStore.totalPrice) }}
              </span>
            </div>
          </div>

          <!-- Error -->
          <div
            v-if="error"
            class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"
          >
            ⚠️ {{ error }}
          </div>

          <!-- Submit -->
          <button
            @click="submitOrder"
            :disabled="loading"
            class="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
          >
            <svg
              v-if="loading"
              class="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>{{
              loading
                ? "Оформлення..."
                : mode === "register"
                  ? "Зареєструватися та замовити"
                  : mode === "login"
                    ? "Увійти та замовити"
                    : "Підтвердити замовлення →"
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
