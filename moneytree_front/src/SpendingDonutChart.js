import React from "react";
import { FaMoneyBillWave, FaUtensils, FaFootballBall, FaHospital, FaBus } from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

/**
 * @param {Array} data - 예: [{ name: "식사", value: 123000 }, { name: "교통", value: 50000 }, ...]
 * @param {number} total - 전체 지출 금액 (ex: 173000)
 */
function SpendingDonutChart({ data, total }) {
    // 카테고리별 고정 색상 매핑
    const colorMap = {
        "송금": "#0088FE",
        "취미": "#00C49F",
        "식사": "#FFBB28",
        "병원": "#888888",
        "교통": "#555555",
        "기타": "#AAAAAA", // 필요 시 추가
    };

    // 카테고리별 아이콘 매핑
    const iconMap = {
        "송금": <FaMoneyBillWave />,
        "식사": <FaUtensils />,
        "취미": <FaFootballBall />,
        "병원": <FaHospital />,
        "교통": <FaBus />,
    };

    // 차트 옆 범례 (왼쪽의 도넛 차트 옆에 간단한 범례)
    const renderLegend = () => (
        <div style={{ marginLeft: "20px", display:"flex" ,flexDirection:"column" , gap:"15px" }}>
            {data.map((entry, index) => {
                const ratio = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
                return (
                    <div key={`legend-item-${index}`} style={{ marginBottom: 6 }}>
            <span
                style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: colorMap[entry.name] || "#000",
                    marginRight: 6,
                }}
            />
                        <span style={{ verticalAlign: "middle" }}>
              {entry.name} : {ratio}% ({entry.value.toLocaleString()}원)
            </span>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                maxWidth: "1200px",
            }}
        >
            {/* 왼쪽: 도넛 차트와 간단한 범례 */}
            <div style={{ display: "flex", alignItems: "center" }}>
                <ResponsiveContainer width={300} height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            innerRadius={70}
                            fill="transparent"
                            paddingAngle={2}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colorMap[entry.name] || "#000"} />
                            ))}
                        </Pie>
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontSize: "16px", fontWeight: "bold" }}
                        >
                            {`${total.toLocaleString()} 원 지출`}
                        </text>
                    </PieChart>
                </ResponsiveContainer>
                {renderLegend()}
            </div>

            {/* 오른쪽: 동적으로 받아온 데이터를 사용하여 상세 리스트 렌더링 */}
            <div style={{ padding: "20px" }}>
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {data.map((item, index) => {
                        const ratio = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
                        return (
                            <li
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "15px 20px",
                                    borderBottom: "1px solid #e0e0e0",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <div
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            backgroundColor: "#f0f0f0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "18px",
                                        }}
                                    >
                                        {iconMap[item.name] || <span>?</span>}
                                    </div>
                                    <div
                                        style={{
                                            marginLeft: "40px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px",
                                        }}
                                    >
                                        <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                                            {item.name}
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#888" }}>
                                            {ratio}% | {item.value.toLocaleString()}원
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: "18px", color: "#bbb", marginLeft: "10px" }}>➔</div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export default SpendingDonutChart;
