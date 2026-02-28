import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Home, Calendar } from 'lucide-react';

// Common colors for charts
const COLORS = ['#007AFF', '#34C759', '#FF3B30', '#FF9500', '#5856D6', '#FF2D55'];

const GameResult = ({ game, onBackHome }) => {
    // Sort players by total points
    const sortedPlayers = [...game.players].sort((a, b) => b.points - a.points);

    // Format data for the chart (Per-round Points)
    const chartData = useMemo(() => {
        return game.stages.map((stage, index) => {
            const dataPoint = { name: `R${index + 1}` };
            stage.results.forEach(r => {
                dataPoint[r.playerId] = r.points;
            });
            return dataPoint;
        });
    }, [game]);

    return (
        <div className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Trophy size={48} color="#FFD700" style={{ marginBottom: '8px' }} />
                <h2 className="ios-title" style={{ marginBottom: '4px' }}>最終結果</h2>
                <div style={{ color: 'var(--ios-gray)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    {new Date(game.date).toLocaleDateString('ja-JP')}
                </div>
            </div>

            <div className="ios-subtitle">最終順位</div>
            <div className="ios-list">
                {sortedPlayers.map((player, index) => (
                    <div key={player.id} className="ios-list-item" style={{
                        backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                        borderLeft: index === 0 ? '4px solid #FFD700' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--ios-gray)'
                            }}>
                                {index + 1}
                            </span>
                            <span style={{ fontSize: '17px', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                                {player.name}
                            </span>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            {player.points}<span style={{ fontSize: '12px', color: 'var(--ios-gray)', marginLeft: '4px', fontWeight: 'normal' }}>pt</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="ios-subtitle" style={{ marginTop: '24px' }}>ラウンド別 獲得ポイント推移</div>
            <div className="ios-card" style={{ padding: '16px 8px 16px 0' }}>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--ios-border)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--ios-gray)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} stroke="var(--ios-gray)" fontSize={12} tickLine={false} axisLine={false} width={30} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#000' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                            {game.players.map((player, index) => (
                                <Line
                                    key={player.id}
                                    type="monotone"
                                    dataKey={player.id}
                                    name={player.name}
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <button
                className="ios-button"
                onClick={onBackHome}
                style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <Home size={20} />
                ホームに戻る
            </button>
        </div>
    );
};

export default GameResult;
