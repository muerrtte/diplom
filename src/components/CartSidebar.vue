<script setup>
import { computed } from "vue";
import { useCartStore } from "../stores/cartStore";

const cartStore = useCartStore();

const subtotal = computed(() => cartStore.totalPrice);

function formatPrice(price) {
  return price.toLocaleString("uk-UA") + " ₴";
}
</script>

<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div
      v-if="cartStore.isOpen"
      class="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
      @click="cartStore.isOpen = false"
    />
  </Transition>

  <!-- Sidebar -->
  <Transition name="slide-right">
    <div
      v-if="cartStore.isOpen"
      class="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-5 py-4 border-b border-gray-100"
      >
        <div class="flex items-center gap-2">
          <svg
            class="w-5 h-5 text-orange-500"
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
          <h2 class="font-bold text-lg text-gray-900">Кошик</h2>
          <span
            class="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full"
            >{{ cartStore.totalItems }}</span
          >
        </div>
        <button
          @click="cartStore.isOpen = false"
          class="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg
            class="w-5 h-5 text-gray-500"
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

      <!-- Items list -->
      <div class="flex-1 overflow-y-auto px-5 py-4">
        <!-- Empty state -->
        <div
          v-if="cartStore.items.length === 0"
          class="flex flex-col items-center justify-center h-full gap-4 text-center"
        >
          <div class="text-6xl">🛒</div>
          <h3 class="font-semibold text-gray-700 text-lg">Кошик порожній</h3>
          <p class="text-gray-400 text-sm">
            Додайте товари, щоб зробити замовлення
          </p>
          <button
            @click="cartStore.isOpen = false"
            class="px-6 py-2.5 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
          >
            Перейти до каталогу
          </button>
        </div>

        <!-- Cart items -->
        <div v-else class="space-y-4">
          <div
            v-for="item in cartStore.items"
            :key="`${item.id}-${item.size}`"
            class="flex gap-3 bg-gray-50 rounded-2xl p-3"
          >
            <!-- Image -->
            <div class="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-white">
              <img
                :src="item.image"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p
                class="text-xs text-gray-400 uppercase font-medium tracking-wide"
              >
                {{ item.brand }}
              </p>
              <p
                class="font-semibold text-gray-900 text-sm leading-tight mt-0.5 truncate"
              >
                {{ item.name }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                Розмір:
                <span class="font-medium text-gray-700">{{ item.size }}</span>
              </p>
              <div class="flex items-center justify-between mt-2">
                <!-- Quantity controls -->
                <div class="flex items-center gap-1">
                  <button
                    @click="
                      cartStore.updateQuantity(
                        item.id,
                        item.size,
                        item.quantity - 1,
                      )
                    "
                    class="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-orange-400 hover:text-orange-500 transition-colors"
                  >
                    <svg
                      class="w-3 h-3"
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
                  <span class="w-7 text-center text-sm font-semibold">{{
                    item.quantity
                  }}</span>
                  <button
                    @click="
                      cartStore.updateQuantity(
                        item.id,
                        item.size,
                        item.quantity + 1,
                      )
                    "
                    class="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-orange-400 hover:text-orange-500 transition-colors"
                  >
                    <svg
                      class="w-3 h-3"
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
                <!-- Price -->
                <span class="font-bold text-gray-900 text-sm">{{
                  formatPrice(item.price * item.quantity)
                }}</span>
              </div>
            </div>

            <!-- Remove -->
            <button
              @click="cartStore.removeItem(item.id, item.size)"
              class="p-1.5 text-gray-300 hover:text-red-400 transition-colors shrink-0 self-start"
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
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer / Checkout -->
      <div
        v-if="cartStore.items.length > 0"
        class="border-t border-gray-100 px-5 py-4 space-y-3"
      >
        <div class="flex items-center justify-between text-sm text-gray-500">
          <span>Доставка</span>
          <span class="text-green-600 font-medium">Безкоштовно</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-gray-900">Разом:</span>
          <span class="font-bold text-xl text-gray-900">{{
            formatPrice(subtotal)
          }}</span>
        </div>
        <button
          class="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-orange-500/25"
        >
          Оформити замовлення →
        </button>
        <button
          @click="cartStore.isOpen = false"
          class="w-full py-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
        >
          Продовжити покупки
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
