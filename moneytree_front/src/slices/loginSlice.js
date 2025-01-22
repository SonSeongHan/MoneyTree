import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login } from "../api/MemberAPI";
import { getCookie, removeCookie, setCookie } from "../util/cookieUtil";

// 초기 상태 정의
const initState = {
  member: null, // 로그인한 회원 정보
  isAuthenticated: false, // 로그인 상태
  error: null, // 에러 메시지
};

// 쿠키에서 멤버 정보 로드
const loadMemberFromCookie = () => {
  const memberCookie = getCookie("member");
  return memberCookie ? JSON.parse(memberCookie) : null;
};

// 비동기 로그인 요청 (Thunk)
export const loginPostAsync = createAsyncThunk(
    "login/loginPostAsync",
    async (loginData, { rejectWithValue }) => {
        try {
            const response = await login(loginData); // MemberAPI의 login 호출
            return response.data; // API 응답 데이터 반환
        } catch (error) {
            return rejectWithValue(error.response?.data || "로그인 요청 실패");
        }
    }
);

const loginSlice = createSlice({
    name: "login",
    initialState: {
        ...initState,
        member: loadMemberFromCookie(), // 쿠키에서 멤버 정보 로드
        isAuthenticated: !!loadMemberFromCookie(),
    },
    reducers: {
        logout: (state) => {
            removeCookie("member"); // 쿠키 제거
            return { ...initState };
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loginPostAsync.fulfilled, (state, action) => {
            const memberData = action.payload; // API 응답 데이터
            setCookie("member", JSON.stringify(memberData), 1); // 쿠키에 저장 (1일)
            state.member = memberData;
            state.isAuthenticated = true;
        });
    },
});


// 액션 및 리듀서 내보내기
export const { logout } = loginSlice.actions;
export default loginSlice.reducer;
