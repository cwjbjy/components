const menu = () => import("../views/menu.vue");
const toast = () => import("../views/toast.vue");
const waterfall = () => import("../views/waterfall.vue");

const routes = [
  {
    path: "/",
    redirect: "/menu",
  },
  {
    path: "/menu",
    component: menu,
  },
  {
    path: "/toast",
    component: toast,
  },
  {
    path: "/waterfall",
    component: waterfall,
  },
];

export default routes;
