import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SpeechToText = ({ onSend }) => {
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  let timeoutId = null;

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'ko-KR'; // 한국어 설정
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log('🎤 음성 인식 시작');
  };

  recognition.onresult = async (event) => {
    clearTimeout(timeoutId);
    setIsListening(false);

    const transcript = event.results[0][0].transcript;
    console.log(`🎤 인식된 텍스트: ${transcript}`);

    onSend({ text: transcript, role: 'user' });

    // ✅ Flask API 호출하여 음성 인식된 질문을 챗봇으로 전달
    try {
      const response = await fetch('http://localhost:7000/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: transcript }),
      });

      const data = await response.json();
      const url = data.response.voice_redirect_urls;
      const botText = data.response;
      console.log('스피치 투 텍스트가 받은 데이터에서 챗봇이 해야할 답변:', botText);

      if (url) {
        console.log('자동 이동:', url);
        navigate(url);
        return;
      }

      if (botText.includes('사용자 예산 및 관심사에 맞춰 적절한 취미 활동을 추천해드리겠습니다!')){
        console.log('음성 입력 다시 활성화');
        handleSpeechRecognition();
      }

    } catch (error) {
      console.error('음성 API 오류:', error);
      console.log('❌ 오류 발생! 다시 시도하세요.');
    }
  };

  recognition.onerror = (event) => {
    console.error('음성 인식 오류:', event.error);
    setIsListening(false);
    onSend({text:'❌ 음성 인식 실패, 다시 시도하세요.',role:'bot'});
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  const handleSpeechRecognition = async () => {
    if (isListening) {
      recognition.stop();
      clearTimeout(timeoutId);
      console.log('음성 인식 중지됨');
    } else {
      recognition.start();
      timeoutId = setTimeout(() => {
        recognition.stop();
        console.log({text:'⏳ 입력 시간 초과',role:'bot'});
      }, 5000); // 초 동안 입력 없으면 자동 중지
    }
    setIsListening(!isListening);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleSpeechRecognition}
        className={`px-4 py-2 rounded-lg text-white ${isListening ? 'bg-red-500' : 'bg-blue-500'} transition`}
      >
        {isListening ? '🎤OFF' : '🎤ON'}
      </button>
    </div>
  );
};

export default SpeechToText;
