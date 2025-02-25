// 색상을 하드코딩한 AssetDistributionChart.js
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

// 고정 색상 배열 정의
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

// props로 마이페이지에서 가져온 데이터를 받도록 수정
const AssetDistributionChart = ({
                                    depositAccounts,
                                    savingAccounts,
                                    fundAccounts,
                                    stockHoldings,
                                    stockAccount
                                }) => {
    // 상태 추가
    const [assetData, setAssetData] = useState(null);

    // 금액 포맷팅 함수
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // 마운트될 때 데이터 계산
    useEffect(() => {
        const data = calculateAssetData();
        setAssetData(data);
    }, [depositAccounts, savingAccounts, fundAccounts, stockHoldings, stockAccount]);

    // 각 자산 유형별 총액 계산
    const calculateAssetData = () => {
        try {
            // 입출금 계좌 잔액 (주식 계좌 잔액 사용)
            const dandwacBalance = parseFloat(stockAccount?.stockAccountBalance || 0);

            // 예금 계좌 총액
            const depositBalance = Array.isArray(depositAccounts) ? depositAccounts.reduce((sum, account) => {
                const amount = parseFloat(account?.depositAmount || 0);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0) : 0;

            // 적금 계좌 총액
            const savingBalance = Array.isArray(savingAccounts) ? savingAccounts.reduce((sum, account) => {
                const amount = parseFloat(account?.savingDepositAmount || 0);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0) : 0;

            // 펀드 계좌 총액
            const fundBalance = Array.isArray(fundAccounts) ? fundAccounts.reduce((sum, account) => {
                const amount = parseFloat(account?.fundInvestmentAmount || 0);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0) : 0;

            // 주식 보유 가치
            const stockBalance = Array.isArray(stockHoldings) ? stockHoldings.reduce((sum, holding) => {
                const quantity = parseFloat(holding?.stockHoldingQuantity || 0);
                const price = parseFloat(holding?.stockClosingPrice || 0);
                return sum + (isNaN(quantity) || isNaN(price) ? 0 : quantity * price);
            }, 0) : 0;

            // 대출 금액 (더미 데이터)
            const loanBalance = -5000000; // 음수로 표시

            // 총 자산
            const totalAssets = dandwacBalance + depositBalance + savingBalance + fundBalance + stockBalance;
            const netAssets = totalAssets + loanBalance; // 대출은 이미 음수

            // 백분율 계산 함수
            const calculatePercentage = (value, total) => {
                if (!total || total === 0) return 0;
                return parseFloat(((value / total) * 100).toFixed(1));
            };

            // 자산 분포 데이터
            const assetDistribution = [
                {
                    name: '입출금',
                    value: Math.max(dandwacBalance, 1), // 최소값 1로 설정하여 항상 표시
                    ratio: calculatePercentage(dandwacBalance, totalAssets)
                },
                {
                    name: '예금',
                    value: Math.max(depositBalance, 1),
                    ratio: calculatePercentage(depositBalance, totalAssets)
                },
                {
                    name: '적금',
                    value: Math.max(savingBalance, 1),
                    ratio: calculatePercentage(savingBalance, totalAssets)
                },
                {
                    name: '펀드',
                    value: Math.max(fundBalance, 1),
                    ratio: calculatePercentage(fundBalance, totalAssets)
                },
                {
                    name: '주식',
                    value: Math.max(stockBalance, 1),
                    ratio: calculatePercentage(stockBalance, totalAssets)
                }
            ];

            const result = {
                totalAssets,
                netAssets,
                assetDistribution,
                details: {
                    dandwacBalance,
                    depositBalance,
                    savingBalance,
                    fundBalance,
                    stockBalance,
                    loanBalance
                }
            };

            return result;
        } catch (error) {
            console.error('자산 데이터 계산 중 오류 발생:', error);
            return {
                totalAssets: 0,
                netAssets: 0,
                assetDistribution: [],
                details: {}
            };
        }
    };

    // 데이터가 로드되지 않았을 때
    if (!assetData) {
        return (
            <div className="w-full max-w-2xl mx-auto flex justify-center py-10">
                <div className="text-center">자산 정보를 계산하는 중...</div>
            </div>
        );
    }

    // 커스텀 툴팁 컴포넌트
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ fontWeight: 'bold', margin: '0' }}>{data.name}</p>
                    <p style={{ margin: '0' }}>{formatCurrency(data.value)}</p>
                    <p style={{ margin: '0' }}>{data.ratio}%</p>
                </div>
            );
        }
        return null;
    };

    // 커스텀 도트와 텍스트 색상을 적용한 범례
    const renderColorfulLegendText = (value, entry, index) => {
        const { payload } = entry;
        return (
            <span style={{ color: COLORS[index % COLORS.length], fontWeight: 'bold' }}>
        {value}
      </span>
        );
    };

    // 디버깅용 색상 정보
    console.log('사용된 색상 배열:', COLORS);
    console.log('자산 데이터:', assetData.assetDistribution);

    return (
        <div className="w-full max-w-2xl mx-auto py-8">
            <div className="flex justify-center w-full">
                <PieChart width={500} height={300}>
                    <Pie
                        data={assetData.assetDistribution}
                        cx={250}
                        cy={120}
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                        isAnimationActive={false}
                        startAngle={90}
                        endAngle={-270}
                    >
                        {assetData.assetDistribution.map((entry, index) => {
                            // 명시적으로 색상 표시
                            console.log(`${entry.name} 색상: ${COLORS[index % COLORS.length]}`);
                            return (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="#fff"
                                    strokeWidth={2}
                                />
                            );
                        })}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        iconType="circle"
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        formatter={renderColorfulLegendText}
                    />
                </PieChart>
            </div>
        </div>
    );
};

export default AssetDistributionChart;