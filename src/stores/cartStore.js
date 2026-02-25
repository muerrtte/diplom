import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCartStore = defineStore("cart", () => {
  const items = ref(JSON.parse(localStorage.getItem("sneakshop_cart") || "[]"));
  const isOpen = ref(false);

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  function addItem(product, size) {
    const existing = items.value.find(
      (i) => i.id === product.id && i.size === size,
    );
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        size,
        quantity: 1,
      });
    }
    save();
    isOpen.value = true;
  }

  function removeItem(id, size) {
    items.value = items.value.filter((i) => !(i.id === id && i.size === size));
    save();
  }

  function updateQuantity(id, size, qty) {
    const item = items.value.find((i) => i.id === id && i.size === size);
    if (item) {
      if (qty <= 0) removeItem(id, size);
      else item.quantity = qty;
      save();
    }
  }

  function clearCart() {
    items.value = [];
    save();
  }

  function save() {
    localStorage.setItem("sneakshop_cart", JSON.stringify(items.value));
  }

  return {
    items,
    isOpen,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
});
