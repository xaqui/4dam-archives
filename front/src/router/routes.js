const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/HomePage.vue"),
        name: "Home",
      },
      {
        path: "/about",
        component: () => import("pages/AboutPage.vue"),
        name: "About",
      },
      {
        path: "/profile",
        component: () => import("pages/ProfilePage.vue"),
        name: "People",
      },
      {
        path: "/settings",
        component: () => import("pages/SettingsPage.vue"),
        name: "Settings",
      },
      {
        path: "/ranking",
        component: () => import("pages/RankingPage.vue"),
        name: "Ranking",
      },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
