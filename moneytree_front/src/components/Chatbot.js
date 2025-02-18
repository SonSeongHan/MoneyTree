import React, { useState } from 'react';
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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    let apiUrl = 'http://localhost:5000/chat';

    if (message.includes('매매 정보') || message.includes('부동산 시세')) {
      apiUrl = 'http://localhost:5000/info';
      setWaitingForBuildingName(true);
    } else if (waitingForBuildingName) {
      apiUrl = 'http://localhost:5000/graph';
      setWaitingForBuildingName(false);
    } else if (message.includes('정보') || message.includes('기능')) {
      apiUrl = 'http://localhost:5000/info';
    } else if (
      message.includes('예금 추천') ||
      message.includes('적금 추천') ||
      message.includes('주식 추천') ||
      message.includes('펀드 추천')
    ) {
      apiUrl = 'http://localhost:5000/chat';
    } else if (
      message.includes('상세 추천') ||
      message.includes('분석') ||
      message.includes('비교')
    ) {
      apiUrl = 'http://localhost:5000/filter';
    } else if (
      message.includes('음성') ||
      message.includes('말하기') ||
      message.includes('스피치')
    ) {
      apiUrl = 'http://localhost:5000/voice-chat';
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

      if (data.image_url) {
        console.log('입력한 부동산의 가격 변동 그래프 png:', data.image_url);
        setResponse({
          type: 'image',
          content: (
            <img
              src={data.image_url}
              alt="부동산 가격 변동 그래프"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          ),
        });
      } else {
        setResponse({ type: 'text', content: data.response });
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

        if (data.redirect_url) {
          sessionStorage.setItem('redirect_url', data.redirect_url);
        }

        // 백엔드에서 받은 유효한 상품 ID 목록과 현재 카테고리를 가져오기
        let validProductIds =
          data.valid_product_ids || JSON.parse(sessionStorage.getItem('valid_product_ids'));
        let currentCategory = data.current_category || sessionStorage.getItem('current_category');
        let redirectUrl = data.redirect_url || JSON.parse(sessionStorage.getItem('redirect_url'));

        console.log(' 입력된 상품 ID:', productId);
        console.log(' 예금 또는 적금 또는 펀드의 선택된 유효한 상품 ID:', validProductIds);
        console.log(' 현재 카테고리:', currentCategory);
        console.log(' 이동 하려는 경로:', redirectUrl);

        if (validProductIds.includes(productId)) {
          if (currentCategory === 'saving' || currentCategory === 'deposit') {
            navigate(`/${currentCategory}/${productId}`);
          } else if (currentCategory === 'fund' || currentCategory === 'stock') {
            if (redirectUrl) {
              navigate(`/${redirectUrl}&selectedFundId=${productId}`);
              setSelectedFundId(productId);
              setIsChatbotRequest(true);
            }
          }
        } else {
          setResponse(
            `유효한 상품 ID가 아닙니다. (${validProductIds ? validProductIds.join(', ') : '유효한 상품 없음'} 중 선택해주세요.)`,
          );
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
        {response.type === 'image' ? (
          response.content
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
