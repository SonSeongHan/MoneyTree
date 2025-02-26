package com.moneytree_back.util;

import com.moneytree_back.domain.Hobby;
import com.moneytree_back.repository.HobbyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final HobbyRepository hobbyRepository;

    public DataInitializer(HobbyRepository hobbyRepository) {
        this.hobbyRepository = hobbyRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (hobbyRepository.count() == 0) {

            // ===========================
            // [기술/교육] 카테고리 (기존 10개 + 추가 2개)
            // ===========================
            hobbyRepository.save(new Hobby(
                    "비행기 자격증",
                    new BigDecimal("5000000"),
                    "비행기 자격증 취득을 위한 정보 및 커뮤니티를 제공합니다.",
                    "기술/교육",
                    "https://www.faa.gov/licenses_certificates/pilot_certification/"
            ));
            hobbyRepository.save(new Hobby(
                    "코딩",
                    new BigDecimal("100000"),
                    "프로그래밍, 최신 기술 동향, 코드 리뷰 및 토론을 위한 방입니다.",
                    "기술/교육",
                    "https://www.freecodecamp.org/"
            ));
            hobbyRepository.save(new Hobby(
                    "자동차",
                    new BigDecimal("500000"),
                    "자동차 관련 뉴스, 리뷰 및 모임 정보를 나누는 방입니다.",
                    "기술/교육",
                    "https://www.caranddriver.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "드론 조종",
                    new BigDecimal("3000000"),
                    "드론 조종 및 촬영 기술을 배우는 방입니다.",
                    "기술/교육",
                    "https://www.dronefly.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "3D 프린팅",
                    new BigDecimal("2000000"),
                    "3D 프린팅 기법 및 창작 활동을 공유하는 방입니다.",
                    "기술/교육",
                    "https://www.3dprinting.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "VR/AR 교육",
                    new BigDecimal("1500000"),
                    "가상현실 및 증강현실 기술 교육 및 체험을 위한 방입니다.",
                    "기술/교육",
                    "https://www.oculus.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "IT 자격증",
                    new BigDecimal("1000000"),
                    "IT 관련 자격증 준비 및 정보 공유 방입니다.",
                    "기술/교육",
                    "https://www.comptia.org/"
            ));
            hobbyRepository.save(new Hobby(
                    "로봇 공학",
                    new BigDecimal("500000"),
                    "로봇 공학 기초 및 프로젝트 정보를 나누는 방입니다.",
                    "기술/교육",
                    "https://www.robotics.org/"
            ));
            hobbyRepository.save(new Hobby(
                    "디자인 교육",
                    new BigDecimal("10000"),
                    "디자인 기법 및 교육 정보를 공유하는 방입니다.",
                    "기술/교육",
                    "https://www.adobe.com/creativecloud.html"
            ));
            hobbyRepository.save(new Hobby(
                    "데이터 사이언스",
                    new BigDecimal("1000000"),
                    "데이터 분석 및 머신러닝 관련 정보 공유 방입니다.",
                    "기술/교육",
                    "https://www.datasciencecentral.com/"
            ));
            // 추가 [기술/교육]
            hobbyRepository.save(new Hobby(
                    "드론 프로그래밍",
                    new BigDecimal("3500000"),
                    "드론의 프로그래밍 및 자동 제어에 관한 정보를 공유합니다.",
                    "기술/교육",
                    "https://www.dji.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "사물인터넷(IoT) 기초",
                    new BigDecimal("1000000"),
                    "IoT 기초 교육 및 프로젝트 정보를 나누는 방입니다.",
                    "기술/교육",
                    "https://www.iotforall.com/"
            ));

            // ===========================
            // [프리미엄] 카테고리 (기존 5개 + 추가 7개)
            // ===========================
            hobbyRepository.save(new Hobby(
                    "고급 악기",
                    new BigDecimal("3000000"),
                    "고급 악기 수집 및 연주 정보를 공유하는 방입니다.",
                    "프리미엄",
                    "https://www.roland.com/global/"
            ));
            hobbyRepository.save(new Hobby(
                    "요트",
                    new BigDecimal("10000000"),
                    "요트 관련 정보, 크루 모임 및 레저 활동을 공유하는 방입니다.",
                    "프리미엄",
                    "https://www.yachtworld.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "명품 여행",
                    new BigDecimal("500000"),
                    "고급 명품 여행 정보 및 체험을 공유하는 방입니다.",
                    "프리미엄",
                    "https://www.luxurytravelmagazine.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "럭셔리 클럽",
                    new BigDecimal("7000000"),
                    "럭셔리 클럽 회원 전용 정보 및 모임을 위한 방입니다.",
                    "프리미엄",
                    "https://www.luxurytraveladvisor.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "VIP 이벤트",
                    new BigDecimal("8000000"),
                    "VIP 전용 이벤트 및 네트워킹 정보를 공유하는 방입니다.",
                    "프리미엄",
                    "https://www.vipticket.com/"
            ));
            // 추가 [프리미엄]
            hobbyRepository.save(new Hobby(
                    "럭셔리 요트 체험",
                    new BigDecimal("12000000"),
                    "최상급 요트 체험 및 프라이빗 모임 정보를 제공합니다.",
                    "프리미엄",
                    "https://www.superyachtcharterfleet.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "프리미엄 골프 클럽",
                    new BigDecimal("8000000"),
                    "프리미엄 골프 클럽 회원 전용 혜택과 모임 정보를 공유합니다.",
                    "프리미엄",
                    "https://www.pga.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "고급 와인 시음회",
                    new BigDecimal("2500000"),
                    "고급 와인 시음 및 추천, 와인 모임 정보를 나누는 방입니다.",
                    "프리미엄",
                    "https://www.winemag.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "프리미엄 스파 체험",
                    new BigDecimal("4000000"),
                    "럭셔리 스파 체험 및 휴식 정보를 공유하는 방입니다.",
                    "프리미엄",
                    "https://www.spafinder.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "명품 쇼핑 투어",
                    new BigDecimal("3500000"),
                    "명품 쇼핑 투어 및 브랜드 정보를 나누는 방입니다.",
                    "프리미엄",
                    "https://www.luxurycloset.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "VIP 콘서트",
                    new BigDecimal("8000000"),
                    "VIP 콘서트 티켓 및 독점 정보를 제공하는 방입니다.",
                    "프리미엄",
                    "https://www.vipticket.com/concerts/"
            ));
            hobbyRepository.save(new Hobby(
                    "프리미엄 미식 체험",
                    new BigDecimal("4500000"),
                    "고급 레스토랑 및 미식 체험 정보를 공유하는 방입니다.",
                    "프리미엄",
                    "https://www.luxurytraveladvisor.com/food-wine"
            ));

            // ===========================
            // [수집/명품] 카테고리 (기존 7개 + 추가 5개)
            // ===========================
            hobbyRepository.save(new Hobby(
                    "골동품 수집",
                    new BigDecimal("2000000"),
                    "희귀 골동품 및 수집품 정보를 공유하는 방입니다.",
                    "수집/명품",
                    "https://www.antiquetrader.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "와인 감상",
                    new BigDecimal("2000000"),
                    "와인 리뷰, 추천 및 와인 관련 모임을 위한 방입니다.",
                    "수집/명품",
                    "https://www.winemag.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "보석 수집",
                    new BigDecimal("3000000"),
                    "귀금속 및 보석 수집 정보를 나누는 방입니다.",
                    "수집/명품",
                    "https://www.gemstone.org/"
            ));
            hobbyRepository.save(new Hobby(
                    "시계 수집",
                    new BigDecimal("3000000"),
                    "명품 시계 리뷰, 추천 및 시계 수집 정보를 공유하는 방입니다.",
                    "수집/명품",
                    "https://www.hodinkee.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "명품 컬렉션",
                    new BigDecimal("4000000"),
                    "명품 패션, 액세서리, 브랜드 정보 및 컬렉션을 공유하는 방입니다.",
                    "수집/명품",
                    "https://www.luxuryfacts.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "고급 자동차 컬렉션",
                    new BigDecimal("5000000"),
                    "럭셔리 자동차 및 클래식카 컬렉션을 공유하는 방입니다.",
                    "수집/명품",
                    "https://www.supercars.net/"
            ));
            hobbyRepository.save(new Hobby(
                    "한정판 제품",
                    new BigDecimal("3000000"),
                    "한정판 제품 및 컬렉터 아이템 정보를 공유하는 방입니다.",
                    "수집/명품",
                    "https://www.limitededitionstore.com/"
            ));
            // 추가 [수집/명품]
            hobbyRepository.save(new Hobby(
                    "희귀 우표 수집",
                    new BigDecimal("1500000"),
                    "희귀 우표 및 관련 수집 정보를 나누는 방입니다.",
                    "수집/명품",
                    "https://www.stampworld.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "고급 도자기 수집",
                    new BigDecimal("1800000"),
                    "전통 및 현대 도자기 수집 정보를 공유하는 방입니다.",
                    "수집/명품",
                    "https://www.ceramicartsnetwork.org/"
            ));
            hobbyRepository.save(new Hobby(
                    "빈티지 카메라 수집",
                    new BigDecimal("2200000"),
                    "빈티지 카메라 및 촬영 도구 수집 정보를 나누는 방입니다.",
                    "수집/명품",
                    "https://www.vintagecamera.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "명품 핸드백 수집",
                    new BigDecimal("3500000"),
                    "명품 핸드백 및 패션 소품 수집 정보를 공유하는 방입니다.",
                    "수집/명품",
                    "https://www.luxuryhandbags.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "한정판 스니커즈 수집",
                    new BigDecimal("2000000"),
                    "한정판 스니커즈 및 스트리트 패션 수집 정보를 나누는 방입니다.",
                    "수집/명품",
                    "https://www.sneakernews.com/"
            ));

            // ===========================
            // [문화/예술] 카테고리 (기존 10개 + 추가 2개)
            // ===========================
            hobbyRepository.save(new Hobby(
                    "영화",
                    new BigDecimal("10000"),
                    "최신 영화 리뷰, 추천, 감상평을 공유하는 방입니다.",
                    "문화/예술",
                    "https://www.imdb.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "음악",
                    new BigDecimal("15000"),
                    "음악 감상, 콘서트 정보, 음악 추천을 위한 방입니다.",
                    "문화/예술",
                    "https://www.rollingstone.com/music/"
            ));
            hobbyRepository.save(new Hobby(
                    "독서",
                    new BigDecimal("5000"),
                    "도서 추천, 리뷰, 독서 토론을 위한 커뮤니티 방입니다.",
                    "문화/예술",
                    "https://www.goodreads.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "사진",
                    new BigDecimal("10000"),
                    "사진 촬영 기법, 작품 공유, 전시 정보 등을 나누는 방입니다.",
                    "문화/예술",
                    "https://www.photographyblog.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "예술 감상",
                    new BigDecimal("10000"),
                    "미술 전시, 예술 작품 감상 및 예술계 소식을 공유하는 방입니다.",
                    "문화/예술",
                    "https://www.artnews.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "미술 전시회",
                    new BigDecimal("15000"),
                    "최신 미술 전시회 정보 및 리뷰를 나누는 방입니다.",
                    "문화/예술",
                    "https://www.artforum.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "연극 감상",
                    new BigDecimal("15000"),
                    "연극 공연 리뷰 및 감상 정보를 공유하는 방입니다.",
                    "문화/예술",
                    "https://www.theatre.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "클래식 음악 감상",
                    new BigDecimal("15000"),
                    "클래식 음악 및 오케스트라 정보를 나누는 방입니다.",
                    "문화/예술",
                    "https://www.classicfm.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "문학 토론",
                    new BigDecimal("10000"),
                    "문학 작품 및 작가에 대한 토론을 위한 방입니다.",
                    "문화/예술",
                    "https://www.litcharts.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "디자인 전시",
                    new BigDecimal("10000"),
                    "최신 디자인 전시 및 관련 정보를 공유하는 방입니다.",
                    "문화/예술",
                    "https://www.designboom.com/"
            ));
            // 추가 [문화/예술]
            hobbyRepository.save(new Hobby(
                    "현대 미술 토론",
                    new BigDecimal("12000"),
                    "현대 미술 작품 및 작가에 대한 심도 있는 토론을 위한 방입니다.",
                    "문화/예술",
                    "https://www.artsy.net/"
            ));
            hobbyRepository.save(new Hobby(
                    "전통 예술 감상",
                    new BigDecimal("12000"),
                    "전통 예술 공연 및 공예품 감상 정보를 공유하는 방입니다.",
                    "문화/예술",
                    "https://www.culturethailand.com/"
            ));

            // ===========================
            // [취미/건강] 카테고리 (기존 12개)
            // ===========================
            hobbyRepository.save(new Hobby(
                    "요리",
                    new BigDecimal("10000"),
                    "요리 레시피와 팁, 맛집 추천을 공유하는 방입니다.",
                    "취미/건강",
                    "https://www.allrecipes.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "게임",
                    new BigDecimal("10000"),
                    "최신 게임 리뷰, 팁, 대회 정보와 토론을 나누는 방입니다.",
                    "취미/건강",
                    "https://www.ign.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "피트니스",
                    new BigDecimal("20000"),
                    "운동, 헬스, 피트니스 정보 및 경험을 공유하는 방입니다.",
                    "취미/건강",
                    "https://www.bodybuilding.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "요가",
                    new BigDecimal("15000"),
                    "요가 자세, 건강 팁, 요가 클래스 정보를 공유하는 방입니다.",
                    "취미/건강",
                    "https://www.yogajournal.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "필라테스",
                    new BigDecimal("15000"),
                    "필라테스 동작, 클래스 추천 및 건강 정보를 공유하는 방입니다.",
                    "취미/건강",
                    "https://www.pilatesanytime.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "공예",
                    new BigDecimal("10000"),
                    "손쉬운 DIY 및 공예 작품 정보를 나누는 방입니다.",
                    "취미/건강",
                    "https://www.instructables.com/craft/"
            ));
            hobbyRepository.save(new Hobby(
                    "캠핑",
                    new BigDecimal("20000"),
                    "캠핑 장소, 팁, 장비 추천 등 캠핑 정보를 공유하는 방입니다.",
                    "취미/건강",
                    "https://www.campingworld.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "낚시",
                    new BigDecimal("15000"),
                    "낚시 팁, 장비 정보, 낚시 여행 경험을 공유하는 방입니다.",
                    "취미/건강",
                    "https://www.fishingworld.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "보드게임",
                    new BigDecimal("10000"),
                    "보드게임 리뷰, 전략, 모임 정보를 나누는 방입니다.",
                    "취미/건강",
                    "https://www.boardgamegeek.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "정원 가꾸기",
                    new BigDecimal("10000"),
                    "식물 재배, 정원 꾸미기 팁, 자연과 함께하는 시간을 공유하는 방입니다.",
                    "취미/건강",
                    "https://www.gardeningknowhow.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "애완동물",
                    new BigDecimal("15000"),
                    "반려동물 관리, 정보 공유, 커뮤니티 모임을 위한 방입니다.",
                    "취미/건강",
                    "https://www.petmd.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "드라이브",
                    new BigDecimal("20000"),
                    "드라이브 코스 추천 및 차량 관리 정보 공유 방입니다.",
                    "취미/건강",
                    "https://www.drive.com/"
            ));

            // ===========================
            // [여행/레저] 카테고리 (기존 8개 + 추가 4개)
            // ===========================
            hobbyRepository.save(new Hobby(
                    "여행",
                    new BigDecimal("50000"),
                    "여행 정보, 꿀팁, 여행지 추천 및 경험을 공유하는 방입니다.",
                    "여행/레저",
                    "https://www.tripadvisor.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "럭셔리 여행",
                    new BigDecimal("200000"),
                    "고급 여행, 리조트 정보 및 특별한 여행 경험을 나누는 방입니다.",
                    "여행/레저",
                    "https://www.luxurytraveladvisor.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "배낭 여행",
                    new BigDecimal("30000"),
                    "배낭 여행 계획 및 경험을 공유하는 방입니다.",
                    "여행/레저",
                    "https://www.nomadicmatt.com/travel-blogs/"
            ));
            hobbyRepository.save(new Hobby(
                    "해외 투어",
                    new BigDecimal("80000"),
                    "해외 투어 및 여행 팁을 나누는 방입니다.",
                    "여행/레저",
                    "https://www.tourradar.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "크루즈 여행",
                    new BigDecimal("150000"),
                    "크루즈 여행 정보 및 후기 공유 방입니다.",
                    "여행/레저",
                    "https://www.cruisecritic.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "여행 블로깅",
                    new BigDecimal("30000"),
                    "여행 블로깅 및 콘텐츠 제작 정보를 공유하는 방입니다.",
                    "여행/레저",
                    "https://www.travelblog.org/"
            ));
            hobbyRepository.save(new Hobby(
                    "여행 준비",
                    new BigDecimal("25000"),
                    "여행 준비, 팁, 체크리스트를 공유하는 방입니다.",
                    "여행/레저",
                    "https://www.lonelyplanet.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "자연 탐방",
                    new BigDecimal("20000"),
                    "자연 탐방 및 에코 투어 정보를 나누는 방입니다.",
                    "여행/레저",
                    "https://www.nationalgeographic.com/travel/"
            ));
            // 추가 [여행/레저]
            hobbyRepository.save(new Hobby(
                    "글램핑 체험",
                    new BigDecimal("60000"),
                    "글램핑 체험 및 추천 장소 정보를 공유하는 방입니다.",
                    "여행/레저",
                    "https://www.glampinghub.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "에코 투어",
                    new BigDecimal("40000"),
                    "환경 친화적인 에코 투어 정보를 나누는 방입니다.",
                    "여행/레저",
                    "https://www.ecotourism.org/"
            ));
            hobbyRepository.save(new Hobby(
                    "문화 여행",
                    new BigDecimal("55000"),
                    "문화와 역사를 담은 여행 정보를 공유하는 방입니다.",
                    "여행/레저",
                    "https://www.culturaltravelguide.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "시티 투어",
                    new BigDecimal("50000"),
                    "도시 내 명소 투어 및 추천 코스를 나누는 방입니다.",
                    "여행/레저",
                    "https://www.citytours.com/"
            ));

            // ===========================
            // [모빌리티] 카테고리 (기존 8개 + 추가 4개)
            // ===========================
            hobbyRepository.save(new Hobby(
                    "드라이브 체험",
                    new BigDecimal("25000"),
                    "새로운 드라이브 코스 및 차량 체험을 공유하는 방입니다.",
                    "모빌리티",
                    "https://www.drive.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "오토바이 라이딩",
                    new BigDecimal("20000"),
                    "오토바이 라이딩 기술 및 모임 정보를 공유하는 방입니다.",
                    "모빌리티",
                    "https://www.revzilla.com/motorcycle"
            ));
            hobbyRepository.save(new Hobby(
                    "자전거 투어",
                    new BigDecimal("15000"),
                    "자전거 투어 코스 및 라이딩 팁을 나누는 방입니다.",
                    "모빌리티",
                    "https://www.biketour.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "전기 스쿠터 체험",
                    new BigDecimal("10000"),
                    "전기 스쿠터 이용 경험 및 리뷰를 공유하는 방입니다.",
                    "모빌리티",
                    "https://www.scooter.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "자동차 튜닝",
                    new BigDecimal("15000"),
                    "자동차 튜닝 팁 및 정보 공유 방입니다.",
                    "모빌리티",
                    "https://www.carid.com/tuning/"
            ));
            hobbyRepository.save(new Hobby(
                    "카셰어링 체험",
                    new BigDecimal("15000"),
                    "카셰어링 및 모빌리티 서비스 체험을 공유하는 방입니다.",
                    "모빌리티",
                    "https://www.zipcar.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "모빌리티 테크",
                    new BigDecimal("20000"),
                    "최신 모빌리티 기술 및 트렌드를 논의하는 방입니다.",
                    "모빌리티",
                    "https://www.mobility-tech.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "드론 레이싱",
                    new BigDecimal("15000"),
                    "드론 레이싱 대회 및 기술을 공유하는 방입니다.",
                    "모빌리티",
                    "https://www.droneracingleague.com/"
            ));
            // 추가 [모빌리티]
            hobbyRepository.save(new Hobby(
                    "고성능 자동차 체험",
                    new BigDecimal("30000"),
                    "고성능 자동차 체험 및 리뷰를 공유하는 방입니다.",
                    "모빌리티",
                    "https://www.supercars.net/"
            ));
            hobbyRepository.save(new Hobby(
                    "자율주행 자동차 체험",
                    new BigDecimal("35000"),
                    "자율주행 자동차 체험 및 최신 기술 정보를 나누는 방입니다.",
                    "모빌리티",
                    "https://www.autonomousvehicleweb.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "전기 자전거 체험",
                    new BigDecimal("15000"),
                    "전기 자전거 체험 및 라이딩 팁을 공유하는 방입니다.",
                    "모빌리티",
                    "https://www.electricbikereview.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "모터스포츠 체험",
                    new BigDecimal("15000"),
                    "모터스포츠 관련 체험 및 정보 공유 방입니다.",
                    "모빌리티",
                    "https://www.motorsport.com/"
            ));

            // ===========================
            // [라이프스타일] 카테고리 (신규 12개)
            // ===========================
            hobbyRepository.save(new Hobby(
                    "인테리어 디자인",
                    new BigDecimal("20000"),
                    "최신 인테리어 디자인 트렌드 및 아이디어를 공유하는 방입니다.",
                    "라이프스타일",
                    "https://www.architecturaldigest.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "패션 스타일링",
                    new BigDecimal("15000"),
                    "패션 스타일링 및 코디 팁을 나누는 방입니다.",
                    "라이프스타일",
                    "https://www.vogue.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "뷰티 트렌드",
                    new BigDecimal("10000"),
                    "최신 뷰티 트렌드 및 스킨케어 정보를 공유하는 방입니다.",
                    "라이프스타일",
                    "https://www.allure.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "커피 문화",
                    new BigDecimal("8000"),
                    "커피 맛집, 원두 추천 및 커피 문화 정보를 나누는 방입니다.",
                    "라이프스타일",
                    "https://www.starbucks.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "칵테일 만들기",
                    new BigDecimal("12000"),
                    "칵테일 레시피와 만들기 노하우를 공유하는 방입니다.",
                    "라이프스타일",
                    "https://www.liquor.com/cocktail-recipes/"
            ));
            hobbyRepository.save(new Hobby(
                    "도시 농업",
                    new BigDecimal("10000"),
                    "도시 농업 및 홈 가드닝 정보를 나누는 방입니다.",
                    "라이프스타일",
                    "https://www.urbanfarming.org/"
            ));
            hobbyRepository.save(new Hobby(
                    "비건 요리",
                    new BigDecimal("12000"),
                    "비건 요리 레시피 및 건강 정보를 공유하는 방입니다.",
                    "라이프스타일",
                    "https://www.theminimalistvegan.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "셀프 케어",
                    new BigDecimal("8000"),
                    "셀프 케어 및 웰빙 팁을 나누는 방입니다.",
                    "라이프스타일",
                    "https://www.self.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "홈 카페",
                    new BigDecimal("15000"),
                    "홈 카페 인테리어와 커피 레시피를 공유하는 방입니다.",
                    "라이프스타일",
                    "https://www.homegrounds.co/"
            ));
            hobbyRepository.save(new Hobby(
                    "라이프 코칭",
                    new BigDecimal("20000"),
                    "개인 라이프 코칭 및 동기 부여 정보를 나누는 방입니다.",
                    "라이프스타일",
                    "https://www.lifehack.org/"
            ));
            hobbyRepository.save(new Hobby(
                    "소셜 미디어 활용",
                    new BigDecimal("15000"),
                    "소셜 미디어 마케팅 및 활용 팁을 공유하는 방입니다.",
                    "라이프스타일",
                    "https://www.socialmediaexaminer.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "디지털 노마드 라이프",
                    new BigDecimal("15000"),
                    "디지털 노마드 및 원격 근무 정보를 나누는 방입니다.",
                    "라이프스타일",
                    "https://www.nomadicmatt.com/"
            ));

            // ===========================
            // [비즈니스/재테크] 카테고리 (신규 12개)
            // ===========================
            hobbyRepository.save(new Hobby(
                    "주식 투자",
                    new BigDecimal("50000"),
                    "주식 투자 전략 및 시장 분석 정보를 공유하는 방입니다.",
                    "비즈니스/재테크",
                    "https://www.investopedia.com/stocks/"
            ));
            hobbyRepository.save(new Hobby(
                    "부동산 투자",
                    new BigDecimal("150000000"),
                    "부동산 투자 팁 및 시장 동향을 나누는 방입니다.",
                    "비즈니스/재테크",
                    "https://www.realtor.com/investing/"
            ));
            hobbyRepository.save(new Hobby(
                    "재테크 세미나",
                    new BigDecimal("50000"),
                    "재테크 세미나 및 투자 강의 정보를 공유하는 방입니다.",
                    "비즈니스/재테크",
                    "https://www.moneytalksnews.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "크립토 투자",
                    new BigDecimal("50000"),
                    "암호화폐 투자 및 블록체인 정보를 나누는 방입니다.",
                    "비즈니스/재테크",
                    "https://www.coinbase.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "재무 관리",
                    new BigDecimal("50000"),
                    "개인 재무 관리 및 자산 증식 정보를 공유하는 방입니다.",
                    "비즈니스/재테크",
                    "https://www.mint.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "스타트업 네트워킹",
                    new BigDecimal("50000"),
                    "스타트업 창업 및 네트워킹 정보를 나누는 방입니다.",
                    "비즈니스/재테크",
                    "https://www.meetup.com/topics/startup/"
            ));
            hobbyRepository.save(new Hobby(
                    "사업 아이디어",
                    new BigDecimal("50000"),
                    "혁신적인 사업 아이디어와 창업 정보를 공유하는 방입니다.",
                    "비즈니스/재테크",
                    "https://www.entrepreneur.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "자산 관리",
                    new BigDecimal("50000"),
                    "개인 자산 관리 및 투자 전략을 논의하는 방입니다.",
                    "비즈니스/재테크",
                    "https://www.fidelity.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "펀드 투자",
                    new BigDecimal("50000"),
                    "펀드 투자 정보 및 추천 전략을 공유하는 방입니다.",
                    "비즈니스/재테크",
                    "https://www.vanguard.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "비즈니스 모델 분석",
                    new BigDecimal("50000"),
                    "다양한 비즈니스 모델을 분석하고 토론하는 방입니다.",
                    "비즈니스/재테크",
                    "https://hbr.org/"
            ));
            hobbyRepository.save(new Hobby(
                    "온라인 마케팅",
                    new BigDecimal("50000"),
                    "온라인 마케팅 전략 및 사례를 공유하는 방입니다.",
                    "비즈니스/재테크",
                    "https://www.hubspot.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "이커머스 창업",
                    new BigDecimal("50000"),
                    "이커머스 창업 아이디어 및 성공 사례를 나누는 방입니다.",
                    "비즈니스/재테크",
                    "https://www.shopify.com/"
            ));

            // ===========================
            // [취미 기타] 카테고리 (신규 12개)
            // ===========================
            hobbyRepository.save(new Hobby(
                    "애니메이션 감상",
                    new BigDecimal("5000"),
                    "최신 애니메이션 리뷰 및 감상평을 공유하는 방입니다.",
                    "취미 기타",
                    "https://www.crunchyroll.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "만화 그리기",
                    new BigDecimal("5000"),
                    "만화 및 일러스트 제작 정보를 나누는 방입니다.",
                    "취미 기타",
                    "https://www.deviantart.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "보드게임 개발",
                    new BigDecimal("5000"),
                    "보드게임 아이디어 및 개발 정보를 공유하는 방입니다.",
                    "취미 기타",
                    "https://www.boardgamegeek.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "유튜브 콘텐츠 제작",
                    new BigDecimal("5000"),
                    "유튜브 영상 제작 및 콘텐츠 기획을 논의하는 방입니다.",
                    "취미 기타",
                    "https://www.youtube.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "팝 컬처 토론",
                    new BigDecimal("5000"),
                    "팝 컬처와 최신 트렌드를 토론하는 방입니다.",
                    "취미 기타",
                    "https://www.popculture.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "디지털 아트",
                    new BigDecimal("5000"),
                    "디지털 아트 제작 및 전시 정보를 공유하는 방입니다.",
                    "취미 기타",
                    "https://www.artstation.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "VR 게임 체험",
                    new BigDecimal("5000"),
                    "VR 게임 체험 및 리뷰를 공유하는 방입니다.",
                    "취미 기타",
                    "https://www.oculus.com/experiences/quest/section/1819177173024787/"
            ));
            hobbyRepository.save(new Hobby(
                    "e스포츠 분석",
                    new BigDecimal("5000"),
                    "e스포츠 경기 분석 및 토론을 나누는 방입니다.",
                    "취미 기타",
                    "https://www.esportsearnings.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "음악 프로듀싱",
                    new BigDecimal("5000"),
                    "음악 제작 및 프로듀싱 기법을 공유하는 방입니다.",
                    "취미 기타",
                    "https://www.ableton.com/en/"
            ));
            hobbyRepository.save(new Hobby(
                    "팟캐스트 제작",
                    new BigDecimal("5000"),
                    "팟캐스트 기획, 제작 및 운영 정보를 공유하는 방입니다.",
                    "취미 기타",
                    "https://www.anchor.fm/"
            ));
            hobbyRepository.save(new Hobby(
                    "모바일 게임 개발",
                    new BigDecimal("5000"),
                    "모바일 게임 개발 관련 아이디어 및 기술 정보를 나누는 방입니다.",
                    "취미 기타",
                    "https://www.unity.com/"
            ));
            hobbyRepository.save(new Hobby(
                    "크리에이티브 워크숍",
                    new BigDecimal("5000"),
                    "창의적 아이디어와 워크숍 정보를 공유하는 방입니다.",
                    "취미 기타",
                    "https://www.skillshare.com/"
            ));
        }
    }
}
