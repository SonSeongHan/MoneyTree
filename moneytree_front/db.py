from contextlib import nullcontext

import mariadb
import pandas as pd

DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "moneytree",
    "password": "moneytree",
    "database": "moneytreedb",
}

#  예금 데이터를 불러오는 함수
def get_deposit_data():
    conn = None
    try:
        conn = mariadb.connect(**DB_CONFIG)
        cur = conn.cursor()

        # 테이블 존재 여부 확인 (deposit_product)
        cur.execute("SHOW TABLES LIKE 'deposit_product'")
        if not cur.fetchone():
            print(" 오류: 'deposit_product' 테이블이 존재하지 않습니다.")
            return None

        # 데이터 조회
        cur.execute("SELECT * FROM deposit_product")
        rows = cur.fetchall()

        # 테이블이 비어 있는 경우 확인
        if not rows:
            print(" 'deposit_product' 테이블에 데이터가 없습니다.")
            return None

        # 컬럼명 가져오기
        if cur.description is None:
            print("❌ 오류: 'deposit_product' 테이블에 컬럼이 없습니다.")
            return None

        columns = [desc[0] for desc in cur.description]

        # Pandas DataFrame으로 변환
        df = pd.DataFrame(rows, columns=columns)

        cur.close()
        return df

    except mariadb.Error as e:
        print(f"❌ 데이터베이스 오류: {e}")
        return None

    finally:
        if conn is not None:
            conn.close()

def get_deposit_by_name(product_name):
    """예금 상품명을 기준으로 조회하는 함수(LIKE 검색 적용)"""    
    conn = None

    try:
        conn=mariadb.connect(**DB_CONFIG)
        cur= conn.cursor()

        #LIKE 검색을 사용하여 부분 일치 조회
        query = "SELECT * FROM deposit_product WHERE deposit_product_name LIKE %s"
        cur.execute(query, (f"%{product_name}",))
        result = cur.fetchone()

        if result:
            columns = [desc[0] for desc in cur.description]
            product_data=dict(zip(columns,result))

            #최소 예치 금액 정보 추가
            product_data["min_deposit_amount"] = product_data.get("min_deposit_amount")
            product_data["deposit_maturity_period"] = product_data.get("deposit_maturity_period")  # 기본 12개월 설정

            return product_data
        else:
            print(f"'{product_name}'에 해당하는 예금 상품을 찾을 수 없습니다.")
            return None
        
    except mariadb.Error as e:
        print(f"데이터 베이스 오류 {e}")
        return None
    finally:
        if conn is not None:
            conn.close()

def get_saving_data():
    conn = None
    try:
        conn = mariadb.connect(**DB_CONFIG)
        cur = conn.cursor()

        cur.execute("SHOW TABLES LIKE 'saving_product'")
        if not cur.fetchone():
            print("오류: 'saving_product' 테이블이 존재하지 않습니다.")
            return None

        #데이터 조회하는 곳
        cur.execute("SELECT * FROM saving_product")
        rows = cur.fetchall()

        #테이블이 혹여나 비어 있는 경우 확인
        if not rows:
            print("'saving_product' 테이블에 데이터가 없습니다.")
            return None

        #컬럼명 가져오기
        if cur.description is None:
            print("오류 : 'saving_product' 테이블에 컬럼이 없습니다.")
            return None

        columns = [desc[0] for desc in cur.description]

        #Pandas DataFrame으로 변환
        df = pd.DataFrame(rows,columns=columns)

        cur.close()
        return df

    except mariadb.Error as e:
        print(f"데이터베이스 오류: {e}")
        return None

    finally:
        if conn is not None:
            conn.close()

def get_saving_by_name(product_name):
    """적금 상품명을 기준으로 조회하는 함수(LIKE 검색 적용)"""
    conn = None
    try:
        conn=mariadb.connect(**DB_CONFIG)
        cur= conn.cursor()

        #LIKE 검색을 사용하여 부분 일치 조회
        query = "SELECT * FROM saving_product WHERE saving_product_name LIKE %s"
        cur.execute(query, (f"%{product_name}",))
        result = cur.fetchone()

        if result:
            columns = [desc[0] for desc in cur.description]
            product_data = dict(zip(columns, result))

            product_data["saving_min_amount"] = product_data.get("saving_min_amount", 0)
            product_data["saving_max_amount"] = product_data.get("saving_max_amount", 0)

            return product_data
        else:
            print(f"'{product_name}'에 해당하는 적금 상품을 찾을 수 없습니다.")
            return None
    except mariadb.Error as e:
        print(f"데이터 베이스 오류 {e}")
        return None
    
    finally:
        if conn is not None:
            conn.close()

def get_apartments_data():
    conn = None
    try: 
        conn = mariadb.connect(**DB_CONFIG)
        cur = conn.cursor()

        cur.execute("USE moneytreedb;")

        cur.execute("SHOW TABLES LIKE 'apartments'")
        if not cur.fetchone():
            print("오류: 'apartments' 테이블이 존재하지 않습니다.")
            return None
        
        cur.execute("SELECT * FROM apartments")
        rows = cur.fetchall()

        if not rows:
            print("apartments 테이블에 데이터가 없습니다.")
            return None
        
        if cur.description is None:
            print("오류: 'apartments'테이블에 컬럼이 없습니다.")
            return None
        
        columns = [desc[0] for desc in cur.description]

        df = pd.DataFrame(rows,columns=columns)

        cur.close()
        return df
    
    except mariadb.Error as e:
        print(f"데이터베이스 오류 {e}")
        return None
    
    finally:
        if conn is not None:
            conn.close()

def get_stock_data():
    conn = None

    try:
        conn = mariadb.connect(**DB_CONFIG)
        cur = conn.cursor()

        cur.execute("SHOW TABLES LIKE 'stock_product'")
        if not cur.fetchone():
            print("오류: 'stock_product'데이터베이스가 존재하지 않습니다.")
            return None
        
        cur.execute("SELECT * FROM stock_product")
        rows = cur.fetchall()

        if not rows:
            print("오류: 'stock_product' 데이터베이스가 내용이 존재하지 않습니다.")
            return None
        
        if cur.description is None:
            print("현재 데이터베이스에 컬럼이 존재하지 않습니다.")
            return None
        
        columns = [desc[0] for desc in cur.description]

        df=pd.DataFrame(rows,columns=columns)

        cur.close()
        return df

    except mariadb.Error as e:
        print(f"데이터베이스 오류 {e}")
        return None
    finally:
        if conn is not None:
            conn.close()

def get_stock_product_id(product_name):
    """주식 상품명으로 ID를 조회하는 함수(LIKE 검색 적용)"""    
    conn = None

    try:
        conn=mariadb.connect(**DB_CONFIG)
        cur= conn.cursor()

        #LIKE 검색을 사용하여 부분 일치 조회
        query = "SELECT id FROM stock_product WHERE stock_product_name LIKE %s"
        cur.execute(query, (f"%{product_name}",))
        result = cur.fetchone()

        if result:
            return result[0]
        else:
            return None
    except mariadb.Error as e:
        print(f"데이터 베이스 오류 {e}")
        return None
    
    finally:
        if conn is not None:
            conn.close()

def get_fund_data():
    conn = None

    try:
        conn=mariadb.connect(**DB_CONFIG)
        cur= conn.cursor()

        cur.execute("SHOW TABLES LIKE 'fund_product'")
        if not cur.fetchone:
            print("오류: 데이터베이스가 존재하지 않습니다.")
            return None
        
        cur.execute("SELECT * FROM fund_product")
        rows = cur.fetchall()

        if not rows:
            print("오류: 데이터베이스에 데이터가 존재하지 않습니다.")
            return None
        
        if cur.description is None:
            print("오류: 데이터베이스에 컬럼이 존재하지 않습니다.")
            return None
        
        columns = [desc[0] for desc in cur.description]

        df = pd.DataFrame(rows,columns=columns)
        
        cur.close()
        return df
    
    except mariadb.Error as e:
        print(f"데이터베이스 오류 {e}")
        return None
    
    finally:
        if conn is not None:
            conn.close()

def get_fund_product_id(product_name):
    """펀드 상품명으로 ID를 조회하는 함수(LIKE 검색 적용)"""    
    conn = None

    try:
        conn=mariadb.connect(**DB_CONFIG)
        cur= conn.cursor()

        #LIKE 검색을 사용하여 부분 일치 조회
        query = "SELECT id FROM fund_product WHERE fund_product_name LIKE %s"
        cur.execute(query, (f"%{product_name}",))
        result = cur.fetchone()

        if result:
            return result[0]
        else:
            return None
    except mariadb.Error as e:
        print(f"데이터 베이스 오류 {e}")
        return None
    
    finally:
        if conn is not None:
            conn.close()

def calculate_deposit_maturity(initail_amount,interest_rate,months):
    """
    예금 만기 금액 계산(단리)
    :param initial_amount: 가입 금액
    :param interest_rate: 연이율 (예: 2% → 0.02 입력)
    :param months: 예치 기간 (개월 단위)
    :return: 만기 시 총 수령 금액
    """
    return float(initail_amount) * (1 + float(interest_rate) * float((months)/12))

def calculate_deposit_maturity_compound(initall_amount, final_interest_rate, months , compounds_per_year=1):
    """
    예금 복리 계산
    :param principal: 예치 금액 (원금)
    :param interest_rate: 연이율 (예 2% → 0.02 입력)
    :param years: 예치 기간 (년 단위)
    :param compounds_per_year: 복리 계산 횟수 (연 복리: 1, 월 복리: 12, 일 복리: 365)
    :return: 만기 총 수령액
    """
    years = months/12
    total = float(initall_amount) * ((1 + float(final_interest_rate) / float(compounds_per_year)) ** (float(years) * float(compounds_per_year)))
    return round(total, 2)

def calculate_saving_maturity(monthly_saving, interest_rate, months):
    """
    적금 만기 금액 계산(복리 적용)
    :param monthly_saving: 매월 납입 금액
    :param interest_rate: 연이율 (예 2% -> 00.2 입력)
    :param months: 납입 기간 (월 단위)
    :return: 만기 시 총 수령 금액
    """

    rate_per_month = interest_rate / 12
    total = 0

    for month in range(1, months + 1):
        total += float(monthly_saving) * ((1 + float(rate_per_month)) ** (float(months) - float(month) + 1))
    return round(total,2) #소수점 두자리까지 반올림함

def calculate_saving_maturity_simple(monthly_saving, interest_rate, months):
    """
    적금 만기 금액 계산 (단리 적용)
    :param monthly_saving: 매월 납입 금액
    :param interest_rate: 연이율 (예 2% -> 0.02 입력)
    :param months: 납입 기간 (월 단위)
    :return: 만기 시 총 수령 금액 (단리 적용)
    """
    total_principal = float(monthly_saving * months)
    total_interest = float(total_principal) * float(interest_rate/12) * float(months + 1) / 2
    return round(total_principal + total_interest, 2)
  
# 실행 예제
if __name__ == "__main__":
    deposit_data = get_deposit_data()
    saving_data = get_saving_data()
    apartments_data = get_apartments_data()
    stock_data = get_stock_data()
    fund_data = get_fund_data()
    

    if deposit_data is not None:
        print(deposit_data)

    if saving_data is not None:
        print(saving_data)

    if apartments_data is not None:
        print(apartments_data)

    if stock_data is not None:
        print(stock_data)

    if fund_data is not None:
        print(fund_data)
