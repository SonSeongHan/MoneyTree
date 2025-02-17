import React, { useState } from 'react';

const SpeechToText = ({ onSend }) => {
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState('음성을 말하세요...');
  let timeoutId = null;

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'ko-KR'; // 한국어 설정
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => {
    setStatusMessage('🎤 음성 인식 중...');
  };

  recognition.onresult = async (event) => {
    clearTimeout(timeoutId);
    const transcript = event.results[0][0].transcript;
    setIsListening(false);
    setStatusMessage('✅ 인식 완료!');

    // ✅ Flask API 호출하여 음성 인식된 질문을 챗봇으로 전달
    try {
      const response = await fetch('http://localhost:5000/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript }),
      });

      const data = await response.json();
      onSend(data.response); // 챗봇 응답을 부모 컴포넌트(예: Chatbot)로 전달
    } catch (error) {
      console.error('음성 API 오류:', error);
      setStatusMessage('❌ 오류 발생! 다시 시도하세요.');
    }
  };

  recognition.onerror = (event) => {
    console.error('음성 인식 오류:', event.error);
    setIsListening(false);
    setStatusMessage('❌ 음성 인식 실패, 다시 시도하세요.');
  };

  recognition.onend = () => {
    setStatusMessage('음성을 말하세요...');
  };

  const handleSpeechRecognition = () => {
    if (isListening) {
      recognition.stop();
      clearTimeout(timeoutId);
      setStatusMessage('음성 인식 중지됨');
    } else {
      recognition.start();
      timeoutId = setTimeout(() => {
        recognition.stop();
        setStatusMessage('⏳ 입력 시간 초과');
      }, 2000); // 2초 동안 입력 없으면 자동 중지
    }
    setIsListening(!isListening);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleSpeechRecognition}
        className={`px-4 py-2 rounded-lg text-white ${isListening ? 'bg-red-500' : 'bg-blue-500'} transition`}
      >
        {isListening ? '음성 인식 중지' : '음성 인식 시작'}
      </button>
      <p className="mt-2 text-lg font-medium">{statusMessage}</p>
    </div>
  );
};

export default SpeechToText;
