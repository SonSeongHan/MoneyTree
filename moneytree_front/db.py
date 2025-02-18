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

def get_deposit_product_id(product_name):
    """예금 상품명으로 ID를 조회하는 함수(LIKE 검색 적용)"""    
    conn = None

    try:
        conn=mariadb.connect(**DB_CONFIG)
        cur= conn.cursor()

        #LIKE 검색을 사용하여 부분 일치 조회
        query = "SELECT id FROM deposit_product WHERE deposit_product_name LIKE %s"
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

def get_saving_product_id(product_name):
    """적금 상품명으로 ID를 조회하는 함수(LIKE 검색 적용)"""
    conn = None
    try:
        conn=mariadb.connect(**DB_CONFIG)
        cur= conn.cursor()

        #LIKE 검색을 사용하여 부분 일치 조회
        query = "SELECT id FROM saving_product WHERE saving_product_name LIKE %s"
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
