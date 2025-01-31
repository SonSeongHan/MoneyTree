import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import AppLayout from '../router/AppLayout';
import LoginPage from '../pages/member/LoginPage';
import MakeMember from '../pages/member/MakeMember';
import SimpleMakeMember from '../pages/member/SimpleMakeMember';
import MakeAccount from '../pages/member/MakeAaccount';

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
const DepositDetailPage = lazy(() => import('../pages/recommends/DepositDetailPage'));
const SavingDetailPage = lazy(() => import('../pages/recommends/SavingDetailPage'));

// ✅ 부동산 커뮤니티 관련 페이지들
const EstateCommunityList = lazy(() => import('../pages/estatecommunity/EstateCommunityList'));
const EstateCommunityDetail = lazy(() => import('../pages/estatecommunity/EstateCommunityDetail'));
const EstateCommunityForm = lazy(() => import('../pages/estatecommunity/EstateCommunityForm'));

// ✅ 부동산 관련 페이지들
const EstateSearchResult = lazy(() => import('../pages/estate/EstateSearchResult'));
const KakaoMap = lazy(() => import('../pages/estate/KakaoMap'));
const SearchDetails = lazy(() => import('../pages/estate/SearchDetails'));
const ApartmentDetails = lazy(() => import('../pages/estate/ApartmentDetails'));

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
        children: [
          {
            path: 'search',
            element: (
              <Suspense fallback={Loading}>
                <EstateSearchResult />
              </Suspense>
            ),
          },
          {
            path: 'map',
            element: (
              <Suspense fallback={Loading}>
                <KakaoMap />
              </Suspense>
            ),
          },
          {
            path: 'details/:name',
            element: (
              <Suspense fallback={Loading}>
                <SearchDetails />
              </Suspense>
            ),
          },
          {
            path: 'details/:id',
            element: (
              <Suspense fallback={Loading}>
                <ApartmentDetails />
              </Suspense>
            ),
          },
        ],
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
        path: 'deposit/:depositProductId', // 새로운 라우트 추가
        element: (
          <Suspense fallback={Loading}>
            <DepositDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'saving/:savingProductId', // 새로운 적금 상세 페이지 경로
        element: (
          <Suspense fallback={Loading}>
            <SavingDetailPage />
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
        path: 'community/hobby',
        element: (
          <Suspense fallback={Loading}>
            <HobbyCommunity />
          </Suspense>
        ),
      },
      {
        path: 'community/real-estate',
        element: (
          <Suspense fallback={Loading}>
            <RealEstateCommunity />
          </Suspense>
        ),
      },
      {
        // ✅ 부동산 커뮤니티 메인
        path: 'community/estate',
        element: (
          <Suspense fallback={Loading}>
            <EstateCommunityList />
          </Suspense>
        ),
      },
      {
        // ✅ 게시글 작성
        path: 'community/estate/new',
        element: (
          <Suspense fallback={Loading}>
            <EstateCommunityForm />
          </Suspense>
        ),
      },
      {
        // ✅ 게시글 상세보기
        path: 'community/estate/:id',
        element: (
          <Suspense fallback={Loading}>
            <EstateCommunityDetail />
          </Suspense>
        ),
      },
    ],
  },
]);

export default root;
