import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import ProductPage from "../pages/ProductPage.vue";
import FavoritesPage from "../pages/FavoritesPage.vue";
import AdminPage from "../pages/AdminPage.vue";
import AdminLoginPage from "../pages/AdminLoginPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import ProfilePage from "../pages/ProfilePage.vue";

const routes = [
  { path: "/", name: "home", component: HomePage },
  { path: "/product/:id", name: "product", component: ProductPage },
  { path: "/favorites", name: "favorites", component: FavoritesPage },
  { path: "/login", name: "login", component: LoginPage },
  {
    path: "/profile",
    name: "profile",
    component: ProfilePage,
    meta: { requiresUser: true },
  },
  { path: "/admin/login", name: "admin-login", component: AdminLoginPage },
  {
    path: "/admin",
    name: "admin",
    component: AdminPage,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0, behavior: "smooth" }),
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const isAuth = localStorage.getItem("sneakshop_admin") === "true";
    if (!isAuth) {
      return { name: "admin-login" };
    }
  }
  if (to.meta.requiresUser) {
    const user = localStorage.getItem("sneakshop_user");
    if (!user) {
      return { name: "login" };
    }
  }
  // Якщо вже авторизований адмін — не пускати на сторінку адмін входу
  if (to.name === "admin-login") {
    const isAuth = localStorage.getItem("sneakshop_admin") === "true";
    if (isAuth) {
      return { name: "admin" };
    }
  }
  // Якщо вже залогінений користувач — не пускати на сторінку логіну
  if (to.name === "login") {
    const user = localStorage.getItem("sneakshop_user");
    if (user) {
      return { name: "profile" };
    }
  }
});

export default router;
