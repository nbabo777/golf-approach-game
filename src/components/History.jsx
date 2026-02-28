import React, { useMemo } from 'react';
import { History as HistoryIcon, User as UserIcon, Calendar, Trophy, ChevronRight, Trash2 } from 'lucide-react';

const History = ({ history, onViewPlayerHistory, onDeleteGame }) => {
    // Extract all unique player names from all games
    const allPlayers = useMemo(() => {
        const playersMap = new Map();
        history.forEach(game => {
            game.players.forEach(p => {
                if (!playersMap.has(p.name)) {
                    playersMap.set(p.name, {
                        name: p.name,
                        gamesPlayed: 0,
                        totalPoints: 0,
                        wins: 0
                    });
                }

                const stats = playersMap.get(p.name);
                stats.gamesPlayed += 1;
                stats.totalPoints += p.points;

                // Check if player won this game (highest points)
                const highestScore = Math.max(...game.players.map(pl => pl.points));
                if (p.points === highestScore && highestScore > 0) {
                    stats.wins += 1;
                }
            });
        });

        return Array.from(playersMap.values()).sort((a, b) => b.gamesPlayed - a.gamesPlayed);
    }, [history]);

    if (!history || history.length === 0) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', marginTop: '60px', color: 'var(--ios-gray)' }}>
                <HistoryIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>履歴がありません</h3>
                <p style={{ fontSize: '15px' }}>ゲームをプレイして結果を保存しましょう</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="ios-subtitle">プレイヤー別サマリー</div>
            <div className="ios-list">
                {allPlayers.map((player) => (
                    <div
                        key={player.name}
                        className="ios-list-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onViewPlayerHistory(player.name)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '20px',
                                backgroundColor: 'var(--ios-gray-light)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <UserIcon size={20} color="var(--ios-blue)" />
                            </div>
                            <div>
                                <div style={{ fontSize: '17px', fontWeight: 'bold' }}>{player.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--ios-text-secondary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                    <span>{player.gamesPlayed}試合</span>
                                    <span>{player.wins}勝</span>
                                    <span>平均 {(player.totalPoints / player.gamesPlayed).toFixed(1)}pt</span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={20} color="var(--ios-gray)" />
                    </div>
                ))}
            </div>

            <div className="ios-subtitle" style={{ marginTop: '32px' }}>最近の対決</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {history.map((game, idx) => {
                    // Find winner(s)
                    const maxPoints = Math.max(...game.players.map(p => p.points));
                    const winners = game.players.filter(p => p.points === maxPoints).map(p => p.name);

                    return (
                        <div key={game.id || idx} className="ios-card" style={{ marginBottom: 0, padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--ios-gray)' }}>
                                        <Calendar size={14} />
                                        {new Date(game.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div style={{ display: 'inline-block', marginTop: '4px', fontSize: '12px', fontWeight: 'bold', color: 'var(--ios-blue)', background: 'rgba(0,122,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                                        {game.stages.length} ラウンド
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDeleteGame(game.id)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--ios-red)', cursor: 'pointer', padding: '4px' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Trophy size={16} color="#FFD700" />
                                <span style={{ fontSize: '15px', fontWeight: 'bold' }}>
                                    勝者: {winners.join(', ')} ({maxPoints}pt)
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {game.players.map(p => (
                                    <div key={p.id} style={{ fontSize: '13px', color: 'var(--ios-text-secondary)', background: 'var(--ios-gray-light)', padding: '4px 8px', borderRadius: '4px' }}>
                                        {p.name}: {p.points}pt
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default History;
