import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import ProductPage from "../pages/ProductPage.vue";
import FavoritesPage from "../pages/FavoritesPage.vue";
import AdminPage from "../pages/AdminPage.vue";

const routes = [
  { path: "/", name: "home", component: HomePage },
  { path: "/product/:id", name: "product", component: ProductPage },
  { path: "/favorites", name: "favorites", component: FavoritesPage },
  { path: "/admin", name: "admin", component: AdminPage },
];

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0, behavior: "smooth" }),
});
