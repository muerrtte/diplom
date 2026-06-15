import { defineStore } from "pinia";
import { ref } from "vue";

export const useOrdersStore = defineStore("orders", () => {
  const orders = ref([]);
  const loading = ref(false);

  async function fetchOrders() {
    loading.value = true;
    try {
      const res = await fetch("/api/orders?_sort=createdAt&_order=desc");
      if (!res.ok) throw new Error("Помилка завантаження замовлень");
      orders.value = await res.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserOrders(userId) {
    const res = await fetch(
      `/api/orders?userId=${userId}&_sort=createdAt&_order=desc`,
    );
    if (!res.ok) throw new Error("Помилка завантаження замовлень");
    return await res.json();
  }

  async function createOrder(orderData) {
    const payload = {
      ...orderData,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    if (payload.userId == null) {
      delete payload.userId;
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Помилка створення замовлення");
    return await res.json();
  }

  async function updateOrderStatus(id, status) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Помилка оновлення статусу");
    const updated = await res.json();
    const idx = orders.value.findIndex((o) => o.id === id);
    if (idx >= 0) orders.value[idx] = updated;
    return updated;
  }

  async function fetchAllUsers() {
    const res = await fetch("/api/users");
    if (!res.ok) throw new Error("Помилка завантаження користувачів");
    return await res.json();
  }

  return {
    orders,
    loading,
    fetchOrders,
    fetchUserOrders,
    createOrder,
    updateOrderStatus,
    fetchAllUsers,
  };
});
