
import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import AppLayout from '../router/AppLayout';
<<<<<<< HEAD
import CommuAdd from '../pages/community/CommuAdd';
import CommuCheck from '../pages/community/CommuCheck';
=======
import LoginPage from '../pages/member/LoginPage';
import MakeMember from '../pages/member/MakeMember';
import SimpleMakeMember from '../pages/member/SimpleMakeMember';
import MakeAccount from '../pages/member/MakeAaccount';
>>>>>>> 05078882ae2d0c8fc9b24babf884ef8c9298696d

// 로딩 대체 UI
const Loading = <div>Loading...</div>;

// lazy 로딩 페이지들
const Home = lazy(() => import('../pages/nav/Home'));
const MyPage = lazy(() => import('../pages/nav/Mypage'));
const RealEstate = lazy(() => import('../pages/nav/RealEstate'));
const DepositSaving = lazy(() => import('../pages/nav/DepositSaving'));
const InstallmentSaving = lazy(() => import('../pages/nav/InstallmentSaving'));
const Fund = lazy(() => import('../pages/nav/Fund'));
const Stock = lazy(() => import('../pages/nav/Stock'));
const HobbyCommunity = lazy(() => import('../pages/nav/HobbyCommunity'));
const RealEstateCommunity = lazy(() => import('../pages/nav/RealEstateCommunity'));

// 라우트 설정
const root = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />, // 네비게이션을 포함할 레이아웃
        children: [
            {
                // '/' 경로를 들어왔을 때 첫 화면
                index: true,
                element: (
                    <Suspense fallback={Loading}>
                        <LoginPage />
                    </Suspense>
                ),
            },
            {
                path: 'home',
                element: (
                  <Suspense fallback={Loading}>
                      <Home />
                  </Suspense>
                ),
            },
            {
                path: 'make-account',
                element: (
                  <Suspense fallback={Loading}>
                      <MakeAccount />
                  </Suspense>
                ),
            },
            {
                path: 'member/full/make',
                element: (
                  <Suspense fallback={Loading}>
                      <MakeMember />
                  </Suspense>
                ),
            },
            {
                path: 'member/simple/make',
                element: (
                  <Suspense fallback={Loading}>
                      <SimpleMakeMember />
                  </Suspense>
                ),
            },
            {
                path: 'mypage',
                element: (
                    <Suspense fallback={Loading}>
                        <MyPage />
                    </Suspense>
                ),
            },
            {
                path: 'realestate',
                element: (
                    <Suspense fallback={Loading}>
                        <RealEstate />
                    </Suspense>
                ),
            },
            {
                path: 'products/deposit-saving',
                element: (
                    <Suspense fallback={Loading}>
                        <DepositSaving />
                    </Suspense>
                ),
            },
            {
                path: 'products/installment-saving',
                element: (
                    <Suspense fallback={Loading}>
                        <InstallmentSaving />
                    </Suspense>
                ),
            },
            {
                path: 'products/fund',
                element: (
                    <Suspense fallback={Loading}>
                        <Fund />
                    </Suspense>
                ),
            },
            {
                path: 'products/stock',
                element: (
                    <Suspense fallback={Loading}>
                        <Stock />
                    </Suspense>
                ),
            },
            {
                path: '/community/hobby',
                element: (
                    <Suspense fallback={Loading}>
                        <HobbyCommunity />
                    </Suspense>
                ),
            },
            {
                path: 'community/hobby/add',
                element: (
                  <Suspense fallback={Loading}>
                      <CommuAdd />
                  </Suspense>
                )
            },
            {
                path: 'community/check/:id',
                element: (
                  <Suspense fallback={Loading}>
                      <CommuCheck />
                  </Suspense>
                )
            },
            {
                path: 'community/real-estate',
                element: (
                    <Suspense fallback={Loading}>
                        <RealEstateCommunity />
                    </Suspense>
                ),
            },
        ],
    },
]);

export default root;
