// src/layouts/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/Navbar'; // 네비게이션 컴포넌트

function AppLayout() {
    return (
        <div>
            {/* 상단 네비게이션 */}
            <NavBar />
            {/* 자식 라우트가 표시될 영역 */}
            <Outlet />
        </div>
    );
}

export default AppLayout;
