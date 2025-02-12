// cookies.js
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

/**
 * 쿠키 저장 시 JSON 문자열로 변환 (stringify)
 */
export const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);

  // 항상 JSON 문자열로 저장
  const cookieValue = JSON.stringify(value);

  cookies.set(name, cookieValue, {
    path: '/',
    expires,
  });
};

/**
 * 쿠키 가져올 때 항상 JSON.parse() 적용
 */
export const getCookie = (name) => {
  const cookieValue = cookies.get(name);
  console.log('쿠키값 => ', cookieValue);
  if (!cookieValue) return null;

  try {
    return JSON.parse(cookieValue); // JSON 파싱
  } catch (error) {
    console.error('❌ 쿠키 JSON 파싱 오류:', error);
    return null;
  }
};

/**
 * 쿠키 제거 함수
 */
export const removeCookie = (name, path = '/') => {
  cookies.remove(name, { path });
};

/**
 * "member" 쿠키에서 memberId만 따로 꺼내는 함수
 * - getCookie("member")가 이미 { memberId: "xxx", ... } 형태로 파싱된 객체를 반환함
 */
export const getMemberIdFromCookie = () => {
  const memberData = getCookie('member'); // { memberId: "xxx", ... } 또는 null
  return memberData?.memberId || null;
};

/**
 * "member" 쿠키에서 memberName(혹은 닉네임)만 따로 꺼내는 함수
 * - 쿠키에 저장된 객체에서 memberName 프로퍼티를 반환합니다.
 */
export const getMemberNicknameFromCookie = () => {
  const memberData = getCookie('member'); // { memberId: "xxx", memberName: "xxx", ... } 또는 null
  return memberData?.memberName || null;
};
