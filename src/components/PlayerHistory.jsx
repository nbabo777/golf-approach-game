import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, User as UserIcon, TrendingDown, Target, Award } from 'lucide-react';

const PlayerHistory = ({ playerName, history, onBack }) => {
    // Filter games where this player participated and prepare chart data
    const { playerGames, chartData, stats } = useMemo(() => {
        // 1. Filter games
        const games = history.filter(g => g.players.some(p => p.name === playerName));

        // Sort games chronologically (oldest to newest for chart)
        const sortedGames = [...games].sort((a, b) => new Date(a.date) - new Date(b.date));

        // 2. Prepare chart data & stats
        let totalPoints = 0;
        let totalRounds = 0;
        let totalYards = 0;
        let wins = 0;

        const data = sortedGames.map((game, index) => {
            const playerRecord = game.players.find(p => p.name === playerName);

            // Calculate average remain yard for this game
            let gameYards = 0;
            let playedStages = 0; // Counter for stages the player actually participated in for this game
            game.stages.forEach(stage => {
                const playerResult = stage.results.find(r => r.playerId === playerRecord.id);
                if (playerResult && playerResult.remainderYard !== null) { // Only count if player participated and has a valid yardage
                    gameYards += playerResult.remainderYard;
                    playedStages += 1;

                    // Accumulate for overall stats as well
                    totalYards += playerResult.remainderYard;
                    totalRounds += 1;
                }
            });

            const avgGameYard = playedStages > 0 ? (gameYards / playedStages) : 0;
            totalPoints += playerRecord.points; // Accumulate total points for average calculation

            // Check win
            const maxPoints = Math.max(...game.players.map(p => p.points));
            if (playerRecord.points === maxPoints && maxPoints > 0) wins += 1;

            return {
                name: `Game ${index + 1}`,
                date: new Date(game.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
                points: playerRecord.points, // Points for this specific game
                avgYard: parseFloat(avgGameYard.toFixed(1))
            };
        });

        return {
            playerGames: sortedGames,
            chartData: data,
            stats: {
                gamesPlayed: games.length,
                wins,
                winRate: games.length > 0 ? (wins / games.length * 100).toFixed(1) : 0,
                avgPoints: games.length > 0 ? (totalPoints / games.length).toFixed(1) : 0,
                overallAvgYard: totalRounds > 0 ? (totalYards / totalRounds).toFixed(1) : 0
            }
        };
    }, [history, playerName]);

    return (
        <div className="fade-in">
            {/* Header action */}
            <button
                onClick={onBack}
                style={{
                    background: 'transparent', border: 'none', color: 'var(--ios-blue)',
                    fontSize: '17px', display: 'flex', alignItems: 'center', gap: '4px',
                    marginBottom: '20px', padding: '8px 0', cursor: 'pointer'
                }}
            >
                <ArrowLeft size={20} />
                履歴一覧に戻る
            </button>

            {/* Player Profile Summary */}
            <div className="ios-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '40px',
                    backgroundColor: 'rgba(0,122,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px'
                }}>
                    <UserIcon size={40} color="var(--ios-blue)" />
                </div>
                <h2 className="ios-title" style={{ marginBottom: '24px' }}>{playerName}</h2>

                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ flex: 1, backgroundColor: 'var(--ios-bg)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                        <Award size={20} color="#FFD700" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '13px', color: 'var(--ios-text-secondary)' }}>勝率</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.winRate}%</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'var(--ios-bg)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                        <Target size={20} color="var(--ios-red)" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '13px', color: 'var(--ios-text-secondary)' }}>平均獲得pt</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.avgPoints}</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'var(--ios-bg)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                        <TrendingDown size={20} color="var(--ios-green)" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '13px', color: 'var(--ios-text-secondary)' }}>平均残りyd</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.overallAvgYard}</div>
                    </div>
                </div>
            </div>

            <div className="ios-subtitle">成長グラフ（平均残りヤード数推移）</div>
            {chartData.length > 1 ? (
                <div className="ios-card" style={{ padding: '16px 8px 16px 0' }}>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--ios-border)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--ios-gray)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis allowDecimals={true} stroke="var(--ios-gray)" fontSize={12} tickLine={false} axisLine={false} width={30} reversed={true} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value} yd`, '平均残りヤード']}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="avgYard"
                                    name="平均残りyd"
                                    stroke="var(--ios-green)"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--ios-gray)', marginTop: '8px' }}>
                        ※下に行くほど(ヤード数が少ないほど)成績が良いことを表します
                    </p>
                </div>
            ) : (
                <div className="ios-card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ios-gray)' }}>
                    グラフを表示するには、2回以上のゲームデータが必要です。
                </div>
            )}

            <div className="ios-subtitle">ゲーム別獲得ポイント推移</div>
            {chartData.length > 1 ? (
                <div className="ios-card" style={{ padding: '16px 8px 16px 0' }}>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--ios-border)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--ios-gray)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis allowDecimals={false} stroke="var(--ios-gray)" fontSize={12} tickLine={false} axisLine={false} width={30} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value} pt`, '獲得ポイント']}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="points"
                                    name="獲得ポイント"
                                    stroke="var(--ios-blue)"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : null}

        </div>
    );
};

export default PlayerHistory;
