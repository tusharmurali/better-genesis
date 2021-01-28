import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Login from "../components/Login.vue";
import Gradebook from "../components/Gradebook.vue";
import Assignments from "../components/Assignments.vue";
import Information from "../components/Information.vue";
import Calendar from "../components/Calendar.vue";
import store from "../store";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresGuest: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: "/gradebook",
    name: "Gradebook",
    component: Gradebook,
    meta: { requiresAuth: true },
  },
  {
    path: "/assignments/:courseId",
    name: "Assignments",
    component: Assignments,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: "/information",
    name: "Information",
    component: Information,
    meta: { requiresAuth: true },
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: Calendar,
    meta: { requiresAuth: true },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.getters.isLoggedIn) next("/login");
    else next();
  } else if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (store.getters.isLoggedIn) next("/gradebook");
    else next();
  } else {
    next();
  }
});

export default router;
