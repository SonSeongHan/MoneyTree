import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';

const AppLayout = () => {
  const location = useLocation();

  // 네브바를 숨기고 싶은 경로 배열
  const hideNavbarRoutes = ['/loginpage', '/allmanagement'];

  // 현재 경로가 hideNavbarRoutes에 포함되면 true
  const isNavbarHidden = hideNavbarRoutes.includes(location.pathname);

  return (
    <div>
      {!isNavbarHidden && <Navbar />}
      <Chatbot />
      <Outlet />
    </div>
  );
};

export default AppLayout;
