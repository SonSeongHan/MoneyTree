from flask import Flask, request, jsonify, session
from flask_cors import CORS
import time
import openai
import requests
import os
import db
import pandas as pd
import uuid
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from matplotlib import rc
import numpy as np
import platform
from flask_session import Session
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_experimental.agents import create_pandas_dataframe_agent
from db import get_apartments_data
from flask import send_from_directory

from langchain_openai import ChatOpenAI

#db의 질의응답을 위한 Agent
from langchain.agents.agent_types import AgentType
from langchain_experimental.agents import create_pandas_dataframe_agent

#pip install tabulate
from tabulate import tabulate
import pandas as pd

app = Flask(__name__)
CORS(app, supports_credentials=True) # 쿠키 전송을 허용함
app.secret_key = "my_secret_key_1234" # 24 바이트 키 자동 생성(랜덤입니다.)


app.config["SESSION_TYPE"] = "filesystem" #세션을 파일(데이터) 시스템에 저장
app.config["SESSION_FILE_DIR"] = "./flask_session" #세션 저장 경로
app.config["SESSION_PERMANENT"] = True # 세션을 영구적으로 유지
app.config["SESSION_USE_SIGNER"] = True # 세션 데이터를 서명하여 보안 강화
app.config["SESSION_COOKIE_HTTPONLY"] = True # JavaScript에서 세션 쿠키 접근 방지
app.config["SESSION_COOKIE_SECURE"] = False # HTTPS가 아닌 경우에도 쿠키 전송 (로컬 개발 환경)
app.config["SESSION_COOKIE_NAME"] = "moneytree_session" # 세션 쿠키 이름 지정
app.config["SESSION_KEY_PREFIX"] = "moneytree_"  # 세션 키 프리픽스 설정

Session(app)

dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 🔥 [디버깅] API 키 확인
if OPENAI_API_KEY is None:
    print("❌ [ERROR] OPENAI_API_KEY가 설정되지 않았습니다!")
    exit(1)  # 프로그램 강제 종료

@app.route('/welcome', methods=['GET'])
def welcome():
    return jsonify({
        "response": {
            "type": "text",
            "content": ("안녕하세요! 😊 저는 고객님의 MoneyTree 도우미 챗봇입니다. 궁금한 점이 있으면 질문해 주세요!"
            "예) '매매 정보','예금 추천','적금 추천','펀드 추천'"
            "예)'전체 적금 상품 보기','전체 예금 상품 보기','전체 펀드 상품 보기','전체 주식 상품 보기'"
            "등이 있습니다!"
            "아! 그리고 혹시 예금이나 적금을 어떤 상품을 가입하려 할 때 만기 했을 때 얼마나 이득을 보는지 궁금하시다면 '예금 시뮬레이션' 또는 '적금 시뮬레이션'이라고 입력해주세요!"
            "챗봇이 고객님의 궁금점을 해결해드릴게요!"
            )
         }
    })

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get("message")
    print(f"user_input /chat 사용자 입력:{user_input}")

    if "포인트 조회" in user_input:
        user_id = "user2"  # 실제 사용자의 ID를 동적으로 가져와야 함
        response = requests.get(f"http://localhost:8080/api/points/{user_id}")
        point_value = response.json()
        chatbot_response = f"{user_id}의 현재 포인트는 {point_value}점 입니다."
    
    elif "적금 추천" in user_input or "적금 금리" in user_input:
        saving_data = db.get_saving_data()
        if saving_data is not None and "saving_product_id" in saving_data.columns and "saving_base_interest_rate" in saving_data.columns and "saving_prime_interest_rate" in saving_data.columns:
            top_savings = saving_data.sort_values(by="saving_prime_interest_rate",ascending=False).head(3)
        
            chatbot_response = "현재 제공하는 적금 상품 중 최대 이율이 높은 상위 3개 상품입니다:\n\n"
            session["top_savings"] = {} #추천된 상품의 ID를 저장
            session["current_category"] = "saving"
            session["step"] = "saving_recommendation"

            for idx, row in top_savings.iterrows():
                session["top_savings"][str(row["saving_product_id"])] = row["saving_product_name"] #id를 문자열 키로 저장
                chatbot_response += (
                    f"상품 ID: {row['saving_product_id']}. 상품명:{row['saving_product_name']} - 최대 이율: {row['saving_prime_interest_rate']}%\n"
                    f"(기본 이율: {row['saving_base_interest_rate']}, 가입 기간: {row['saving_maturity_period']})\n\n"
                )
            
            session.modified = True #세션 변경 반영
            print("저장된 추천 상품 목록 (백엔드):", session["top_savings"])  #디버깅
            print("✅ 저장된 current_category (백엔드):", session["current_category"])  # ✅ 디버깅 추가
            print("✅ 저장된 step (백엔드):", session["step"])

            chatbot_response +="\n자세한 정보를 원하시면 해당 상위 상품 번호 입력해주시면 해당 상품 상세 페이지로 이동 시켜드릴게요.(예: 1 또는 2 또는 3)\n"
            chatbot_response += "더 많은 상품을 보고 싶다면 '전체 적금 상품 보기'라고 입력해주세요."
            
            return jsonify({
            "response": chatbot_response,
            "top_savings": session["top_savings"],
            "current_category": session["current_category"],
            "step": session["step"]
            })
    
    # 적금 추천에서 고른 번호로 이동 시키기
    elif user_input.isdigit() and session.get("step") == "saving_recommendation":
        product_id = user_input.strip()  # 입력받은 상품 ID 가져오기
        top_savings = session.get("top_savings", {})

        print(f"🔍 현재 저장된 step 값: {session.get('step')}")
        print(f"🔍 현재 저장된 current_category 값: {session.get('current_category')}")  # ✅ 디버깅 추가
        print(f"🔍 현재 top_savings를 받은 값들: {top_savings}")  # ✅ 디버깅 추가
        print(f"🔍 현재 list(top_savings.keys())로 변환한 값: {list(top_savings.keys())}")  # ✅ 디버깅 추가

        current_category = session.get("current_category","saving")
        session["step"] = "saving_selection"
        session.modified = True

        if product_id in top_savings:  # 유효한 값인지 체크
            chatbot_response = f"선택하신 상품의 상세 페이지로 이동합니다. 혹시 이동이 안되셨다면 아래 링크를 클릭해주세요: [상세페이지](http://localhost:3000/{current_category}/{product_id})"
        else:
            chatbot_response = f"유효한 추천 상품의 번호를 입력해 주세요. (예: {', '.join(top_savings.keys())} 중 하나를 선택해 주세요.)"

        # session.clear()
            
        return jsonify({
            "response": chatbot_response,
            "current_category": current_category,
            "valid_product_ids": product_id, # 유효한 상품 번호 
            "step": session["step"]
        })

    
    elif "전체 적금 상품 보기" in user_input:
        chatbot_response = "전체 적금 상품 페이지로 이동하셨습니다. 혹시 이동이 안되셨다면 아래 링크를 클릭해주세요:\n"
        chatbot_response += "➡ [적금 상품 페이지로 이동](http://localhost:3000/products/deposit-saving?tab=saving)"
        
        return jsonify({"response": chatbot_response})
    
    elif "예금 추천" in user_input or "예금 금리" in user_input:
        deposit_data = db.get_deposit_data()
        if deposit_data is not None and "deposit_product_id" in deposit_data.columns and "deposit_base_interest_rate" in deposit_data.columns and "deposit_prime_interest_rate" in deposit_data.columns:
            top_deposits = deposit_data.sort_values(by="deposit_prime_interest_rate",ascending=False).head(3)
            
            chatbot_response= "현재 제공하는 예금 상품 중 최대 이율이 높은 상위 3개 상품입니다.\n\n"
            session["top_deposits"] = {}
            session["current_category"] = "deposit"
            session["step"] = "deposit_recommendation"

            for idx, row in top_deposits.iterrows():
                session["top_deposits"][str(row["deposit_product_id"])] = row["deposit_product_name"]
                chatbot_response += (
                    f"상품 ID: {row['deposit_product_id']}. 상품명:{row['deposit_product_name']} - 최대 이율: {row['deposit_prime_interest_rate']}%\n"
                    f"(기본 이율: {row['deposit_base_interest_rate']}), 가입 기간: {row['deposit_maturity_period']}\n\n"
                )
            
            session.modified = True
            print("저장된 추천 상품 목록 (백엔드):", session["top_deposits"])  #디버깅
            print("저장된 current_category (백엔드):", session["current_category"])  # 디버깅 추가
            print("저장된 step (백엔드):", session["step"])     
            
            chatbot_response +="\n자세한 정보를 원하시면 해당 상위 상품 번호 입력해주시면 자세하게 말씀드릴게요.(예: 1 또는 2 또는 3)\n"
            chatbot_response += "더 많은 상품을 보고 싶다면 '전체 예금 상품 보기'라고 입력해주세요."

            return jsonify({
            "response": chatbot_response,
            "top_deposits" : session["top_deposits"],
            "current_category": session["current_category"],
            "step": session["step"]
            })
    
    elif user_input.strip().isdigit() and session.get("step") == "deposit_recommendation":
        product_id = user_input.strip() #입력받은 상품 ID 가져오기
        top_deposits = session.get("top_deposits",{})
        

        print(f"🔍 현재 저장된 step 값: {session.get('step')}")
        print(f"🔍 현재 저장된 current_category 값: {session.get('current_category')}")  # ✅ 디버깅 추가
        print(f"🔍 현재 top_deposits 받은 값들: {top_deposits}")  # ✅ 디버깅 추가
        print(f"🔍 현재 list(top_deposits.keys())로 변환한 값: {list(top_deposits.keys())}")  # ✅ 디버깅 추가

        current_category = session.get("current_category","deposit")
        session["step"] = "deposit_selection"
        session.modified = True

        if product_id in top_deposits:
            chatbot_response = f"선택하신 상품의 페이지로 이동합니다.혹시 이동이 안되셨다면 아래 링크를 클릭해주세요: [상세페이지](http://localhost:3000/{current_category}/{product_id})"
        else:
            chatbot_response = f"유효한 추천 상품의 번호를 입력해 주세요. (예 {', '.join(top_deposits.key())} 중 하나를 선택해 주세요.)"
        
        # session.clear()
        return jsonify({
            "response": chatbot_response,
            "current_category": current_category,
            "valid_product_ids": product_id,
            "step": session["step"]
        })
    
    elif "전체 예금 상품 보기" in user_input:
        chatbot_response = "전체 예금 상품 페이지로 이동하셨습니다. 혹시 이동이 안되셨다면 아래 링크를 아래 링크를 클릭해주세요:\n"
        chatbot_response += "➡ [예금 상품 페이지로 이동](http://localhost3000/products/deposit-saving?tab=deposit)"
        return jsonify({"response": chatbot_response})
    
    elif "주식 추천" in user_input:
        stock_data = db.get_stock_data()
        if stock_data is not None and "stock_product_id" in stock_data.columns and "stock_trading_volume" in stock_data.columns:
            top_stock_trading_volume = stock_data.sort_values(by="stock_trading_volume",ascending=False).head(3)
            top_stock_market_capitalization = top_stock_trading_volume.sort_values(by="stock_market_capitalization",ascending=False)


            chatbot_response=  ("현재 제공하는 주식 상품 중 거래량이 가장 많은 것을 기준으로 기업의 시가총액이 높은 순으로 3개입니다.\n")
            session["top_stock_market_capitalization"] = {}
            # session["current_category"] = "stock"
            session["step"] = "selectfund"

            
            
            for idx, row in top_stock_market_capitalization.iterrows():
                session["top_stock_market_capitalization"][str(row["stock_product_id"])] = row["stock_product_name"] #id를 문자열 키로 저장
                chatbot_response += (
                    f" - {row['stock_product_id']}. 상품명:{row['stock_product_name']}\n"
                    f" - 거래량:{row['stock_trading_volume']}\n"
                    f" - 시가 총액: {row['stock_market_capitalization']} 억 원\n\n"
                )
            chatbot_response +="\n죄송합니다. 현재 주식 관련 상품은 해당 상품으로 직접 이동하셔야 합니다."
            chatbot_response +=f"\n추천된 주식 상품 중에서 궁금하신 상품이 있으시면 '전체 주식 상품 보기'라고 입력하시면 주식 상품 페이지로 이동시켜드릴게요.\n"


            
            session.modified = True

        return jsonify({"response": chatbot_response})
    
    elif "전체 주식 상품 보기" in user_input:
        chatbot_response = "전체 주식 상품 페이지로 이동하셨습니다. 혹시 이동이 안되셨다면 아래 링크를 아래 링크를 클릭해주세요:\n"
        chatbot_response += "➡ [주식 상품 페이지로 이동](http://localhost:3000/products/fund-stock?tab=stock)"
        return jsonify({"response": chatbot_response})
    
    elif "펀드 추천" in user_input:
        fund_data = db.get_fund_data()
        if fund_data is not None and "fund_product_id" in fund_data.columns and "fund_product_total_amount" in fund_data.columns and "fund_product_redemption_fee" in fund_data.columns:
            top_price_funds = fund_data.sort_values(by="fund_product_total_amount",ascending=False).head(3)
            low_price_funds = fund_data.sort_values(by="fund_product_total_amount",ascending=True).head(3)

            chatbot_response=(
                "현재 제공하는 펀드 상품 중 총액이 가장 높은 순과 가장 낮은 순으로 각 3개씩 정리되어 있습니다.\n"
                "어떤 상품을 보고 싶으신가요? (높은 순 / 낮은 순) \n"
                "예: '높은 순' 또는 '낮은 순' 입력하세요."
            )
            session["step"] = "fund_recommendation"

            #세션에 데이터 저장(이후 사용자가 선택할 수 있도록)
            session["top_price_funds"] = top_price_funds.to_dict(orient="records")
            session["low_price_funds"] = low_price_funds.to_dict(orient="records")
            session.modified = True

            # print("저장된 펀드 상위 추천 상품 목록 (백엔드):", session["top_price_funds"])  #디버깅
            # print("저장된 펀드 하위 추천 상품 목록 (백엔드):", session["low_price_funds"])  # 디버깅 추가
            print("저장된 step (백엔드):", session["step"])


        return jsonify({"response": chatbot_response})
    
    elif ("높은 순" in user_input or "낮은 순" in user_input) and session.get("step") == "fund_recommendation":
        #세션에서 데이터 가져오기
            is_high_order = "높은 순" in user_input
            selected_funds = session.get("top_price_funds" if is_high_order else "low_price_funds",[])
            
            order_text = "총액이 가장 높은 상위 3개에서 수수료 총합이 가장 낮은 펀드 상품입니다: " if is_high_order else "총액이 가장 낮은 하위에서 수수료 총합이 가장 낮은 펀드 상품 순서입니다: "



            if selected_funds:

                sorted_funds = sorted(selected_funds, key=lambda row: row['fund_product_redemption_fee'] + row['fund_product_management_fee'])

                chatbot_response = f"{order_text}\n\n"
                for idx, row in enumerate(sorted_funds,start=1):
                    total_fee = row['fund_product_redemption_fee'] + row['fund_product_management_fee']
                    chatbot_response += (
                        f"{row['fund_product_id']}. {row['fund_product_name']}\n"
                        f" - 총액: {row['fund_product_total_amount']}억 원\n"
                        f" - 환매 수수료: {row['fund_product_redemption_fee']}%\n"
                        f" - 운용 수수료: {row['fund_product_management_fee']}%\n"
                        f" - 수수료 총합: {total_fee}%\n\n"
                    )
                session["step"] = "selectfund"
                session.modified = True
                chatbot_response += "혹시 해당 상품으로 이동하고싶으시다면 상품의 번호를 입력해주세요!(예: 1,24,30)"
            else:
                chatbot_response = "데이터를 찾을 수 없습니다. 다시 '펀드 추천'을 입력해주세요."
            return jsonify({"response": chatbot_response})    
    
    elif user_input.strip().isdigit() and session.get("step") == "selectfund":
        product_id = user_input.strip()
        top_price_funds = session.get("top_price_funds",{})
        low_price_funds = session.get("low_price_funds",{})

        redirect_url = "products/fund-stock?tab=fund"

        if product_id in [str(f["fund_product_id"]) for f in top_price_funds]:
            chatbot_response = f"추천된 고가의 펀드 상품에서 선택하신 상품의 페이지로 이동합니다.혹시 이동이 안되셨다면 아래 링크를 클릭해 필터를 통해 검색해 주세요: [상세페이지](http://localhost:3000/{redirect_url})"
            session[redirect_url] = redirect_url
            session["valid_products_ids"] = product_id
        elif product_id in [str(f["fund_product_id"]) for f in low_price_funds]:
            chatbot_response = f"추천된 저가의 펀드 상품에서 선택하신 상품의 페이지로 이동합니다.혹시 이동이 안되셨다면 아래 링크를 클릭해 필터를 통해 검색해 주세요: [상세페이지](http://localhost:3000/{redirect_url})"
            session[redirect_url] = redirect_url
            session["valid_products_ids"] = product_id
        else:
            chatbot_response = f"유효한 추천 상품의 번호를 입력해 주세요. (예 {', '.join([str(f['fund_product_id']) for f in top_price_funds + low_price_funds])})"
            session[redirect_url] = None
        
        session.modified = True

        print("세션에 저장된 redirect_url 값:",session[redirect_url])
        print("세션에 저장된 valid_products_ids 값:",session["valid_products_ids"])


        return jsonify({
            "response": chatbot_response,
            "valid_product_ids": session["valid_products_ids"],
            "current_category": "fund",
            "redirect_url": session[redirect_url],
            })
    
    elif "전체 펀드 상품 보기" in user_input:
        chatbot_response = "전체 펀드 상품 페이지로 이동하셨습니다. 혹시 이동이 안되셨다면 아래 링크를 아래 링크를 클릭해주세요:\n"
        chatbot_response += "➡ [펀드 상품 페이지로 이동](http://localhost:3000/products/fund-stock?tab=fund)"
        return jsonify({"response": chatbot_response})
    
    elif "예금 시뮬레이션" in user_input:
        chatbot_response = "📢 예금 시뮬레이션에 입장하셨습니다.\n원하는 예금 상품명을 입력해주세요!\n"
        session["step"] = "deposit_info"
        session.modified = True
        return jsonify({"response": chatbot_response})
    
    elif session.get("step") == "deposit_info":
        session["product_name"]= user_input
        product_name = session.get("product_name")
        deposit_data = db.get_deposit_by_name(product_name)

        if not deposit_data:
            session["step"] = "deposit_select"
            chatbot_response = f"'{product_name}' 상품을 찾을 수 없습니다. 다시 입력해주세요."
            return jsonify({"response": chatbot_response})
        
        final_interest_rate = deposit_data["deposit_base_interest_rate"] + deposit_data["deposit_prime_interest_rate"]

        chatbot_response = (
            f"{product_name} 상품 정보: \n"
            f"- 최소 예치 금액: {int(deposit_data['deposit_min_amount'])}원\n"
            f"- 이율 종류: {deposit_data['deposit_interest_rate_type']}\n"
            f"- 예치 기간: {deposit_data['deposit_maturity_period']}개월\n"
            f"- 최종 이율: {final_interest_rate}%\n\n"
            "가입할 금액을 입력해주세요!"
            )
        session["step"] = "deposit_amount"
        session.modified = True
        return jsonify({"response": chatbot_response})
    
    elif session.get("step") == "deposit_amount":
        try:
            deposit_amount = float(user_input)
        except ValueError:
            return jsonify({"response": "올바른 숫자를 입력해주세요!"})
        
        product_name = session.get("product_name")
        deposit_data = db.get_deposit_by_name(product_name)
        print("DB에서 가져온 상품 데이터:", deposit_data)
        if deposit_amount < deposit_data["deposit_min_amount"]:
            return jsonify({"response": f"❌ 최소 예치 금액은 {deposit_data['deposit_min_amount']}원 이상이어야 합니다!"})

        final_interest_rate = (deposit_data["deposit_base_interest_rate"] + deposit_data["deposit_prime_interest_rate"])/100
        maturity_period = deposit_data["deposit_maturity_period"]
        # deposit_data['deposit_interest_rate_type'] #단리 or 복리 확인
        print("data에서 이율이 출력되나요?",deposit_data['deposit_interest_rate_type'])
        print("최종 이율:",final_interest_rate)

        if deposit_data['deposit_interest_rate_type'] == "단리":
            maturity_amount = db.calculate_deposit_maturity(deposit_amount, final_interest_rate, maturity_period)
        elif deposit_data['deposit_interest_rate_type'] == "복리":
            maturity_amount = db.calculate_deposit_maturity_compound(deposit_amount,final_interest_rate, maturity_period)
        else:
            return jsonify({"response": "금리 유형을 알 수 없습니다. 관리자에게 문의하세요!"})
        
        chatbot_response = f"💰 예상 만기 금액: {maturity_amount:,.0f}원\n\n📈 그래프를 보시겠습니까? (예,네,ㅇㅇ) / (아니요,아뇨,ㄴㄴ)"
        session["deposit_amount"] = deposit_amount
        session["step"] = "show_graph"
        session.modified = True

        return jsonify({"response": chatbot_response, "next_step": "show_graph"})

    # ✅ 그래프 생성 요청
    elif session.get("step") == "show_graph":
        if user_input.lower() in ["예","네","ㅇㅇ"]:
            return generate_graph()
        else:
            session.clear()  # 세션 종료
            return jsonify({"response": "다른 궁금하신 점이 있다면 얘기해주세요!"})
    
    elif "적금 시뮬레이션" in user_input:
        chatbot_response = "📢 적금 시뮬레이션에 입장하셨습니다. \n 원하는 적금 상품명을 입력해주세요!\n"
        session["step"] = "saving_info"
        session.modified = True
        return jsonify({"response": chatbot_response})

    elif session.get("step") == "saving_info":
        session["product_name"] = user_input
        product_name = session.get("product_name")
        saving_data = db.get_saving_by_name(product_name)

        if not saving_data:
            session["step"] = "saving_select"
            chatbot_response = f"'{product_name}' 상품을 찾을 수 없습니다. 다시 입력해주세요."
            return jsonify({"response": chatbot_response})
        
        final_interest_rate = saving_data["saving_base_interest_rate"] + saving_data["saving_prime_interest_rate"]

        chatbot_response = (
            f"{product_name} 상품 정보: \n"
            f"- 최소 매월 예치 금액: {int(saving_data['saving_min_amount'])}원\n"
            f"- 최대 매월 예치 금액: {int(saving_data['saving_max_amount'])}원\n"
            f"- 예치 기간: {saving_data['saving_maturity_period']}개월\n"
            f"- 최종 이율: {final_interest_rate}%\n\n"
            "가입할 금액을 입력해주세요!"
        )
        session["step"] = "saving_amount"
        session.modified = True
        return jsonify({"response": chatbot_response})
    elif session.get("step") == "saving_amount":
        try:
            saving_amount = float(user_input)
        except ValueError:
            return jsonify({"response": "올바른 숫자를 입력해주세요!"})
        
        product_name = session.get("product_name")
        saving_data = db.get_saving_by_name(product_name)
        print("DB에서 가져온 상품 데이터:", saving_data)

        if saving_amount < saving_data["saving_maturity_period"] :
            return jsonify({"response": f"최소 예치 금액은 {saving_data['saving_maturity_period']}원 이상이어야 합니다!"})

        final_interest_rate = (saving_data["saving_base_interest_rate"] + saving_data["saving_prime_interest_rate"])/100
        maturity_period = saving_data["saving_maturity_period"]
        print("data에서 이율이 출력되나요?",saving_data['saving_interest_rate_type'])
        print("최종 이율:",final_interest_rate)

        if saving_data["saving_interest_rate_type"] == "단리":
            maturity_amount = db.calculate_saving_maturity_simple(saving_amount, final_interest_rate, saving_data["saving_maturity_period"])
        elif saving_data["saving_interest_rate_type"] == "복리":
            maturity_amount = db.calculate_saving_maturity(saving_amount, final_interest_rate, saving_data["saving_maturity_period"])
        else:
            return jsonify({"response": "금리 유형을 알 수 없습니다. 관리자에게 문의하세요!"})
        
        chatbot_response = f"💰 예상 만기 금액: {maturity_amount:,.0f}원\n\n📈 그래프를 보시겠습니까? (예,네,ㅇㅇ) / (아니요,아뇨,ㄴㄴ)"
        session["saving_amount"] = saving_amount
        session["step"] = "show_graph"
        session.modified = True

        return jsonify({"response": chatbot_response,"next_step": "show_graph"})
    
    if "매매 정보" in user_input or "부동산 시세" in user_input:
        chatbot_response = (
            "현재 저희가 제공하는 부동산 데이터 중에서 궁금한 부동산 이름을 입력하시면 "
            "(예: LG선릉에클라트(B)) 2022~2024년도에 매매된 가격을 그래프로 보여드립니다. "
            "단 그래프에 0이 있다면 그 해당 년도에 판매된 이력이 없다는 뜻입니다. "
            "원하시는 부동산의 이름을 입력해주세요. "
            "부동산 정보 페이지에 가시면 여러 부동산을 검색하실 수 있습니다. 🏠🔍"
        )
        return jsonify({"response": chatbot_response})
    
    # 🛠 AI가 필요한 경우에만 실행되도록 추가
    elif any(keyword in user_input for keyword in ["대화", "상담", "문의"]):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
            )
            return jsonify({"response": response["choices"][0]["message"]["content"]})
    
        except openai.error.RateLimitError:
            return jsonify({"response": "AI 사용량이 초과되었습니다. 잠시 후 다시 시도해 주세요."})

        except openai.error.OpenAIError as e:
            return jsonify({"response": f"AI 오류가 발생했습니다: {str(e)}"})
    
    else:
        return jsonify({"response": "죄송합니다. 해당 요청을 처리할 수 없습니다."})

#사이트의 기능 안내, 명령어 필터링
#프롬프트를 통해 기능 성능 개선
@app.route('/info', methods=['POST'])
def info():


    #사용자의 질문
    user_input = request.json.get("message")
    print(f"user_input /info 사용자 입력:{user_input}") #사용자의 질문 확인 -> 리액트와 python의 통신에 문제 없음 

    


    os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY #openai.api_key = OPENAI_API_KEY
    #python f포맷 -> ''' ''' 여러 줄의 문자가 입력되어도 한 묶음으로 인식할 수 있게 하는 역할.
    prompt_info = f'''너는 이 사이트를 관리하는 챗봇이야. 우리 사이트의 기능은 아래의 기능과 같아.


        기능 :
        1.금융상품 상세 추천 : 상품유형(예금, 적금, 펀드, 주식), 사용자 조건(예치 기간, 투자 성향, 금리) 등에 맞추어 사용자의 조건에 맞는 금융 상품을 추천함
        2.부동산 상세 추천 (대출 상품 연동) : 매물 유형(매매, 전세, 월세), 예산 범위, 대출 가능 금액 및 조건 등을 고려하여 사용자가 원하는 조건에 맞는 부동산 매물을 추천하고, 필요 시 대출 상품과 연계하여 최적의 선택지를 제공함
        3.라이프 스타일 상세 추천 : 취미 유형(영화, 음악, 운동, 악기, 게임, 여행, 콘서트, 자전거, 낚시, 골프 등), 사용자 예산 및 관심사에 맞춰 적절한 취미 활동을 추천함
        4.상품 가입 페이지 이동 (네비게이션 기능) : 추천된 금융 상품, 부동산 매물, 취미 활동 등에 대한 세부 정보를 확인할 수 있도록 해당 페이지로 이동하는 기능을 제공함
        
        


        너는 사용자의 {user_input} 이라는 질문이 위의 기능 중 어디에 해당하는지를 알아야 해.
        {user_input}이 주어지면, 위의 기능 1, 2, 3, 4 중 어디에 해당하는지 알려줘.
        그리고


        기능의 번호를 먼저 말해.
        정확하게 기능에 대해 언급하고 있지 않더라도, 기능의 핵심 키워드를 말하면 이 사이트에서 제공 가능한 서비스를 대답해.
       
        만약 사용자의 질문에 제공하는 기능이 있으면
        1번. 상품유형(예금, 적금, 펀드, 주식), 사용자 조건(예치 기간, 투자 성향, 금리) 등에 맞추어 조건에 맞는 금융 상품을 추천드리겠습니다!
        라고 얘기해


        만약 위의 기능에 해당하는 것이 나오지 않으면 '죄송합니다. 말씀하신 기능은 제공하지 않습니다' 라고 대답해.
    '''


    Chat = ChatOpenAI(temperature=0.3, model='gpt-4o-mini')
    messages = [
        ('system', prompt_info),
        ('human', user_input)
    ]


    response = Chat.invoke(messages)
    return jsonify({"response":response.content})

# ✅ 음성 인식 기능 (OpenAI 최신 API & 2초 대기 적용)
@app.route('/voice-chat', methods=['POST'])
def voice_chat():
    """ 음성으로 입력된 질문을 기존 챗봇과 데이터 조회 기능에 연결 """
    audio_text = request.json.get("text") 

    if not audio_text or audio_text.strip() == "":
        return jsonify({"response": "❌ 음성을 인식하지 못했습니다. 다시 시도해주세요."})

    print("🎤 음성 입력 감지됨. 2초 대기 후 처리 시작...")
    time.sleep(2)

    response_text = filter_data_internal(audio_text)
    if response_text == "❌ 해당 조건에 맞는 데이터가 없습니다.":
        return jsonify({"response": "🔄 다시 말씀해주세요!"})
    
    return jsonify({"response": response_text})


# 자료 합산 및 계산, 자료 추천, 특정한 키워드가 들어간 글을 셋업하며 전달
#DB의 데이터를 필터링, 계산, 추천하는 함수
# langchain의 pandas 관련 agent를 통해 성능 개선
@app.route('/filter', methods=['POST'])
def filter():
    user_input = request.json.get('message').lower()
    return jsonify({"response": filter_data_internal(user_input)})

def filter_data_internal(user_input):

    print(f"📌 [DEBUG] 받은 입력: {user_input}")


    table = "life"  # 기본 테이블 설정

    if "부동산" in user_input or "매매" in user_input or "매매 정보" in user_input:
        table = "apartments"

    print(f"✅ [DEBUG] 선택된 테이블: {table}")  # ✅ 선택된 테이블 확인


    apartdataframe = db.get_apartments_data()

    print("부동산 데이터:",apartdataframe)

    os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY
    agent = create_pandas_dataframe_agent(
        ChatOpenAI(temperature=0,model="gpt-4o-mini"),
        apartdataframe,
        agent_type='tool-calling',
        allow_dangerous_code=True
    )

    response = agent.invoke({user_input})

    if not response["output"]:
        return "해당 조건에 맞는 데이터가 없습니다."
    
    return response["output"]

@app.route('/graph/real-estate',methods=['POST'])
def stream_graph():
    """아파트 가격 변동 그래프 생성"""
    print("📌 [DEBUG] 그래프 요청 수신됨")

    user_input = request.json.get('message')
    print(f"사용자 입력:  {user_input}")

    # 아파트 데이터 가져오기
    apartdataframe = db.get_apartments_data()

    if apartdataframe is None or apartdataframe.empty:
        return jsonify({"error": "부동산 데이터를 불러올 수 없습니다."})
    
    print("📊 [DEBUG] 불러온 아파트 데이터:\n", apartdataframe.head())

    #가격 변동 데이터를 포함하는 컬럼 선택
    price_columns = ['price_2022','price_2023','price_2024']

    year_labels=[col.replace("price_","") for col in price_columns]

    filtered_df = apartdataframe[apartdataframe['name'] == user_input]

    if filtered_df.empty:
        return jsonify({"error": f"'{user_input}'에 대한 데이터를 찾을 수 없습니다."})
    
    prices = filtered_df[price_columns].values.flatten()
    prices = [p/10000 for p in prices]

    STATIC_FOLDER = "static"
    if not os.path.exists(STATIC_FOLDER):
        os.makedirs(STATIC_FOLDER)
        print(f"📌 [DEBUG] '{STATIC_FOLDER}' 폴더 생성 완료")

    #특정 부동산 그래프 생성
    plt.figure(figsize=(8,5))
    plt.bar(year_labels, prices, color="royalblue",alpha=0.75)
    plt.title(f"{user_input} 가격 변동 추이", fontproperties="Malgun Gothic",fontsize=14)
    plt.xlabel("년도", fontproperties = "Malgun Gothic",fontsize=12)
    plt.ylabel("최고가 매매 가격(단위: 억 원)",fontproperties = "Malgun Gothic",fontsize=14)
    plt.xticks(fontproperties="Malgun Gothic", fontsize=10)  # X축 레이블 한글 적용
    plt.yticks(fontsize=10)  # Y축 숫자 크기 조정
    plt.grid(axis='y',linestyle='--',alpha=0.7)
    

    image_id = str(uuid.uuid4())
    image_path = os.path.join("static",f"{image_id}.png")
    plt.savefig(image_path)
    plt.close()

    session.clear()

    print(f"📌 [DEBUG] 그래프 저장 완료: {image_path}")
    response_data = {
    "image_url": f"http://localhost:7000/static/{image_id}.png",
    "next_step": "stream_graph",
    "response" : "해당 부동산의 2022~2024 최고가 매매 그래프입니다! 📊\n다른 궁금하신 게 있다면 요청해주세요"
    }
    print("📌 [DEBUG] 백엔드 응답 데이터:", response_data)  # ✅ 로그 추가

    return jsonify(
        response_data
        )

@app.route("/graph/deposit-saving", methods=["POST"])
def generate_graph():
    """예금 또는 적금 그래프 생성 후 이미지 파일을 반환 (세션 기반)"""

    # ✅ 세션에서 필요한 데이터 가져오기
    product_name = session.get("product_name")
    deposit_amount = session.get("deposit_amount")
    saving_amount = session.get("saving_amount")

    if not product_name:
        return jsonify({"error": "세션 데이터가 없습니다. 처음부터 다시 시뮬레이션을 시작하세요!"})

    # ✅ 예금인지 적금인지 구분
    if deposit_amount:
        product_type = "deposit"
        amount = deposit_amount
        product_data = db.get_deposit_by_name(product_name)
    elif saving_amount:
        product_type = "saving"
        amount = saving_amount
        product_data = db.get_saving_by_name(product_name)
    else:
        return jsonify({"error": "세션 데이터가 부족합니다. 다시 시도해주세요!"})

    if not product_data:
        return jsonify({"error": f"'{product_name}' 상품을 찾을 수 없습니다."})

    # ✅ 이율 및 기간 설정
    interest_rate = (product_data["deposit_base_interest_rate"] + product_data["deposit_prime_interest_rate"]) / 100 if product_type == "deposit" else \
                    (product_data["saving_base_interest_rate"] + product_data["saving_prime_interest_rate"]) / 100
    period = product_data["deposit_maturity_period"] if product_type == "deposit" else product_data["saving_maturity_period"]

    interest_type = product_data["deposit_interest_rate_type"] if product_type == "deposit" else product_data["saving_interest_rate_type"]

    # ✅ 그래프 저장 디렉토리 생성
    STATIC_FOLDER = "static"
    if not os.path.exists(STATIC_FOLDER):
        os.makedirs(STATIC_FOLDER)

    # ✅ 그래프 데이터 생성
    x = np.arange(0, period + 1, 3)
    y = []

    for m in x:
        if product_type == "deposit":
            if interest_type == "단리":
                amount_at_maturity = db.calculate_deposit_maturity(amount, interest_rate, m / 12)  # 예금 단리
            elif interest_type == "복리":
                amount_at_maturity = db.calculate_deposit_maturity_compound(amount, interest_rate, m / 12, 12)  # 예금 복리 (월 복리)
        elif product_type == "saving":
            if interest_type == "단리":
                amount_at_maturity = db.calculate_saving_maturity_simple(amount, interest_rate, m)  # 적금 단리
            elif interest_type == "복리":
                amount_at_maturity = db.calculate_saving_maturity(amount, interest_rate, m)  # 적금 복리 (월 복리)

        y.append(amount_at_maturity / 10_000)  # 단위: 만원
    
    print(f"📌 [DEBUG] 복리 적금 계산 결과 (m={m}): {amount_at_maturity}")  # 🔍 복리 계산된 값 확인
    print(f"📌 [DEBUG] interest_type: {interest_type}")  # 🔍 단리/복리 값 확인
    print(f"📌 [DEBUG] interest_type: {interest_type}")  # 🔍 단리/복리 값 확인
    print(f"📌 [DEBUG] Y축 데이터: {y}")

    


    plt.figure(figsize=(8, 5))
    plt.plot(x, y, marker='o', linestyle='-', color="blue" if product_type == "deposit" else "green")
    plt.xlabel("개월",fontproperties = "Malgun Gothic",fontsize=14)
    plt.ylabel("총 금액(기본 단위 만원)",fontproperties = "Malgun Gothic",fontsize=14)
    plt.title(f"{product_name} {'예금' if product_type == 'deposit' else '적금'} 만기 금액",fontproperties = "Malgun Gothic",fontsize=14)
    plt.legend()
    plt.grid()

    plt.xticks(np.arange(0,period + 1, 3))

    # ✅ 그래프 이미지 저장
    image_id = str(uuid.uuid4())
    image_path = os.path.join(STATIC_FOLDER, f"{image_id}.png")
    plt.savefig(image_path)
    plt.close()

    print(f"📌 [DEBUG] 그래프 저장 완료: {image_path}")

    session.clear()

    return jsonify({
    "image_url": f"http://localhost:7000/static/{image_id}.png",
    "next_step": "deposit_saving_graph",
    "response": "해당 상품의 만기 예상 그래프입니다!  📊\n다른 궁금하신 게 있다면 요청해주세요"
    })

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)


if __name__ == '__main__':
    app.run(port=7000)