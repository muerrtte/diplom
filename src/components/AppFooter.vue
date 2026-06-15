<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useMessagesStore } from "../stores/messagesStore";
import { useUserStore } from "../stores/userStore";

const messagesStore = useMessagesStore();
const userStore = useUserStore();
const router = useRouter();

// Info modal
const infoModal = ref(null); // null | 'delivery' | 'returns' | 'sizes' | 'about' | 'stores' | 'terms' | 'privacy' | 'contact'

// Contact form
const contactForm = ref({ name: "", email: "", phone: "", text: "" });
const contactSending = ref(false);
const contactSent = ref(false);
const contactError = ref("");

function openModal(type) {
  if (type === "contact") {
    if (!userStore.isLoggedIn) {
      router.push("/login");
      return;
    }
    contactForm.value = {
      name: userStore.currentUser?.name || "",
      email: userStore.currentUser?.email || "",
      phone: userStore.currentUser?.phone || "",
      text: "",
    };
    contactSent.value = false;
    contactError.value = "";
  }
  infoModal.value = type;
}

async function sendContact() {
  contactError.value = "";
  if (!contactForm.value.name.trim() || !contactForm.value.text.trim()) {
    contactError.value = "Заповніть ім'я та повідомлення";
    return;
  }
  contactSending.value = true;
  try {
    await messagesStore.sendMessage(contactForm.value);
    contactSent.value = true;
  } catch {
    contactError.value = "Помилка відправки. Спробуйте ще раз.";
  } finally {
    contactSending.value = false;
  }
}

const modalContent = {
  delivery: {
    title: "Доставка та оплата",
    icon: "🚚",
  },
  returns: {
    title: "Повернення та обмін",
    icon: "↩️",
  },
  sizes: {
    title: "Таблиця розмірів",
    icon: "📏",
  },
  about: {
    title: "Про нас",
    icon: "👟",
  },
  stores: {
    title: "Наші магазини",
    icon: "📍",
  },
  terms: {
    title: "Умови використання",
    icon: "📄",
  },
  privacy: {
    title: "Політика конфіденційності",
    icon: "🔒",
  },
  contact: {
    title: "Написати нам",
    icon: "✉️",
  },
};
</script>

<template>
  <footer class="bg-gray-900 text-gray-300 mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="md:col-span-1">
          <RouterLink to="/" class="flex items-center gap-2 mb-4">
            <span class="text-2xl">👟</span>
            <span class="font-extrabold text-xl text-white tracking-tight">
              Sneak<span class="text-orange-500">Shop</span>
            </span>
          </RouterLink>
          <p class="text-sm text-gray-400 leading-relaxed">
            Найкращий вибір кросівок від провідних світових брендів. Оригінальна
            продукція з гарантією якості.
          </p>
          <div class="flex gap-3 mt-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 bg-gray-700 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
              title="Facebook"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 bg-gray-700 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
              title="Instagram"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
                />
              </svg>
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 bg-gray-700 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
              title="TikTok"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.72a8.18 8.18 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Покупцям -->
        <div>
          <h4 class="font-semibold text-white mb-4">Покупцям</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <RouterLink
                to="/"
                class="hover:text-orange-400 transition-colors"
              >
                Каталог кросівок
              </RouterLink>
            </li>
            <li>
              <button
                @click="openModal('delivery')"
                class="hover:text-orange-400 transition-colors text-left"
              >
                Доставка та оплата
              </button>
            </li>
            <li>
              <button
                @click="openModal('returns')"
                class="hover:text-orange-400 transition-colors text-left"
              >
                Повернення та обмін
              </button>
            </li>
            <li>
              <button
                @click="openModal('sizes')"
                class="hover:text-orange-400 transition-colors text-left"
              >
                Таблиця розмірів
              </button>
            </li>
            <li>
              <RouterLink
                to="/favorites"
                class="hover:text-orange-400 transition-colors"
              >
                Список вибраного
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Компанія -->
        <div>
          <h4 class="font-semibold text-white mb-4">Компанія</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <button
                @click="openModal('about')"
                class="hover:text-orange-400 transition-colors text-left"
              >
                Про нас
              </button>
            </li>
            <li>
              <button
                @click="openModal('stores')"
                class="hover:text-orange-400 transition-colors text-left"
              >
                Наші магазини
              </button>
            </li>
            <li>
              <RouterLink
                to="/profile"
                class="hover:text-orange-400 transition-colors"
              >
                Особистий кабінет
              </RouterLink>
            </li>
            <li>
              <button
                @click="openModal('contact')"
                class="hover:text-orange-400 transition-colors text-left"
              >
                Написати нам
              </button>
            </li>
          </ul>
        </div>

        <!-- Контакти -->
        <div>
          <h4 class="font-semibold text-white mb-4">Контакти</h4>
          <ul class="space-y-3 text-sm">
            <li class="flex items-start gap-2">
              <svg
                class="w-4 h-4 mt-0.5 text-orange-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              <a
                href="mailto:info@sneakshop.ua"
                class="hover:text-orange-400 transition-colors"
                >info@sneakshop.ua</a
              >
            </li>
            <li class="flex items-start gap-2">
              <svg
                class="w-4 h-4 mt-0.5 text-orange-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Пн–Пт: 9:00–20:00<br />Сб–Нд: 10:00–18:00</span>
            </li>
            <li class="mt-2">
              <button
                @click="openModal('contact')"
                class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                ✉️ Написати нам
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div
        class="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500"
      >
        <p>© 2026 SneakShop. Всі права захищено.</p>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="fade">
      <div
        v-if="infoModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        @click.self="infoModal = null"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        >
          <!-- Modal header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl"
          >
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ modalContent[infoModal]?.icon }}</span>
              <h3 class="text-lg font-bold text-gray-900">
                {{ modalContent[infoModal]?.title }}
              </h3>
            </div>
            <button
              @click="infoModal = null"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Modal body -->
          <div class="px-6 py-5">
            <!-- Delivery -->
            <div
              v-if="infoModal === 'delivery'"
              class="space-y-4 text-sm text-gray-700"
            >
              <div class="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <p class="font-semibold text-orange-700 mb-1">🚚 Нова Пошта</p>
                <p>
                  Доставка по всій Україні. Термін — 1–3 робочі дні. Вартість —
                  за тарифами перевізника.
                </p>
              </div>
              <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p class="font-semibold text-blue-700 mb-1">🏪 Самовивіз</p>
                <p>
                  Безкоштовно з наших магазинів у Києві, Харкові та Одесі.
                  Готовність — 2 години після підтвердження.
                </p>
              </div>
              <div class="bg-green-50 rounded-xl p-4 border border-green-100">
                <p class="font-semibold text-green-700 mb-1">💳 Оплата</p>
                <ul class="list-disc list-inside space-y-1 mt-1">
                  <li>Онлайн карткою Visa / Mastercard</li>
                  <li>Накладений платіж (+20 ₴ комісія)</li>
                  <li>Готівкою при самовивозі</li>
                </ul>
              </div>
            </div>

            <!-- Returns -->
            <div
              v-else-if="infoModal === 'returns'"
              class="space-y-4 text-sm text-gray-700"
            >
              <p class="text-gray-500">
                Ми хочемо, щоб ви були задоволені покупкою. Ось умови
                повернення:
              </p>
              <div class="space-y-3">
                <div class="flex gap-3 items-start">
                  <span class="text-green-500 text-lg shrink-0">✅</span>
                  <div>
                    <p class="font-semibold">14 днів на повернення</p>
                    <p class="text-gray-500">
                      товар у незношеному стані, з бирками та в оригінальній
                      упаковці
                    </p>
                  </div>
                </div>
                <div class="flex gap-3 items-start">
                  <span class="text-green-500 text-lg shrink-0">✅</span>
                  <div>
                    <p class="font-semibold">Безкоштовний обмін розміру</p>
                    <p class="text-gray-500">
                      один раз протягом 30 днів з моменту покупки
                    </p>
                  </div>
                </div>
                <div class="flex gap-3 items-start">
                  <span class="text-green-500 text-lg shrink-0">✅</span>
                  <div>
                    <p class="font-semibold">Повернення коштів</p>
                    <p class="text-gray-500">
                      протягом 3–5 банківських днів після отримання товару
                    </p>
                  </div>
                </div>
                <div class="flex gap-3 items-start">
                  <span class="text-red-400 text-lg shrink-0">❌</span>
                  <div>
                    <p class="font-semibold">Не підлягає поверненню</p>
                    <p class="text-gray-500">
                      взуття, що мало сліди носіння або пошкодження
                    </p>
                  </div>
                </div>
              </div>
              <button
                @click="infoModal = 'contact'"
                class="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors text-sm mt-2"
              >
                Написати щодо повернення
              </button>
            </div>

            <!-- Sizes -->
            <div
              v-else-if="infoModal === 'sizes'"
              class="text-sm text-gray-700"
            >
              <p class="text-gray-500 mb-4">
                Розміри вказані в EU. Виміряйте стопу в сантиметрах і знайдіть
                відповідний розмір.
              </p>
              <div class="overflow-x-auto">
                <table class="w-full text-center border-collapse">
                  <thead>
                    <tr class="bg-gray-50">
                      <th
                        class="px-3 py-2 border border-gray-200 font-semibold"
                      >
                        EU
                      </th>
                      <th
                        class="px-3 py-2 border border-gray-200 font-semibold"
                      >
                        US (чол)
                      </th>
                      <th
                        class="px-3 py-2 border border-gray-200 font-semibold"
                      >
                        US (жін)
                      </th>
                      <th
                        class="px-3 py-2 border border-gray-200 font-semibold"
                      >
                        см
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in [
                        [36, '4', '5.5', '22.5'],
                        [37, '4.5', '6', '23'],
                        [38, '5', '6.5', '23.5'],
                        [39, '6', '7.5', '24.5'],
                        [40, '7', '8.5', '25'],
                        [41, '8', '9.5', '25.5'],
                        [42, '9', '10.5', '26.5'],
                        [43, '10', '11.5', '27'],
                        [44, '11', '12.5', '27.5'],
                        [45, '12', '13.5', '28.5'],
                        [46, '13', '14.5', '29'],
                      ]"
                      :key="row[0]"
                      class="hover:bg-orange-50 transition-colors"
                    >
                      <td
                        class="px-3 py-2 border border-gray-200 font-semibold text-orange-600"
                      >
                        {{ row[0] }}
                      </td>
                      <td class="px-3 py-2 border border-gray-200">
                        {{ row[1] }}
                      </td>
                      <td class="px-3 py-2 border border-gray-200">
                        {{ row[2] }}
                      </td>
                      <td class="px-3 py-2 border border-gray-200">
                        {{ row[3] }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="text-xs text-gray-400 mt-3">
                * Розміри є орієнтовними. Якщо сумніваєтесь — звертайтесь до
                нас.
              </p>
            </div>

            <!-- About -->
            <div
              v-else-if="infoModal === 'about'"
              class="space-y-4 text-sm text-gray-700"
            >
              <div class="text-center py-4">
                <div class="text-5xl mb-3">👟</div>
                <h4 class="text-xl font-bold text-gray-900">SneakShop</h4>
                <p class="text-gray-500 text-sm mt-1">Засновано у 2020 році</p>
              </div>
              <p>
                SneakShop — це інтернет-магазин кросівок преміум-класу, де ви
                знайдете оригінальне взуття від найвидатніших брендів світу:
                Nike, Adidas, Jordan, New Balance, Puma та інших.
              </p>
              <p>
                Ми пишаємося нашою командою — справжніми ентузіастами кросівок
                (sneakerheads), які ретельно підбирають кожну модель для нашого
                каталогу.
              </p>
              <div class="grid grid-cols-3 gap-3 mt-2">
                <div
                  class="bg-orange-50 rounded-xl p-3 text-center border border-orange-100"
                >
                  <p class="text-2xl font-extrabold text-orange-500">50+</p>
                  <p class="text-xs text-gray-500 mt-1">моделей</p>
                </div>
                <div
                  class="bg-orange-50 rounded-xl p-3 text-center border border-orange-100"
                >
                  <p class="text-2xl font-extrabold text-orange-500">10+</p>
                  <p class="text-xs text-gray-500 mt-1">брендів</p>
                </div>
                <div
                  class="bg-orange-50 rounded-xl p-3 text-center border border-orange-100"
                >
                  <p class="text-2xl font-extrabold text-orange-500">100%</p>
                  <p class="text-xs text-gray-500 mt-1">оригінал</p>
                </div>
              </div>
            </div>

            <!-- Stores -->
            <div
              v-else-if="infoModal === 'stores'"
              class="space-y-3 text-sm text-gray-700"
            >
              <div
                v-for="store in [
                  {
                    city: 'Київ',
                    address: 'вул. Хрещатик, 22',
                    hours: 'Пн–Нд: 10:00–21:00',
                  },
                  {
                    city: 'Харків',
                    address: 'пр. Науки, 14',
                    hours: 'Пн–Нд: 10:00–20:00',
                  },
                  {
                    city: 'Одеса',
                    address: 'вул. Дерибасівська, 8',
                    hours: 'Пн–Нд: 10:00–20:00',
                  },
                ]"
                :key="store.city"
                class="bg-gray-50 rounded-xl p-4 border border-gray-100"
              >
                <div class="flex items-start gap-3">
                  <span class="text-2xl">📍</span>
                  <div>
                    <p class="font-bold text-gray-900">{{ store.city }}</p>
                    <p class="text-gray-600 mt-0.5">{{ store.address }}</p>
                    <p class="text-gray-500 text-xs mt-1">{{ store.hours }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Terms -->
            <div
              v-else-if="infoModal === 'terms'"
              class="space-y-3 text-sm text-gray-700"
            >
              <p>
                Використовуючи сайт SneakShop, ви погоджуєтесь з наступними
                умовами:
              </p>
              <ul class="list-disc list-inside space-y-2 text-gray-600">
                <li>
                  Сайт призначений для осіб від 18 років або під наглядом
                  батьків.
                </li>
                <li>Усі ціни на сайті вказані в гривнях та включають ПДВ.</li>
                <li>
                  Магазин залишає за собою право змінювати ціни без попереднього
                  повідомлення.
                </li>
                <li>
                  Замовлення вважається прийнятим після підтвердження
                  менеджером.
                </li>
                <li>
                  Фотографії товарів є ілюстративними — реальний колір може дещо
                  відрізнятися.
                </li>
              </ul>
              <p class="text-gray-400 text-xs">Останнє оновлення: 01.01.2026</p>
            </div>

            <!-- Privacy -->
            <div
              v-else-if="infoModal === 'privacy'"
              class="space-y-3 text-sm text-gray-700"
            >
              <p>
                SneakShop поважає вашу конфіденційність та зобов'язується
                захищати ваші персональні дані.
              </p>
              <div class="space-y-2">
                <div class="flex gap-2 items-start">
                  <span class="text-orange-500 shrink-0">🔒</span>
                  <p>
                    <strong>Які дані збираємо:</strong> ім'я, email, телефон,
                    адреса доставки.
                  </p>
                </div>
                <div class="flex gap-2 items-start">
                  <span class="text-orange-500 shrink-0">🎯</span>
                  <p>
                    <strong>Навіщо:</strong> обробка замовлень, зв'язок з
                    клієнтом, поліпшення сервісу.
                  </p>
                </div>
                <div class="flex gap-2 items-start">
                  <span class="text-orange-500 shrink-0">🚫</span>
                  <p>
                    <strong>Не передаємо третім особам</strong> без вашої згоди,
                    крім перевізника для доставки.
                  </p>
                </div>
                <div class="flex gap-2 items-start">
                  <span class="text-orange-500 shrink-0">✉️</span>
                  <p>
                    <strong>Ваші права:</strong> ви можете запросити видалення
                    або виправлення даних у будь-який час.
                  </p>
                </div>
              </div>
              <p class="text-gray-400 text-xs">Останнє оновлення: 01.01.2026</p>
            </div>

            <!-- Contact form -->
            <div v-else-if="infoModal === 'contact'">
              <Transition name="fade" mode="out-in">
                <div v-if="contactSent" key="sent" class="text-center py-6">
                  <div class="text-5xl mb-3">✅</div>
                  <p class="text-lg font-semibold text-gray-900 mb-1">
                    Повідомлення відправлено!
                  </p>
                  <p class="text-sm text-gray-500 mb-5">
                    Ми зв'яжемося з вами найближчим часом.
                  </p>
                  <div class="flex gap-3">
                    <button
                      @click="
                        contactSent = false;
                        contactForm = {
                          name: '',
                          email: '',
                          phone: '',
                          text: '',
                        };
                      "
                      class="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                    >
                      Написати ще
                    </button>
                    <button
                      @click="infoModal = null"
                      class="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm"
                    >
                      Закрити
                    </button>
                  </div>
                </div>
                <div v-else key="form" class="space-y-3 text-sm">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        class="block text-xs font-semibold text-gray-500 mb-1"
                        >Ім'я *</label
                      >
                      <input
                        v-model="contactForm.name"
                        type="text"
                        placeholder="Ваше ім'я"
                        class="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-orange-400 transition"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-xs font-semibold text-gray-500 mb-1"
                        >Телефон</label
                      >
                      <input
                        v-model="contactForm.phone"
                        type="tel"
                        placeholder="+380..."
                        class="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-orange-400 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      class="block text-xs font-semibold text-gray-500 mb-1"
                      >Email</label
                    >
                    <input
                      v-model="contactForm.email"
                      type="email"
                      placeholder="email@example.com"
                      class="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-orange-400 transition"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-xs font-semibold text-gray-500 mb-1"
                      >Повідомлення *</label
                    >
                    <textarea
                      v-model="contactForm.text"
                      rows="4"
                      placeholder="Ваше питання або пропозиція..."
                      class="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-orange-400 transition resize-none"
                    ></textarea>
                  </div>
                  <p v-if="contactError" class="text-red-500 text-sm">
                    {{ contactError }}
                  </p>
                  <button
                    @click="sendContact"
                    :disabled="contactSending"
                    class="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <svg
                      v-if="contactSending"
                      class="w-4 h-4 animate-spin"
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
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    {{
                      contactSending ? "Відправка..." : "Надіслати повідомлення"
                    }}
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </footer>
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
