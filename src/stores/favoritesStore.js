import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useFavoritesStore = defineStore("favorites", () => {
  const items = ref(
    JSON.parse(localStorage.getItem("sneakshop_favorites") || "[]"),
  );

  const total = computed(() => items.value.length);
  const ids = computed(() => items.value.map((i) => i.id));

  function toggle(product) {
    const idx = items.value.findIndex((i) => i.id === product.id);
    if (idx >= 0) {
      items.value.splice(idx, 1);
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        isSale: product.isSale,
        isNew: product.isNew,
        inStock: product.inStock,
      });
    }
    save();
  }

  function isFavorite(id) {
    return ids.value.includes(id);
  }

  function save() {
    localStorage.setItem("sneakshop_favorites", JSON.stringify(items.value));
  }

  return { items, total, ids, toggle, isFavorite };
});
