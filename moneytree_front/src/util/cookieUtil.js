import { Cookies } from "react-cookie";

const cookies = new Cookies();

/**
 * ✅ 쿠키 저장 시 JSON 문자열로 변환 (stringify)
 */
export const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);

  // 항상 JSON 문자열로 저장
  const cookieValue = JSON.stringify(value);

  cookies.set(name, cookieValue, {
    path: "/",
    expires,
  });
};

/**
 * ✅ 쿠키 가져올 때 항상 JSON.parse() 적용
 */
export const getCookie = (name) => {
  const cookieValue = cookies.get(name);
  console.log("쿠키값:{}",cookieValue);
  if (!cookieValue) return null;

  try {
    return JSON.parse(cookieValue); // JSON 파싱 적용
  } catch (error) {
    console.error("❌ 쿠키 JSON 파싱 오류:", error);
    return null;
  }
};

/**
 * ✅ 쿠키 제거 함수
 */
export const removeCookie = (name, path = "/") => {
  cookies.remove(name, { path });
};

/**
 * ✅ "member" 쿠키에서 memberId 가져오는 함수 (JSON.parse() 적용됨)
 */
export const getMemberIdFromCookie = () => {
  const raw = getCookie("member"); // 이미 JSON 객체로 변환됨
  return raw?.memberId || null;
};
