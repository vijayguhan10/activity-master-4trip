import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginComponent from "./Auth/Login";
import SignUp from "./Auth/SignUp";

import ShopDashboard from "./Shop/pages/Home/Home";
import ShopHomeContent from "./Shop/pages/Home/components/HomeContent";
import ShopProductManager from "./Shop/pages/Home/components/ProductManager";
import ShopReview from "./Shop/pages/Home/components/ShopReview";

import ActivityDashboard from "./Activity/pages/Home/Home";
import ActivityHomeContent from "./Activity/pages/Home/components/HomeContent";
import ActivityTaskManager from "./Activity/pages/Home/components/DishManager";
import ActivityBooking from "./Activity/pages/Home/components/BookingDetails";
import ActivityReview from "./Activity/pages/Home/components/ActivityReview.jsx";

import RestaurantDashboard from "./Restaurants/pages/Home/Home";
import RestaurantHomeContent from "./Restaurants/pages/Home/components/HomeContent";
import RestaurantDishManager from "./Restaurants/pages/Home/components/DishManager";
import RestaurantBooking from "./Restaurants/pages/Home/components/BookingDetails";
import RestaurantReview from "./Restaurants/pages/Home/components/RestaurantReview";

import Layout from "./Layout.jsx";
import PrivacyPolicy from "./PrivacyPolicy";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/login",
        element: <LoginComponent />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/shop",
        element: <ShopDashboard />,
        children: [
          {
            path: "",
            element: <ShopHomeContent />,
          },
          {
            path: "listing",
            element: <ShopProductManager />,
          },
          {
            path: "reviews",
            element: <ShopReview />,
          },
          {
            path: "payments",
            element: <div>Payments Component</div>,
          },
        ],
      },
      {
        path: "/activity",
        element: <ActivityDashboard />,
        children: [
          {
            path: "",
            element: <ActivityHomeContent />,
          },
          {
            path: "listing",
            element: <ActivityTaskManager />,
          },
          {
            path: "booking",
            element: <ActivityBooking />,
          },
          {
            path: "reviews",
            element: <ActivityReview />,
          },
          {
            path: "payments",
            element: <div>Payments Component</div>,
          },
        ],
      },
      {
        path: "/restaurant",
        element: <RestaurantDashboard />,
        children: [
          {
            path: "",
            element: <RestaurantHomeContent />,
          },
          {
            path: "listing",
            element: <RestaurantDishManager />,
          },
          {
            path: "booking",
            element: <RestaurantBooking />,
          },
          {
            path: "reviews",
            element: <RestaurantReview />,
          },
          {
            path: "payments",
            element: <div>Payments Component</div>,
          },
        ],
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
