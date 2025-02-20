import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useFund } from '../../src/FundContext';
import SpeechToText from '../SpeechToText';

function Chatbot() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [waitingForBuildingName, setWaitingForBuildingName] = useState(false);
  const navigate = useNavigate();
  const { setSelectedFundId, setIsChatbotRequest } = useFund();

  useEffect(() => {
    fetch('http://localhost:7000/welcome')
      .then((res) => res.json())
      .then((data) => {
        if (data.response) {
          setResponse(data.response); // 🔹 배열이 아닌 문자열로 저장
        } else {
          console.error('백엔드 응답 없음');
        }
      })
      .catch((err) => console.log('초기 메시지 로딩 실패', err));
  }, []);

  useEffect(() => {
    console.log('🎯 변경된 response.type 상태:', response.type);
  }, [response]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    let apiUrl = 'http://localhost:7000/chat';

    if (message.includes('매매 정보') || message.includes('부동산 시세')) {
      apiUrl = 'http://localhost:7000/chat';
      setWaitingForBuildingName(true);
    } else if (waitingForBuildingName) {
      apiUrl = 'http://localhost:7000/graph/real-estate';
      setWaitingForBuildingName(false);
    } else if (message.includes('정보') || message.includes('기능')) {
      apiUrl = 'http://localhost:7000/info';
    } else if (
      message.includes('예금 추천') ||
      message.includes('적금 추천') ||
      message.includes('주식 추천') ||
      message.includes('펀드 추천') ||
      message.includes('예금 시뮬레이션') ||
      message.includes('적금 시뮬레이션')
    ) {
      apiUrl = 'http://localhost:7000/chat';
    } else if (
      message.includes('상세 추천') ||
      message.includes('분석') ||
      message.includes('비교')
    ) {
      apiUrl = 'http://localhost:7000/filter';
    } else if (
      message.includes('음성') ||
      message.includes('말하기') ||
      message.includes('스피치')
    ) {
      apiUrl = 'http://localhost:7000/voice-chat';
    }

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', //세션 유지 옵션
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      console.log('백엔드에서 받은 데이터', data);
      console.log('백엔드에서 받는 사진 url', data.image_url);

      if (data.next_step === 'show_graph') {
        // ✅ 예금/적금 가입 금액 입력 후, 그래프 보기 단계로 이동
        setResponse({ type: 'text', content: data.response });
      }

      if (data.next_step === 'generate_graph') {
        // ✅ 그래프 생성 요청 보내기
        await fetch('http://localhost:7000/graph/deposit-saving', {
          method: 'POST',
          credentials: 'include',
        });
      }

      if (data.image_url) {
        if (data.next_step === 'stream_graph') {
          setResponse({
            type: 'image-text',
            content: (
              <div>
                <p>{data.response}</p>
                <img
                  src={data.image_url}
                  alt="부동산 가격 변동 그래프"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            ),
          });
        } else if (data.next_step === 'deposit_saving_graph') {
          console.log('예적금 그래프 url 받아지나?', data.image_url);

          setResponse({
            type: 'image-text',
            content: (
              <div>
                <p>{data.response}</p>
                <img
                  src={data.image_url}
                  alt="예금/적금 그래프"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            ),
          });
        }
      }

      if (data.current_category) {
        sessionStorage.setItem('current_category', data.current_category);
        console.log('current_category 저장됨:', data.current_category);
      }

      if (data.top_savings) {
        sessionStorage.setItem('top_savings', data.top_savings);
        console.log('top_savings 저장됨:', data.top_savings);
      }

      if (data.top_deposits) {
        sessionStorage.setItem('top_deposits', data.top_deposits);
        console.log('top_deposits 저장됨:', data.top_deposits);
      }

      if (data.step) {
        sessionStorage.setItem('chat_step', data.step);
      }

      if (message.includes('전체 적금 상품 보기')) {
        navigate('products/deposit-saving?tab=saving');
      }

      if (message.includes('전체 예금 상품 보기')) {
        navigate('products/deposit-saving?tab=deposit');
      }

      if (message.includes('전체 펀드 상품 보기')) {
        navigate('products/fund-stock?tab=fund');
      }

      if (message.includes('전체 주식 상품 보기')) {
        navigate('products/fund-stock?tab=stock');
      }

      if (!isNaN(message.trim())) {
        // 입력이 숫자인 경우
        const productId = message.trim();
        console.log(' 챗봇이 받은 값:', productId);
        console.log('valid 프로덕트 값:', data.valid_product_ids);

        if (data.redirect_url) {
          sessionStorage.setItem('redirect_url', data.redirect_url);
        }

        // 백엔드에서 받은 유효한 상품 ID 목록과 현재 카테고리를 가져오기
        let validProductIds = data.valid_product_ids || sessionStorage.getItem('valid_product_ids');
        console.log(' 예금 또는 적금 또는 펀드의 선택된 유효한 상품 ID:', validProductIds);

        let currentCategory = data.current_category || sessionStorage.getItem('current_category');
        console.log(' 현재 카테고리:', currentCategory);

        // ✅ 첫 번째 검증
        if (validProductIds.includes(productId)) {
          console.log('✅ 포함됨! (첫 번째 검증)');
        } else {
          console.log('❌ 포함되지 않음! (첫 번째 검증)');
        }

        if (validProductIds.includes(productId)) {
          if (currentCategory === 'saving' || currentCategory === 'deposit') {
            navigate(`/${currentCategory}/${productId}`);
            console.log('주소', `/${currentCategory}/${productId}`);
          } else if (currentCategory === 'fund' || currentCategory === 'stock') {
            let redirectUrl =
              data.redirect_url || JSON.parse(sessionStorage.getItem('redirect_url'));
            console.log(' 이동 하려는 경로:', redirectUrl);
            if (redirectUrl) {
              navigate(`/${redirectUrl}&selectedFundId=${productId}`);
              setSelectedFundId(productId);
              setIsChatbotRequest(true);
            }
          }
        } else {
          setResponse({
            type: 'text',
            content: `유효한 상품 ID가 아닙니다. (${validProductIds ? validProductIds.join(', ') : '유효한 상품 없음'} 중 선택해주세요.)`,
          });
        }
      } else {
        if (!data.image_url) {
          setResponse({ type: 'text', content: data.response });
        }
      }
      setMessage('');
    } catch (error) {
      console.log('chatbot.js에서 현재 문제가 발생했습니다.');
    }
  };

  return (
    <div>
      <h2>챗봇</h2>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="질문을 입력하세요..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">보내기</button>
      </form>

      <SpeechToText
        onSend={(text) => {
          setMessage(text);
          sendMessage({ preventDefault: () => {} });
        }}
      />

      <div>
        <strong>응답:</strong>{' '}
        {response.type === 'image-text' ? (
          response.content
        ) : response.type === 'image' ? (
          <img
            src={response.content.props.src}
            alt={response.content.props.alt}
            style={response.content.props.style}
          />
        ) : (
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <span {...props} />,
            }}
          >
            {response.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default Chatbot;
