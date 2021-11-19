const menu = () => import("../views/menu.vue");
const toast = () => import("../views/toast.vue");

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
];

export default routes;
