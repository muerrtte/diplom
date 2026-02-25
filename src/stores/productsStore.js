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

  async function addProduct(data) {
    const newId = Math.max(0, ...products.value.map((p) => p.id)) + 1;
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, id: newId }),
    });
    if (!res.ok) throw new Error("Помилка збереження товару");
    const created = await res.json();
    products.value.push(created);
    return created;
  }

  async function updateProduct(data) {
    const res = await fetch(`/api/products/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Помилка оновлення товару");
    const updated = await res.json();
    const idx = products.value.findIndex((p) => p.id === updated.id);
    if (idx >= 0) products.value[idx] = updated;
    return updated;
  }

  async function deleteProduct(id) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Помилка видалення товару");
    products.value = products.value.filter((p) => p.id !== id);
  }

  async function decreaseStock(productId, quantity) {
    // Отримати поточний товар
    const res = await fetch(`/api/products/${productId}`);
    if (!res.ok) return;
    const product = await res.json();

    const currentStock = product.stock ?? 0;
    const newStock = Math.max(0, currentStock - quantity);
    const newInStock = newStock > 0;

    const patchRes = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock, inStock: newInStock }),
    });
    if (!patchRes.ok) return;
    const updated = await patchRes.json();

    // Оновити локальний стан
    const idx = products.value.findIndex((p) => p.id === productId);
    if (idx >= 0) products.value[idx] = updated;
    return updated;
  }

  return {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    fetchProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    decreaseStock,
  };
});
