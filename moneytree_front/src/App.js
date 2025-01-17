import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 네비게이션 바
import NavBar from './components/Navbar'; // 파일 이름 수정

// 페이지들
import Home from './pages/nav/Home'; // 올바른 경로로 수정
import MyPage from './pages/nav/Mypage'; // 경로 수정
import RealEstate from './pages/nav/RealEstate'; // 경로 수정
import DepositSaving from './pages/nav/DepositSaving'; // 경로 수정
import InstallmentSaving from './pages/nav/InstallmentSaving'; // 경로 수정
import Fund from './pages/nav/Fund'; // 경로 수정
import Stock from './pages/nav/Stock'; // 경로 수정
import HobbyCommunity from './pages/nav/HobbyCommunity'; // 경로 수정
import RealEstateCommunity from './pages/nav/RealEstateCommunity'; // 경로 수정

function App() {
  return (
    <Router>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/realestate" element={<RealEstate />} />
        <Route path="/products/deposit-saving" element={<DepositSaving />} />
        <Route path="/products/installment-saving" element={<InstallmentSaving />} />
        <Route path="/products/fund" element={<Fund />} />
        <Route path="/products/stock" element={<Stock />} />
        <Route path="/community/hobby" element={<HobbyCommunity />} />
        <Route path="/community/real-estate" element={<RealEstateCommunity />} />
      </Routes>
    </Router>
  );
}

export default App;
