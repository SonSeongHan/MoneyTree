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
  cookies.set(name, value, { path: "/", expires: expires, httpOnly: false }); // httpOnly 설정 변경 가능
  console.log(`쿠키 설정: ${name} = ${value}, 만료일: ${expires}`);
};

// 나머지 함수들 동일
export const getCookie = (name) => {
  const value = cookies.get(name);
  console.log(`쿠키 가져오기: ${name} = ${value}`);
  return value;
};

export const removeCookie = (name, path = "/") => {
  cookies.remove(name, { path });
  console.log(`쿠키 삭제: ${name}`);
};

// member_id 추출 및 저장 함수들 동일
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
