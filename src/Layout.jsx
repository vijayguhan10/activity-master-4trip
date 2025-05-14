import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Shop/pages/Home/components/Footer";
const Layout = () => (
  <div className="flex flex-col min-h-screen bg-white text-black">
    <div className="flex-1">
      <Outlet />
    </div>
    <Footer />
  </div>
);

export default Layout;
