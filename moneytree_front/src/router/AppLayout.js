import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const AppLayout = () => {
  const location = useLocation();

  // 로그인 페이지에서는 Navbar 숨기기
  const isLoginPage = location.pathname === "/" || location.pathname === "/login";

  return (
    <div>
      {!isLoginPage && <Navbar />}
      <Outlet />
    </div>
  );
};

export default AppLayout;
