import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import SpeechToText from '../SpeechToText';
import '../css/chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([]); // ✅ 수정됨
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [waitingForBuildingName, setWaitingForBuildingName] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // messages가 업데이트될 때마다 실행



  //첫 진입 시, welcome 메시지를 받아서 `messages` 배열에 저장
  useEffect(() => {
    fetch('http://localhost:7000/welcome')
      .then((res) => res.json())
      .then((data) => {
        if (data.response) {
          // 백엔드에서 data.response가 { type: 'text', content: '...' } 형태라 가정
          // 혹은 단순 문자열일 수도 있으므로 분기 처리
          if (
            typeof data.response === 'object' &&
            data.response.type &&
            data.response.content
          ) {
            setMessages((prev) => [
              ...prev,
              {
                role: 'bot',            // 누가 말했는지
                type: data.response.type,
                content: data.response.content,
              },
            ]);
          } else if (typeof data.response === 'string') {
            setMessages((prev) => [
              ...prev,
              {
                role: 'bot',
                type: 'text',
                content: data.response,
              },
            ]);
          }
        } else {
          console.error('백엔드 응답 없음');
        }
      })
      .catch((err) => console.log('초기 메시지 로딩 실패', err));
  }, []);

  // ▼ 챗봇 열기/닫기 버튼
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };


  // ▼ (4) 메시지를 전송하는 함수
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // 사용자가 입력한 메시지를 바로 대화 기록에 추가 (유저 메시지)
    setMessages((prev) => [
      ...prev,
      { role: 'user', type: 'text', content: message },
    ]);

    let apiUrl = 'http://localhost:7000/chat';

    // ▼ (기존 로직 그대로 유지: apiUrl 분기)
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

      setMessages((prev) => [
        ...prev,
        { role: 'bot', type: 'text', content: data.response },
      ]);

      const data = await res.json();
      console.log('백엔드에서 받은 데이터', data);
      console.log('백엔드에서 받는 사진 url', data.image_url);

      // ▼ (기존 로직) next_step, image_url 등 처리
      if (data.next_step === 'show_graph') {
        // 예금/적금 가입 금액 입력 후, 그래프 보기 단계
        // setResponse({ type: 'text', content: data.response });
        setMessages((prev) => [
          ...prev,
          { role: 'bot', type: 'text', content: data.response },
        ]);
      }

      if (data.next_step === 'generate_graph') {
        // 그래프 생성
        await fetch('http://localhost:7000/graph/deposit-saving', {
          method: 'POST',
          credentials: 'include',
        });
      }

      // ▼ 이미지 url이 있으면 'image-text' 형태로 저장
      if (data.image_url) {
        if (data.next_step === 'stream_graph') {
          setMessages((prev) => [
            ...prev,
            {
              role: 'bot',
              type: 'image-text',
              content: data.response,
              imageUrl: data.image_url,
            },
          ]);
        } else if (data.next_step === 'deposit_saving_graph') {
          console.log('예적금 그래프 url?', data.image_url);
          setMessages((prev) => [
            ...prev,
            {
              role: 'bot',
              type: 'image-text',
              content: data.response,
              imageUrl: data.image_url,
            },
          ]);
        }
      }

      // ▼ (기존: 세션스토리지 저장 로직)
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

      // ▼ (기존: 특정 키워드 입력 시 navigate)
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

      // ▼ (기존: 숫자 입력 시 상품 상세 이동)
      if (!isNaN(message.trim())) {
        const productId = message.trim();
        console.log('챗봇이 받은 값:', productId);
        console.log('valid 프로덕트 값:', data.valid_product_ids);

        if (data.redirect_url) {
          sessionStorage.setItem('redirect_url', data.redirect_url);
        }

        let validProductIds =
          data.valid_product_ids || sessionStorage.getItem('valid_product_ids');
        console.log('유효한 상품 ID:', validProductIds);

        let currentCategory =
          data.current_category || sessionStorage.getItem('current_category');
        console.log('현재 카테고리:', currentCategory);

        if (validProductIds.includes(productId)) {
          console.log('✅ 포함됨! (첫 번째 검증)');
          if (currentCategory === 'saving' || currentCategory === 'deposit') {
            navigate(`/${currentCategory}/${productId}`);
            console.log('주소', `/${currentCategory}/${productId}`);
          }
        } else {
          // ▼ 유효하지 않은 상품 ID면 봇 메시지로 안내
          setMessages((prev) => [
            ...prev,
            {
              role: 'bot',
              type: 'text',
              content: `유효한 상품 ID가 아닙니다. (${
                validProductIds ? validProductIds.join(', ') : '유효한 상품 없음'
              } 중 선택해주세요.)`,
            },
          ]);
        }
      } else {
        // ▼ (기존) image_url이 없으면 텍스트 답변 처리
        if (!data.image_url) {
          setMessages((prev) => [
            ...prev,
            { role: 'bot', type: 'text', content: data.response },
          ]);
        }
      }

      // 전송 후 입력창 초기화
      setMessage('');

      // ▼ 전송 후 바로 포커스 부여
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.log('chatbot.js에서 현재 문제가 발생했습니다.', error);
    }
  };

  // (중요) 음성 입력 처리: SpeechToText에서 { text, role } 형태로 넘어옴
  const handleSpeechInput = ({ text, role }) => {
    // 그대로 messages에 추가
    setMessages((prev) => [...prev, { role, type: 'text', content: text }]);

    // 만약 role이 'user'라면 → 서버에 POST로 처리하고 싶다면?
    if (role === 'user') {
      // sendMessage와 유사 로직
      // 1) message state에 넣고, 2) auto-submit
      setMessage(text);
      // 여긴 sendMessage(e)와 동일하게 처리하되, event 객체가 없으니 약간 응용 필요
      // 간단한 방법은 setTimeout으로 살짝 지연, 또는 함수로 분리
      setTimeout(() => {
        postToServerAsUser(text);
      }, 0);
    }
  };

  // "음성 인식으로 입력된 텍스트"를 서버에 전달하는 함수
  const postToServerAsUser = async (userText) => {
    try {
      const res = await fetch('http://localhost:7000/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();

      // bot 응답 메시지
      setMessages((prev) => [
        ...prev,
        { role: 'bot', type: 'text', content: data.response },
      ]);

      // 입력창 비우기
      setMessage('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('음성 입력 시 서버 전송 오류:', error);
    }
  };

  return (
    <>
      <button className="chat-icon" onClick={toggleChatbot}>
        💬
      </button>

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">머니트리 💬 AI 챗봇</div>

          {/* ▼ (6) messages 배열을 순회하여 모든 대화 렌더링 */}
          <div className="chatbot-messages" ref={chatContainerRef}>
            {messages.map((msg, index) => {
              // 봇 메시지일 경우(bot), 사용자 메시지(user)일 경우 분기
              const isBot = msg.role === 'bot';
              return (
                <div
                  key={index}
                  className={`chatbot-message ${isBot ? 'bot' : 'user'}`}
                >
                  {/* 이미지+텍스트 / 이미지 / 텍스트 */}
                  {msg.type === 'image-text' && msg.imageUrl ? (
                    <div>
                      <p>{msg.content}</p>
                      <img
                        src={msg.imageUrl}
                        alt="이미지"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                  ) : msg.type === 'image' ? (
                    <img
                      src={msg.content}
                      alt="이미지"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => <span {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              );
            })}
          </div>

          {/* ▼ 메시지 입력창 및 전송 버튼 */}
          <form className="chatbot-input-container" onSubmit={sendMessage}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="질문을 입력하세요..."
              value={message}
              ref={inputRef}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="chatbot-send-button">
              보내기
            </button>

            {/* ▼ (7) 음성 입력: onSend에 handleSpeechInput으로 연결 */}
            <SpeechToText
              onSend={(text) => {
                handleSpeechInput(text);
              }}
            />
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
