import { defineStore } from "pinia";
import { ref } from "vue";

export const useProductsStore = defineStore("products", () => {
  const products = ref([]);
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchProducts() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Помилка завантаження товарів");
      products.value = await res.json();
    } catch (e) {
      error.value =
        "Не вдалося завантажити товари. Переконайтесь, що mock-сервер запущено: npm run mock";
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      categories.value = await res.json();
    } catch (e) {
      console.error("Помилка завантаження категорій", e);
    }
  }

  async function fetchProduct(id) {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error("Товар не знайдено");
    return await res.json();
  }

  return {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    fetchProduct,
  };
});
