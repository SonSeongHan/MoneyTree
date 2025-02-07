import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import AppLayout from "../router/AppLayout";
import LoginPage from "../pages/member/LoginPage";
import MakeMember from "../pages/member/MakeMember";
import SimpleMakeMember from "../pages/member/SimpleMakeMember";
import MakeAccount from "../pages/member/MakeAaccount";
import AccountManagement from "../components/AccountManagement";
import AllManagement from "../pages/nav/AllManagement";
import ChangeName from "../components/ChangeName";
import MakeCertificate from "../components/MakeCertigicate";
import CommuUpdate from '../pages/community/CommuUpdate';
import CommuReply from '../pages/community/CommuReply';
import CommuAdd from '../pages/community/CommuAdd';
import CommuCheck from '../pages/community/CommuCheck';
import MainHome from "../components/MainHome";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminPage from "../pages/admin/AdminPage";
import MemberDetailPage from "../pages/admin/MemberDetailPage";

// 로딩 대체 UI
const Loading = <div>Loading...</div>;

// lazy 로딩 페이지들
const Home = lazy(() => import('../pages/nav/Home'));
const MyPage = lazy(() => import('../pages/nav/Mypage'));
const RealEstate = lazy(() => import('../pages/nav/RealEstate'));
const DepositSaving = lazy(() => import('../pages/nav/DepositSaving'));
const FundStock = lazy(() => import('../pages/nav/FundStock'));
const Fund = lazy(() => import('../pages/nav/Fund'));
const Stock = lazy(() => import('../pages/nav/Stock'));
const HobbyCommunity = lazy(() => import('../pages/nav/HobbyCommunity'));
const DepositDetailPage = lazy(() => import('../pages/recommends/DepositDetailPage'));
const SavingDetailPage = lazy(() => import('../pages/recommends/SavingDetailPage'));

const RealEstateCommunity = lazy(() => import("../pages/nav/RealEstateCommunity"));
const EstateCommunityList = lazy(() => import('../pages/estatecommunity/EstateCommunityList'));
const EstateCommunityDetail = lazy(() => import('../pages/estatecommunity/EstateCommunityDetail'));
const EstateCommunityForm = lazy(() => import('../pages/estatecommunity/EstateCommunityForm'));

const EstateSearchResult = lazy(() => import('../pages/estate/EstateSearchResult'));
const KakaoMap = lazy(() => import('../pages/estate/KakaoMap'));
const SearchDetails = lazy(() => import('../pages/estate/SearchDetails'));
const ApartmentDetails = lazy(() => import('../pages/estate/ApartmentDetails'));

const root = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <MainHome />
          </Suspense>
        ),
      },
      {
        path: "loginpage",
        element: (
            <Suspense fallback={Loading}>
              <LoginPage />
            </Suspense>
        ),
      },
      {
        path: "admin",
        element: (
            <Suspense fallback={Loading}>
              <AdminLogin />
            </Suspense>
        ),
      },
      {
        path: "admin/page",
        element: (
            <Suspense fallback={Loading}>
              <AdminPage />
            </Suspense>
        ),
      },
      {
        path: "/admin/members/:memberId",
        element: (
            <Suspense fallback={Loading}>
              <MemberDetailPage />
            </Suspense>
        ),
      },
      {
        path: "home",
        element: (
          <Suspense fallback={Loading}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "make-account",
        element: (
          <Suspense fallback={Loading}>
            <MakeAccount />
          </Suspense>
        ),
      },
      {
        path: "member/full/make",
        element: (
          <Suspense fallback={Loading}>
            <MakeMember />
          </Suspense>
        ),
      },
      {
        path: "member/simple/make",
        element: (
          <Suspense fallback={Loading}>
            <SimpleMakeMember />
          </Suspense>
        ),
      },
      {
        path: "change-password",
        element: (
          <Suspense fallback={Loading}>
            <AccountManagement />
          </Suspense>
        ),
      },
      {
        path: "reissue-certificate",
        element: (
          <Suspense fallback={Loading}>
            <MakeCertificate />
          </Suspense>
        ),
      },
      {
        path: "change-name",
        element: (
          <Suspense fallback={Loading}>
            <ChangeName />
          </Suspense>
        ),
      },
      {
        path: "allmanagement",
        element: (
          <Suspense fallback={Loading}>
            <AllManagement />
          </Suspense>
        ),
      },
      {
        path: "mypage",
        element: (
          <Suspense fallback={Loading}>
            <MyPage />
          </Suspense>
        ),
      },
      {
        path: "products/deposit-saving",
        element: (
          <Suspense fallback={Loading}>
            <DepositSaving />
          </Suspense>
        ),
      },
      {
        path: "deposit/:depositProductId",
        element: (
          <Suspense fallback={Loading}>
            <DepositDetailPage />
          </Suspense>
        ),
      },
      {
        path: "saving/:savingProductId",
        element: (
          <Suspense fallback={Loading}>
            <SavingDetailPage />
          </Suspense>
        ),
      },
      {
        path: "products/fund-stock",
        element: (
          <Suspense fallback={Loading}>
            <FundStock />
          </Suspense>
        ),
      },
      {
        path: "products/fund",
        element: (
          <Suspense fallback={Loading}>
            <Fund />
          </Suspense>
        ),
      },
      {
        path: "products/stock",
        element: (
          <Suspense fallback={Loading}>
            <Stock />
          </Suspense>
        ),
      },
      {
        path: "realestate",
        element: (
          <Suspense fallback={Loading}>
            <RealEstate />
          </Suspense>
        ),
        children: [
          {
            path: "search",
            element: (
              <Suspense fallback={Loading}>
                <EstateSearchResult />
              </Suspense>
            ),
          },
          {
            path: "map",
            element: (
              <Suspense fallback={Loading}>
                <KakaoMap />
              </Suspense>
            ),
          },
          {
            path: "details/:name",
            element: (
              <Suspense fallback={Loading}>
                <SearchDetails />
              </Suspense>
            ),
          },
          {
            path: "details/:id",
            element: (
              <Suspense fallback={Loading}>
                <ApartmentDetails />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "community/hobby",
        element: (
          <Suspense fallback={Loading}>
            <HobbyCommunity />
          </Suspense>
        ),
      },
      {
        path: "community/real-estate",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={Loading}>
                <EstateCommunityList />
              </Suspense>
            ),
          },
          {
            path: "new",
            element: (
              <Suspense fallback={Loading}>
                <EstateCommunityForm />
              </Suspense>
            ),
          },
          {
            path: ":id",
            element: (
              <Suspense fallback={Loading}>
                <EstateCommunityDetail />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "community/check/:postId",
        element: (
          <Suspense fallback={Loading}>
            <CommuCheck />
          </Suspense>
        ),
        children: [
          {
            path: "replies",
            element: (
              <Suspense fallback={Loading}>
                <CommuReply />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "community/update/:postId",
        element: (
          <Suspense fallback={Loading}>
            <CommuUpdate />
          </Suspense>
        ),
      },
      {
        path: "community/:type/add",
        element: (
          <Suspense fallback={Loading}>
            <CommuAdd />
          </Suspense>
        ),
      },
      {
        path: "community/estate",
        element: <Navigate to="/community/real-estate" replace />,
      },
    ],
  },

  {
    path: 'community/real_estate',
    element: <Navigate to="/community/real-estate" replace />,
  },
]);

export default root;
