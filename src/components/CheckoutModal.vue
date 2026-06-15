<script setup>
import { ref, computed, watch } from "vue";
import { useCartStore } from "../stores/cartStore";
import { useUserStore } from "../stores/userStore";
import { useOrdersStore } from "../stores/ordersStore";
import { useProductsStore } from "../stores/productsStore";

const emit = defineEmits(["close", "success"]);

const cartStore = useCartStore();
const userStore = useUserStore();
const ordersStore = useOrdersStore();
const productsStore = useProductsStore();

// Steps: 'cart' | 'contact' | 'delivery' | 'payment' | 'card' | 'success'
const currentStep = ref("cart");
const mode = ref("guest"); // 'guest' | 'login' | 'register'

const form = ref({
  name: userStore.currentUser?.name || "",
  email: userStore.currentUser?.email || "",
  phone: userStore.currentUser?.phone || "",
  city: "",
  address: "",
  deliveryMethod: "nova_poshta",
  comment: "",
  paymentMethod: "card",
  password: "",
  confirmPassword: "",
});

const card = ref({ number: "", name: "", expiry: "", cvv: "" });

const loading = ref(false);
const error = ref("");
const placedOrder = ref(null);

watch(() => userStore.currentUser, (user) => {
  if (user) {
    form.value.name = user.name || "";
    form.value.email = user.email || "";
    form.value.phone = user.phone || "";
  }
});

function formatPrice(p) { return p.toLocaleString("uk-UA") + " ₴"; }

// Progress steps shown in header
const progressSteps = [
  { key: "cart",     label: "Кошик",    icon: "🛒" },
  { key: "contact",  label: "Контакти", icon: "👤" },
  { key: "delivery", label: "Доставка", icon: "🚚" },
  { key: "payment",  label: "Оплата",   icon: "💳" },
];

const progressIndex = computed(() => {
  const map = { cart: 0, contact: 1, delivery: 2, payment: 3, card: 3, success: 4 };
  return map[currentStep.value] ?? 0;
});

const stepTitle = computed(() => ({
  cart:     "🛒 Ваше замовлення",
  contact:  "👤 Контактні дані",
  delivery: "🚚 Доставка",
  payment:  "💳 Спосіб оплати",
  card:     "🔒 Дані картки",
  success:  "",
}[currentStep.value]));

// ─── Navigation ────────────────────────────────────────────
function goNext() {
  error.value = "";
  if (currentStep.value === "cart") {
    currentStep.value = "contact";

  } else if (currentStep.value === "contact") {
    if (!form.value.name.trim())  { error.value = "Вкажіть ваше ім'я"; return; }
    if (!form.value.phone.trim()) { error.value = "Вкажіть номер телефону"; return; }
    if (!form.value.email.trim()) { error.value = "Вкажіть email"; return; }
    if (mode.value === "login" && !form.value.password) { error.value = "Введіть пароль"; return; }
    if (mode.value === "register") {
      if (!form.value.password) { error.value = "Введіть пароль"; return; }
      if (form.value.password.length < 6) { error.value = "Пароль мінімум 6 символів"; return; }
      if (form.value.password !== form.value.confirmPassword) { error.value = "Паролі не співпадають"; return; }
    }
    currentStep.value = "delivery";

  } else if (currentStep.value === "delivery") {
    if (!form.value.city.trim())    { error.value = "Вкажіть місто"; return; }
    if (!form.value.address.trim()) { error.value = "Вкажіть адресу / відділення"; return; }
    currentStep.value = "payment";

  } else if (currentStep.value === "payment") {
    if (form.value.paymentMethod === "card") {
      currentStep.value = "card";
    } else {
      placeOrder();
    }

  } else if (currentStep.value === "card") {
    const num = card.value.number.replace(/\s/g, "");
    if (num.length < 16)               { error.value = "Введіть повний номер картки (16 цифр)"; return; }
    if (!card.value.name.trim())        { error.value = "Введіть ім'я власника картки"; return; }
    if (card.value.expiry.length < 5)   { error.value = "Введіть термін дії (ММ/РР)"; return; }
    if (card.value.cvv.replace(/\D/g,"").length < 3) { error.value = "Введіть CVV (3 цифри)"; return; }
    placeOrder();
  }
}

function goBack() {
  error.value = "";
  const map = { contact: "cart", delivery: "contact", payment: "delivery", card: "payment" };
  if (map[currentStep.value]) currentStep.value = map[currentStep.value];
}

// ─── Submit order ───────────────────────────────────────────
async function placeOrder() {
  loading.value = true;
  error.value = "";
  try {
    let userId = null;
    if (mode.value === "register") {
      const u = await userStore.register({ name: form.value.name, email: form.value.email, phone: form.value.phone, password: form.value.password });
      userId = u.id;
    } else if (mode.value === "login") {
      const u = await userStore.login(form.value.email, form.value.password);
      userId = u.id;
      form.value.name  = u.name  || form.value.name;
      form.value.phone = u.phone || form.value.phone;
    } else if (userStore.isLoggedIn) {
      userId = userStore.currentUser.id;
    }

    if (form.value.paymentMethod === "card") {
      await new Promise((r) => setTimeout(r, 1500));
    }

    const order = await ordersStore.createOrder({
      userId,
      customerName:  form.value.name,
      customerEmail: form.value.email,
      customerPhone: form.value.phone,
      city:          form.value.city,
      address:       form.value.address,
      deliveryMethod: form.value.deliveryMethod,
      paymentMethod:  form.value.paymentMethod,
      comment:       form.value.comment || "",
      items:         cartStore.items.map((i) => ({ ...i })),
      total:         cartStore.totalPrice,
    });

    for (const item of cartStore.items) {
      await productsStore.decreaseStock(item.id, item.quantity);
    }

    cartStore.clearCart();
    cartStore.isOpen = false;
    placedOrder.value = order;
    currentStep.value = "success";
  } catch (e) {
    error.value = e.message || "Помилка оформлення. Спробуйте ще раз.";
  } finally {
    loading.value = false;
  }
}

// ─── Card input formatting ──────────────────────────────────
function onCardNumber(e) {
  let v = e.target.value.replace(/\D/g, "").slice(0, 16);
  card.value.number = v.replace(/(.{4})/g, "$1 ").trim();
}
function onExpiry(e) {
  let v = e.target.value.replace(/\D/g, "").slice(0, 4);
  card.value.expiry = v.length >= 3 ? v.slice(0, 2) + "/" + v.slice(2) : v;
}

function closeModal() {
  emit(currentStep.value === "success" ? "success" : "close", placedOrder.value);
  emit("close");
}

const deliveryOptions = [
  { value: "nova_poshta", label: "Нова Пошта", desc: "1–3 дні, за тарифами НП", icon: "📦" },
  { value: "ukr_poshta",  label: "Укрпошта",   desc: "3–7 днів, за тарифами УП", icon: "✉️" },
  { value: "pickup",      label: "Самовивіз",   desc: "Безкоштовно, готовність 2 год", icon: "🏪" },
];

const showPassword = ref(false);
const showConfirmPassword = ref(false);
</script>

<template>
  <!-- Overlay -->
  <div
    class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
    @click.self="closeModal"
  >
    <!-- Modal -->
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">

      <!-- ── SUCCESS ── -->
      <div v-if="currentStep === 'success'" class="p-8 text-center overflow-y-auto">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m4.5 12.75 6 6 9-13.5"/>
          </svg>
        </div>
        <h2 class="text-2xl font-extrabold text-gray-900 mb-1">Замовлення прийнято!</h2>
        <p class="text-gray-500 text-sm mb-1">Номер замовлення: <span class="font-bold text-orange-500">#{{ placedOrder?.id }}</span></p>
        <p class="text-gray-400 text-xs mb-6">Підтвердження відправлено на <strong>{{ placedOrder?.customerEmail }}</strong></p>

        <!-- Summary card -->
        <div class="bg-gray-50 rounded-2xl p-4 text-left text-sm space-y-2 mb-5">
          <div class="flex justify-between">
            <span class="text-gray-500">Отримувач:</span>
            <span class="font-semibold">{{ placedOrder?.customerName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Адреса:</span>
            <span class="font-semibold text-right max-w-[220px]">{{ placedOrder?.city }}, {{ placedOrder?.address }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Доставка:</span>
            <span class="font-semibold">{{
              placedOrder?.deliveryMethod === 'nova_poshta' ? '📦 Нова Пошта' :
              placedOrder?.deliveryMethod === 'ukr_poshta'  ? '✉️ Укрпошта' : '🏪 Самовивіз'
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Оплата:</span>
            <span class="font-semibold">
              {{ placedOrder?.paymentMethod === 'card' ? '💳 Карткою — оплачено' : '💵 Готівкою при отриманні' }}
            </span>
          </div>
          <div class="flex justify-between pt-2 border-t border-gray-200 text-base">
            <span class="font-bold">Разом:</span>
            <span class="font-extrabold text-orange-500">{{ formatPrice(placedOrder?.total || 0) }}</span>
          </div>
        </div>

        <!-- Items mini list -->
        <div class="space-y-2 mb-6">
          <div v-for="item in placedOrder?.items" :key="`${item.id}-${item.size}`" class="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
            <img :src="item.image" :alt="item.name" class="w-10 h-10 rounded-lg object-cover shrink-0"/>
            <div class="flex-1 min-w-0 text-left">
              <p class="text-xs font-semibold text-gray-800 truncate">{{ item.brand }} {{ item.name }}</p>
              <p class="text-xs text-gray-400">Розмір {{ item.size }} × {{ item.quantity }}</p>
            </div>
            <span class="text-xs font-bold text-gray-900 shrink-0">{{ formatPrice(item.price * item.quantity) }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            v-if="userStore.isLoggedIn"
            @click="$router.push('/profile'); closeModal()"
            class="flex-1 py-3 border-2 border-orange-500 text-orange-500 font-semibold rounded-2xl hover:bg-orange-50 transition-colors text-sm"
          >Мої замовлення</button>
          <button @click="closeModal" class="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors text-sm">
            Продовжити покупки
          </button>
        </div>
      </div>

      <!-- ── STEPS ── -->
      <template v-else>
        <!-- Header with progress -->
        <div class="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">{{ stepTitle }}</h2>
            <button @click="closeModal" class="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Progress bar -->
          <div class="flex items-center gap-1">
            <template v-for="(s, i) in progressSteps" :key="s.key">
              <div class="flex flex-col items-center gap-0.5 flex-1">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  :class="i < progressIndex ? 'bg-green-500 text-white' : i === progressIndex ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'"
                >
                  <svg v-if="i < progressIndex" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="m4.5 12.75 6 6 9-13.5"/>
                  </svg>
                  <span v-else>{{ i + 1 }}</span>
                </div>
                <span class="text-[10px] font-medium" :class="i === progressIndex ? 'text-orange-500' : i < progressIndex ? 'text-green-600' : 'text-gray-400'">
                  {{ s.label }}
                </span>
              </div>
              <div v-if="i < progressSteps.length - 1" class="flex-1 h-0.5 mb-3 rounded" :class="i < progressIndex ? 'bg-green-400' : 'bg-gray-200'"></div>
            </template>
          </div>
        </div>

        <!-- Step content -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <Transition name="slide" mode="out-in">

            <!-- STEP 1: Cart review -->
            <div v-if="currentStep === 'cart'" key="cart" class="space-y-3">
              <div v-for="item in cartStore.items" :key="`${item.id}-${item.size}`" class="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                <img :src="item.image" :alt="item.name" class="w-16 h-16 rounded-xl object-cover shrink-0 bg-white"/>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-400 uppercase font-semibold tracking-wide">{{ item.brand }}</p>
                  <p class="font-semibold text-gray-900 text-sm truncate">{{ item.name }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">Розмір {{ item.size }} · {{ item.quantity }} шт</p>
                </div>
                <span class="font-bold text-gray-900 text-sm shrink-0">{{ formatPrice(item.price * item.quantity) }}</span>
              </div>

              <div class="flex items-center justify-between bg-orange-50 rounded-2xl px-4 py-3 border border-orange-100">
                <div>
                  <p class="text-xs text-gray-500">Доставка</p>
                  <p class="text-sm font-semibold text-green-600">Безкоштовно</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">Разом</p>
                  <p class="text-xl font-extrabold text-orange-500">{{ formatPrice(cartStore.totalPrice) }}</p>
                </div>
              </div>
            </div>

            <!-- STEP 2: Contact info -->
            <div v-else-if="currentStep === 'contact'" key="contact" class="space-y-4">
              <!-- Auth mode -->
              <div v-if="!userStore.isLoggedIn" class="flex gap-2">
                <button v-for="m in [['guest','👤 Гість'],['login','🔑 Маю акаунт'],['register','✨ Реєстрація']]" :key="m[0]"
                  @click="mode = m[0]"
                  class="flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-colors"
                  :class="mode === m[0] ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'"
                >{{ m[1] }}</button>
              </div>

              <div v-if="userStore.isLoggedIn" class="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <div class="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {{ userStore.currentUser.name?.charAt(0)?.toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-green-800 text-sm">{{ userStore.currentUser.name }}</p>
                  <p class="text-green-600 text-xs truncate">{{ userStore.currentUser.email }}</p>
                </div>
                <button @click="userStore.logout()" class="text-xs text-green-600 hover:text-red-500 font-medium transition-colors">Вийти</button>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Ім'я та прізвище *</label>
                <input v-model="form.name" placeholder="Іван Петренко"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"/>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Телефон *</label>
                  <input v-model="form.phone" placeholder="+380 XX XXX XX XX"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"/>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
                  <input v-model="form.email" type="email" placeholder="email@example.com"
                    :readonly="userStore.isLoggedIn"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                    :class="{ 'bg-gray-50 text-gray-400': userStore.isLoggedIn }"/>
                </div>
              </div>

              <!-- Password for login/register -->
              <div v-if="mode === 'login' || mode === 'register'" class="space-y-3 pt-2 border-t border-gray-100">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Пароль *</label>
                  <div class="relative">
                    <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Мінімум 6 символів"
                      class="w-full px-4 py-3 pr-11 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"/>
                    <button type="button" @click="showPassword = !showPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                      </svg>
                      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div v-if="mode === 'register'">
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Повторіть пароль *</label>
                  <div class="relative">
                    <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Повторіть пароль"
                      class="w-full px-4 py-3 pr-11 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"/>
                    <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg v-if="showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                      </svg>
                      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3: Delivery -->
            <div v-else-if="currentStep === 'delivery'" key="delivery" class="space-y-4">
              <!-- Delivery method -->
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-2">Спосіб доставки</label>
                <div class="space-y-2">
                  <button v-for="opt in deliveryOptions" :key="opt.value"
                    @click="form.deliveryMethod = opt.value"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all"
                    :class="form.deliveryMethod === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'"
                  >
                    <span class="text-xl shrink-0">{{ opt.icon }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-sm" :class="form.deliveryMethod === opt.value ? 'text-orange-700' : 'text-gray-800'">{{ opt.label }}</p>
                      <p class="text-xs text-gray-400">{{ opt.desc }}</p>
                    </div>
                    <div class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                      :class="form.deliveryMethod === opt.value ? 'border-orange-500 bg-orange-500' : 'border-gray-300'">
                      <div v-if="form.deliveryMethod === opt.value" class="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- City & address -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Місто *</label>
                  <input v-model="form.city" placeholder="Київ"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"/>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">
                    {{ form.deliveryMethod === 'pickup' ? 'Магазин *' : 'Відділення / Адреса *' }}
                  </label>
                  <input v-model="form.address"
                    :placeholder="form.deliveryMethod === 'nova_poshta' ? 'Відділення №5' : form.deliveryMethod === 'pickup' ? 'Хрещатик, 22' : 'вул. Центральна, 1'"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"/>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Коментар до замовлення</label>
                <textarea v-model="form.comment" rows="2" placeholder="Побажання, зручний час доставки..."
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors resize-none"></textarea>
              </div>
            </div>

            <!-- STEP 4: Payment method -->
            <div v-else-if="currentStep === 'payment'" key="payment" class="space-y-3">
              <p class="text-sm text-gray-500 mb-1">Оберіть зручний спосіб оплати:</p>
              <button
                @click="form.paymentMethod = 'card'"
                class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all"
                :class="form.paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :class="form.paymentMethod === 'card' ? 'bg-orange-100' : 'bg-gray-100'">
                  <svg class="w-6 h-6" :class="form.paymentMethod === 'card' ? 'text-orange-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-sm" :class="form.paymentMethod === 'card' ? 'text-orange-700' : 'text-gray-800'">💳 Оплата карткою</p>
                  <p class="text-xs text-gray-400 mt-0.5">Visa, Mastercard — безпечна оплата</p>
                  <div class="flex gap-1.5 mt-2">
                    <span v-for="b in ['VISA','MC','🔒 SSL']" :key="b" class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded font-semibold">{{ b }}</span>
                  </div>
                </div>
                <div class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center" :class="form.paymentMethod === 'card' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'">
                  <div v-if="form.paymentMethod === 'card'" class="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </button>

              <button
                @click="form.paymentMethod = 'cash'"
                class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all"
                :class="form.paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :class="form.paymentMethod === 'cash' ? 'bg-orange-100' : 'bg-gray-100'">
                  <svg class="w-6 h-6" :class="form.paymentMethod === 'cash' ? 'text-orange-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-sm" :class="form.paymentMethod === 'cash' ? 'text-orange-700' : 'text-gray-800'">💵 Готівкою при отриманні</p>
                  <p class="text-xs text-gray-400 mt-0.5">Оплачуєте кур'єру або на пошті</p>
                </div>
                <div class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center" :class="form.paymentMethod === 'cash' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'">
                  <div v-if="form.paymentMethod === 'cash'" class="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </button>

              <!-- Order mini summary -->
              <div class="mt-2 bg-gray-50 rounded-xl px-4 py-3 flex justify-between text-sm">
                <span class="text-gray-500">До сплати:</span>
                <span class="font-extrabold text-orange-500">{{ formatPrice(cartStore.totalPrice) }}</span>
              </div>
            </div>

            <!-- STEP 5: Card details -->
            <div v-else-if="currentStep === 'card'" key="card" class="space-y-4">
              <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white mb-2">
                <p class="text-xs text-gray-400 mb-3 tracking-widest">БАНКІВСЬКА КАРТКА</p>
                <p class="text-xl font-mono tracking-widest mb-4">
                  {{ card.number || '•••• •••• •••• ••••' }}
                </p>
                <div class="flex justify-between items-end">
                  <div>
                    <p class="text-[10px] text-gray-400 uppercase">Власник</p>
                    <p class="font-semibold text-sm uppercase tracking-wide">{{ card.name || 'ВАШЕ ІМ\'Я' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] text-gray-400 uppercase">Термін</p>
                    <p class="font-semibold text-sm">{{ card.expiry || 'ММ/РР' }}</p>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Номер картки *</label>
                <input
                  :value="card.number"
                  @input="onCardNumber"
                  placeholder="0000 0000 0000 0000"
                  maxlength="19"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Ім'я власника (як на картці) *</label>
                <input v-model="card.name" placeholder="IVAN PETRENKO"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm uppercase tracking-wide focus:outline-none focus:border-orange-400 transition-colors"/>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Термін дії *</label>
                  <input
                    :value="card.expiry"
                    @input="onExpiry"
                    placeholder="ММ/РР"
                    maxlength="5"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">CVV *</label>
                  <input
                    v-model="card.cvv"
                    type="password"
                    placeholder="•••"
                    maxlength="3"
                    @input="card.cvv = card.cvv.replace(/\D/g, '').slice(0, 3)"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
              </div>
              <p class="text-xs text-gray-400 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                </svg>
                Дані захищені протоколом SSL. Ми не зберігаємо дані картки.
              </p>
            </div>

          </Transition>

          <!-- Error -->
          <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ {{ error }}
          </div>
        </div>

        <!-- Footer with navigation -->
        <div class="px-6 py-4 border-t border-gray-100 shrink-0 space-y-2">
          <button
            @click="goNext"
            :disabled="loading"
            class="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
          >
            <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>{{
              loading ? (currentStep === 'card' ? 'Обробка платежу...' : 'Зачекайте...') :
              currentStep === 'cart'     ? `Перейти до оформлення →` :
              currentStep === 'contact'  ? 'Далі: Доставка →' :
              currentStep === 'delivery' ? 'Далі: Оплата →' :
              currentStep === 'payment' && form.paymentMethod === 'card'  ? 'Далі: Дані картки →' :
              currentStep === 'payment' && form.paymentMethod === 'cash'  ? 'Підтвердити замовлення →' :
              currentStep === 'card'     ? `Оплатити ${formatPrice(cartStore.totalPrice || 0)}` : 'Далі →'
            }}</span>
          </button>
          <button v-if="currentStep !== 'cart'" @click="goBack" class="w-full py-2.5 text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors">
            ← Назад
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from { opacity: 0; transform: translateX(20px); }
.slide-leave-to  { opacity: 0; transform: translateX(-20px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
