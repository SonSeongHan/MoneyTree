import { Cookies } from "react-cookie";

const cookies = new Cookies();

// 쿠키 설정
export const setCookie = (name, value, days) => {
  if (!name) {
    console.error("쿠키 이름이 정의되지 않았습니다.");
    return;
  }
  if (value === undefined) {
    console.error(`쿠키 값이 정의되지 않았습니다. 이름: ${name}`);
    return;
  }

  const expires = new Date();
  expires.setUTCDate(expires.getUTCDate() + days); // 보관 기한 설정

  // 객체 데이터를 JSON 문자열로 변환
  const serializedValue = typeof value === "object" ? JSON.stringify(value) : value;

  cookies.set(name, serializedValue, { path: "/", expires: expires, httpOnly: false });
  console.log(`쿠키 설정: ${name} = ${serializedValue}, 만료일: ${expires}`);
};

// 쿠키 가져오기
export const getCookie = (name) => {
  const value = cookies.get(name);
  console.log(`쿠키 가져오기: ${name} = ${value}`);

  // JSON 문자열인지 확인하고 반환
  if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
    try {
      return JSON.parse(value); // JSON으로 파싱 후 반환
    } catch (error) {
      console.error("JSON 파싱 오류:", error);
    }
  }
  return value; // JSON이 아니면 그대로 반환
};

// 쿠키 삭제
export const removeCookie = (name, path = "/") => {
  cookies.remove(name, { path });
  console.log(`쿠키 삭제: ${name}`);
};

// member_id 추출 및 저장 함수들
export const getMemberIdFromCookie = (cookieName) => {
  const cookieValue = getCookie(cookieName);
  try {
    const parsedCookie = typeof cookieValue === "string" ? JSON.parse(cookieValue) : cookieValue;
    return parsedCookie?.member_id || null;
  } catch (error) {
    console.error("Failed to parse cookie:", error);
    return null;
  }
};

export const saveMemberIdToCookie = (memberId, days = 7) => {
  try {
    const cookieData = JSON.stringify({ member_id: memberId });
    setCookie("memberInfo", cookieData, days);
    console.log("Member ID saved to cookie:", memberId);
  } catch (error) {
    console.error("Failed to save member ID to cookie:", error);
  }
};
