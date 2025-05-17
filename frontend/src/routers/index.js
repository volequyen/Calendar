import Home from "../pages/Home";

const privateRoutes = [];

const publicRoutes = [
  {
    path: "/",
    component: Home,
  },
  // Add more routes as needed
];

export { publicRoutes, privateRoutes };