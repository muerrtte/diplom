<script setup>
import { ref, reactive, watch, computed } from "vue";

const props = defineProps({
  product: { type: Object, default: null },
});
const emit = defineEmits(["save", "close"]);

const isEdit = computed(() => !!props.product?.id);

const SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
const CATEGORIES = [
  { slug: "running", label: "🏃 Бігові" },
  { slug: "casual", label: "👟 Повсякденні" },
  { slug: "basketball", label: "🏀 Баскетбольні" },
  { slug: "training", label: "💪 Тренувальні" },
];

// --- Form state ---
const form = reactive({
  name: "",
  brand: "",
  price: "",
  oldPrice: "",
  image: "",
  category: "casual",
  sizes: [],
  description: "",
  rating: "4.5",
  reviewsCount: "0",
  inStock: true,
  isNew: false,
  isSale: false,
  gender: "unisex",
  colors: "",
});
const errors = reactive({});
const saving = ref(false);

// Fill form when editing
watch(
  () => props.product,
  (p) => {
    if (p) {
      Object.assign(form, {
        name: p.name || "",
        brand: p.brand || "",
        price: p.price ?? "",
        oldPrice: p.oldPrice ?? "",
        image: p.image || "",
        category: p.category || "casual",
        sizes: Array.isArray(p.sizes) ? [...p.sizes] : [],
        description: p.description || "",
        rating: p.rating ?? "4.5",
        reviewsCount: p.reviewsCount ?? "0",
        inStock: p.inStock ?? true,
        isNew: p.isNew ?? false,
        isSale: p.isSale ?? false,
        gender: p.gender || "unisex",
        colors: Array.isArray(p.colors) ? p.colors.join(", ") : p.colors || "",
      });
    }
  },
  { immediate: true },
);

function toggleSize(size) {
  const idx = form.sizes.indexOf(size);
  if (idx >= 0) form.sizes.splice(idx, 1);
  else form.sizes.push(size);
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.name.trim()) errors.name = "Введіть назву";
  if (!form.brand.trim()) errors.brand = "Введіть бренд";
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
    errors.price = "Введіть коректну ціну";
  if (!form.image.trim()) errors.image = "Вставте URL зображення";
  if (form.sizes.length === 0) errors.sizes = "Оберіть хоча б один розмір";
  return Object.keys(errors).length === 0;
}

async function handleSubmit() {
  if (!validate()) return;
  saving.value = true;
  try {
    const payload = {
      ...(props.product?.id ? { id: props.product.id } : {}),
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      image: form.image.trim(),
      category: form.category,
      sizes: [...form.sizes].sort((a, b) => a - b),
      description: form.description.trim(),
      rating: parseFloat(form.rating) || 4.5,
      reviewsCount: parseInt(form.reviewsCount) || 0,
      inStock: form.inStock,
      isNew: form.isNew,
      isSale: form.isSale,
      gender: form.gender,
      colors: form.colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    };
    emit("save", payload);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Transition name="modal">
    <div
      class="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
        >
          <h2 class="text-lg font-bold text-gray-900">
            {{ isEdit ? "✏️ Редагування товару" : "➕ Новий товар" }}
          </h2>
          <button
            @click="$emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
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

        <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-5">
          <!-- Row: Name + Brand -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Назва *</label
              >
              <input
                v-model="form.name"
                type="text"
                placeholder="Nike Air Max 270"
                class="w-full px-3 py-2.5 border-2 rounded-xl text-sm outline-none transition-colors"
                :class="
                  errors.name
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-orange-400'
                "
              />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">
                {{ errors.name }}
              </p>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Бренд *</label
              >
              <input
                v-model="form.brand"
                type="text"
                placeholder="Nike"
                class="w-full px-3 py-2.5 border-2 rounded-xl text-sm outline-none transition-colors"
                :class="
                  errors.brand
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-orange-400'
                "
              />
              <p v-if="errors.brand" class="text-red-500 text-xs mt-1">
                {{ errors.brand }}
              </p>
            </div>
          </div>

          <!-- Row: Price + OldPrice + Category + Gender -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Ціна ₴ *</label
              >
              <input
                v-model="form.price"
                type="number"
                min="1"
                placeholder="3999"
                class="w-full px-3 py-2.5 border-2 rounded-xl text-sm outline-none transition-colors"
                :class="
                  errors.price
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-orange-400'
                "
              />
              <p v-if="errors.price" class="text-red-500 text-xs mt-1">
                {{ errors.price }}
              </p>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Стара ціна ₴</label
              >
              <input
                v-model="form.oldPrice"
                type="number"
                min="1"
                placeholder="4999"
                class="w-full px-3 py-2.5 border-2 border-gray-200 focus:border-orange-400 rounded-xl text-sm outline-none transition-colors"
              />
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Категорія</label
              >
              <select
                v-model="form.category"
                class="w-full px-3 py-2.5 border-2 border-gray-200 focus:border-orange-400 rounded-xl text-sm outline-none transition-colors bg-white cursor-pointer"
              >
                <option
                  v-for="cat in CATEGORIES"
                  :key="cat.slug"
                  :value="cat.slug"
                >
                  {{ cat.label }}
                </option>
              </select>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Стать</label
              >
              <select
                v-model="form.gender"
                class="w-full px-3 py-2.5 border-2 border-gray-200 focus:border-orange-400 rounded-xl text-sm outline-none transition-colors bg-white cursor-pointer"
              >
                <option value="male">Чоловічі</option>
                <option value="female">Жіночі</option>
                <option value="unisex">Унісекс</option>
              </select>
            </div>
          </div>

          <!-- Image URL + preview -->
          <div>
            <label
              class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >URL зображення *</label
            >
            <div class="flex gap-3">
              <div class="flex-1">
                <input
                  v-model="form.image"
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  class="w-full px-3 py-2.5 border-2 rounded-xl text-sm outline-none transition-colors"
                  :class="
                    errors.image
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 focus:border-orange-400'
                  "
                />
                <p v-if="errors.image" class="text-red-500 text-xs mt-1">
                  {{ errors.image }}
                </p>
              </div>
              <div
                class="w-16 h-11 rounded-xl bg-gray-100 overflow-hidden border-2 border-gray-200 shrink-0"
              >
                <img
                  v-if="form.image"
                  :src="form.image + '?w=64&h=44&fit=crop'"
                  alt=""
                  class="w-full h-full object-cover"
                  @error="(e) => (e.target.src = '')"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-300 text-xl"
                >
                  🖼️
                </div>
              </div>
            </div>
          </div>

          <!-- Sizes -->
          <div>
            <label
              class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
            >
              Розміри *
              <span
                v-if="errors.sizes"
                class="text-red-500 normal-case font-normal"
                >({{ errors.sizes }})</span
              >
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="size in SIZES"
                :key="size"
                type="button"
                @click="toggleSize(size)"
                class="w-10 h-9 rounded-lg text-sm font-semibold transition-all border-2"
                :class="
                  form.sizes.includes(size)
                    ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-orange-300'
                "
              >
                {{ size }}
              </button>
            </div>
          </div>

          <!-- Colors -->
          <div>
            <label
              class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >Кольори (через кому)</label
            >
            <input
              v-model="form.colors"
              type="text"
              placeholder="Чорний, Білий, Червоний"
              class="w-full px-3 py-2.5 border-2 border-gray-200 focus:border-orange-400 rounded-xl text-sm outline-none transition-colors"
            />
          </div>

          <!-- Description -->
          <div>
            <label
              class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >Опис</label
            >
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Опис товару..."
              class="w-full px-3 py-2.5 border-2 border-gray-200 focus:border-orange-400 rounded-xl text-sm outline-none transition-colors resize-none"
            >
            </textarea>
          </div>

          <!-- Rating + Reviews -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Рейтинг (0–5)</label
              >
              <input
                v-model="form.rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="4.5"
                class="w-full px-3 py-2.5 border-2 border-gray-200 focus:border-orange-400 rounded-xl text-sm outline-none transition-colors"
              />
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
                >Кількість відгуків</label
              >
              <input
                v-model="form.reviewsCount"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-3 py-2.5 border-2 border-gray-200 focus:border-orange-400 rounded-xl text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <!-- Toggles -->
          <div class="flex flex-wrap gap-4">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <div
                @click="form.inStock = !form.inStock"
                class="w-10 h-6 rounded-full transition-colors relative"
                :class="form.inStock ? 'bg-green-500' : 'bg-gray-300'"
              >
                <div
                  class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="form.inStock ? 'left-5' : 'left-1'"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-700">В наявності</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <div
                @click="form.isNew = !form.isNew"
                class="w-10 h-6 rounded-full transition-colors relative"
                :class="form.isNew ? 'bg-blue-500' : 'bg-gray-300'"
              >
                <div
                  class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="form.isNew ? 'left-5' : 'left-1'"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-700">Новинка</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <div
                @click="form.isSale = !form.isSale"
                class="w-10 h-6 rounded-full transition-colors relative"
                :class="form.isSale ? 'bg-red-500' : 'bg-gray-300'"
              >
                <div
                  class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="form.isSale ? 'left-5' : 'left-1'"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-700">Розпродаж</span>
            </label>
          </div>

          <!-- Footer buttons -->
          <div class="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-500/25"
            >
              <span v-if="saving">Збереження…</span>
              <span v-else>{{
                isEdit ? "💾 Зберегти зміни" : "➕ Додати товар"
              }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
