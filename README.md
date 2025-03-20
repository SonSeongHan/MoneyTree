Spring Boot, React, Python을 활용한 자산관리 사이트

## 프로젝트 소개
개인 자산을 관리해주며 향상된 라이프를 위한 취미 추천을 해주는 사이트를 구현

## 개발 기간

- 25.01.14(화) ~ 25.02.28(금)

---
### 맴버
<table>
  <tr>
    <td align="center"><a href="https://github.com/SonSeongHan"><img src="https://avatars.githubusercontent.com/SonSeongHan" width="100px;" alt=""/><br /><sub><b>SonSeongHan</b></sub></a></td>
    <td align="center"><a href="https://github.com/arfwaq"><img src="https://avatars.githubusercontent.com/arfwaq" width="100px;" alt=""/><br /><sub><b>arfwaq</b></sub></a></td>
    <td align="center"><a href="https://github.com/sau2120"><img src="https://avatars.githubusercontent.com/sau2120" width="100px;" alt=""/><br /><sub><b>sau2120</b></sub></a></td>
    <td align="simjoungmin"><a href="https://github.com/simjoungmin"><img src="https://avatars.githubusercontent.com/simjoungmin" width="100px;" alt=""/><br /><sub><b>simjoungmin</b></sub></a></td>
  </tr>
</table>

---

### 역할 분담
#### 각 팀원들은 풀스택 기반으로 역할을 수행함
손성한 (팀장)
- 프로젝트 전체 감독 관리
- 예금, 적금, 펀드, 주식 상품 받아오기
- 금융 상품 crud, 가입 상품 차트화
- refreshToken 수정

신승훈
- 커뮤니티 CRUD, 회원마다 권한 설정
- 커뮤니티 첨부 파일(썸네일, 사진)
- 파이썬을 이용한 챗봇(with OpenAPI)
- 문서 작업

유재혁
- 부동산 데이터 csv 파일로 받아오기
- 카카오맵을 이용한 단지명, 도로명주소 검색
- 회원마다 아파트 관심 매물 구현
- 회원 간 매물 거래 및 대출 구현

심정민
- 프로젝트 기본 페이지 제작
- 회원가입, 로그인, 인증서, 계좌생성
- 회원 간 송금
- 취미 페이지 구현

---

### 개발환경
- 언어 : <img src="https://img.shields.io/badge/java-007396?style=for-the-badge&logo=java&logoColor=white"> 
- 개발 도구 :  <img src="https://img.shields.io/badge/springboot-6DB33F?style=for-the-badge&logo=spring&logoColor=white">, <img src="https://img.shields.io/badge/springsecurity-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white">, <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"> , <img src="https://img.shields.io/badge/redux-764ABC?style=for-the-badge&logo=redux&logoColor=black"> , <img src="https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white"> , 
<img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white">, <img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white">
- IDE : <img src="https://img.shields.io/badge/intellijidea-000000?style=for-the-badge&logo=intellijidea&logoColor=black">
- 운영 체제 : Windows
- Java SDK : Oracle JDK 17

---

## ERD
![Image](https://github.com/user-attachments/assets/10b9af21-323f-4d2c-88c4-d9a1ed1be82f)

---
## 계층 구조
![Image](https://github.com/user-attachments/assets/47bd6dab-7ce0-452e-ab39-3eaa824bd387

---
## 시연영상
https://youtu.be/yb3UNODF6ZQ

---
## 주요 기능

#### 반응형
- 사이트에 각 버전에 맞춰 PC, 테블렛, 모바일 3개로 나누어 구현
![Image](https://github.com/user-attachments/assets/3cc7234d-907b-41ac-b4b4-97c80d513850)
#

#### 회원
- 회원 가입 후 로그인 시 쿠키에 accesstoken 저장
- 해당 token값으로 권한 조정
![Image](https://github.com/user-attachments/assets/f5525cf4-38b6-4b43-8fcc-0372c07d188c)
![Image](https://github.com/user-attachments/assets/a04cc6c8-b02f-483c-88f7-71558c544dfb)
![Image](https://github.com/user-attachments/assets/12af9652-48ff-4fa6-b17a-5fd374f5ad62)
![Image](https://github.com/user-attachments/assets/f3b4e7ef-363c-475e-889c-ffcf764bd7e8)
#

#### 상품 가입
- 예금/적금/펀드/주식 상품 가입 또는 구매
- 해당 회원에게만 적용되어서 저장
![Image](https://github.com/user-attachments/assets/5167c40c-37d8-4d73-8a4c-f997dca88661)
![Image](https://github.com/user-attachments/assets/7ec6b9a2-7030-47a8-96f4-45c601efaff3)
![Image](https://github.com/user-attachments/assets/21ac1629-5520-43c8-a279-204000e2b585)
![Image](https://github.com/user-attachments/assets/f0448ac4-a5da-4d96-88f9-326fe72353ed)
#

#### 챗봇
- OPEN API를 활용한 챗봇 구현
- DB의 값을 토대로 유저들과의 원활한 소통 구현
- 음성 인식으로 채팅없이 소통 구현
![image](https://github.com/user-attachments/assets/c41d1989-7ef5-468f-9d1b-ece12e0c5c9f)
![image](https://github.com/user-attachments/assets/a4059dd8-ee32-4b73-b27f-5d4d54b9f64f)
![image](https://github.com/user-attachments/assets/ea1d1ad7-d49c-4b1a-9f13-b13f985891ba)
![챗봇](https://github.com/user-attachments/assets/19f40a74-fb79-4700-9aff-e618a33529fb)
#

#### 부동산
- 회원들간의 부동산 매물 거래 / 대출 상품 확인 가능
- 부동산 매물값 확인
![image](https://github.com/user-attachments/assets/52b1fc85-82cf-4765-b660-1433cd4c7ca8)
![image](https://github.com/user-attachments/assets/83a3db51-f4bc-48e2-b71e-26e5962531b4)
#

#### 커뮤니티
- 회원들간의 커뮤니티 공간 구현
- 파일 업로드 가능, 회원들의 고유 crud 구현
![image](https://github.com/user-attachments/assets/6e9d6609-6e09-4c72-86ad-05c3928313bb)
![image](https://github.com/user-attachments/assets/57f9bcc1-586d-45df-9d16-d94042a5372c)
#






