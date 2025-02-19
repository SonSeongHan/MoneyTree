// LoanLimitCalculatorModal.js
import React, { useState } from 'react';
//import '../../../css/estate/fss/LoanLimitCalculatorModal.css';

const LoanLimitCalculatorModal = ({ isOpen, onClose, onCalculate }) => {
  const [formData, setFormData] = useState({
    assets: '', // 자산
    liabilities: '', // 부채
    fixedExpenses: '', // 고정지출
    fixedIncome: '', // 고정수입
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // 숫자만 입력 가능하도록
    const numberValue = value.replace(/[^0-9]/g, '');
    setFormData((prev) => ({
      ...prev,
      [name]: numberValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const parsedData = {
      assets: Number(formData.assets),
      liabilities: Number(formData.liabilities),
      fixedExpenses: Number(formData.fixedExpenses),
      fixedIncome: Number(formData.fixedIncome),
    };

    onCalculate(parsedData);
  };

  const validateForm = () => {
    if (
      !formData.assets ||
      !formData.liabilities ||
      !formData.fixedExpenses ||
      !formData.fixedIncome
    ) {
      alert('모든 항목을 입력해주세요.');
      return false;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>대출 한도 계산</h2>
        <div className="info-text">
          <h3>대출 등급 기준</h3>
          <ul>
            <li>1등급 (15억): 순자산 10억 초과 & 월 순수입 500만원 초과</li>
            <li>2등급 (10억): 순자산 5억 초과 & 월 순수입 300만원 초과</li>
            <li>3등급 (7억): 순자산 2억 초과 & 월 순수입 100만원 초과</li>
            <li>4등급 (4억): 순자산 1억 초과 & 월 순수입 50만원 초과</li>
            <li>5등급 (2억): 그 외 기준 미달</li>
          </ul>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="assets">개인 자산 (원)</label>
            <input
              type="text"
              id="assets"
              name="assets"
              value={formData.assets}
              onChange={handleChange}
              placeholder="예: 1000000000"
            />
            {formData.assets && (
              <div className="formatted-value">{Number(formData.assets).toLocaleString()}원</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="liabilities">개인 부채 (원)</label>
            <input
              type="text"
              id="liabilities"
              name="liabilities"
              value={formData.liabilities}
              onChange={handleChange}
              placeholder="예: 100000000"
            />
            {formData.liabilities && (
              <div className="formatted-value">
                {Number(formData.liabilities).toLocaleString()}원
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="fixedExpenses">월 고정지출 (원)</label>
            <input
              type="text"
              id="fixedExpenses"
              name="fixedExpenses"
              value={formData.fixedExpenses}
              onChange={handleChange}
              placeholder="예: 2000000"
            />
            {formData.fixedExpenses && (
              <div className="formatted-value">
                {Number(formData.fixedExpenses).toLocaleString()}원
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="fixedIncome">월 고정수입 (원)</label>
            <input
              type="text"
              id="fixedIncome"
              name="fixedIncome"
              value={formData.fixedIncome}
              onChange={handleChange}
              placeholder="예: 5000000"
            />
            {formData.fixedIncome && (
              <div className="formatted-value">
                {Number(formData.fixedIncome).toLocaleString()}원
              </div>
            )}
          </div>

          <div className="calculation-info">
            <p>* 순자산 = 자산 - 부채</p>
            <p>* 월 순수입 = 월 고정수입 - 월 고정지출</p>
          </div>

          <div className="modal-buttons">
            <button type="submit" className="calculate-btn">
              계산하기
            </button>
            <button type="button" onClick={onClose} className="close-btn">
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanLimitCalculatorModal;
