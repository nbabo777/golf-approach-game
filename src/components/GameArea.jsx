import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Target, Flag, CheckCircle, Calculator, Trash2, List } from 'lucide-react';

const GameArea = ({ game, setGame, onFinish }) => {
    const [targetYard, setTargetYard] = useState('');
    const [playerYards, setPlayerYards] = useState(
        game.players.reduce((acc, p) => ({ ...acc, [p.id]: '' }), {})
    );

    const handleYardsChange = (playerId, value) => {
        // Only allow numbers and decimals
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setPlayerYards({ ...playerYards, [playerId]: value });
        }
    };

    const calculateStage = () => {
        // Validate inputs
        if (!targetYard) {
            alert("ターゲットヤード数を入力してください");
            return;
        }

        // Separate participating and absent players
        const participatingPlayers = [];
        const absentPlayers = [];

        game.players.forEach(p => {
            const yardValue = playerYards[p.id];
            if (yardValue === '' || isNaN(parseFloat(yardValue))) {
                absentPlayers.push({
                    playerId: p.id,
                    name: p.name,
                    remainderYard: null,
                    rank: null,
                    points: 0
                });
            } else {
                participatingPlayers.push({
                    playerId: p.id,
                    name: p.name,
                    remainderYard: parseFloat(yardValue)
                });
            }
        });

        if (participatingPlayers.length === 0) {
            alert("最低でも1人のプレイヤーのヤード数を入力してください");
            return;
        }

        // Sort participating players by remaining yard (closest to hole wins)
        participatingPlayers.sort((a, b) => a.remainderYard - b.remainderYard);

        const participantCount = participatingPlayers.length;
        let currentRank = 1;

        for (let i = 0; i < participatingPlayers.length; i++) {
            if (i > 0 && participatingPlayers[i].remainderYard === participatingPlayers[i - 1].remainderYard) {
                // Tie handling: same rank as previous
                participatingPlayers[i].rank = participatingPlayers[i - 1].rank;
            } else {
                participatingPlayers[i].rank = currentRank;
            }

            // Points: (ParticipantCount - Rank)
            // Example: 3 participants. 1st gets 2pt, 2nd gets 1pt, 3rd gets 0pt.
            const points = Math.max(0, participantCount - participatingPlayers[i].rank);
            participatingPlayers[i].points = points;
            currentRank++;
        }

        // Combine results
        const stageResults = [...participatingPlayers, ...absentPlayers];

        // Update game state
        const newStage = {
            id: uuidv4(),
            targetYard: targetYardsNum,
            results: stageResults
        };

        const newPlayersData = game.players.map(p => {
            const stageRecord = stageResults.find(r => r.playerId === p.id);
            return {
                ...p,
                points: p.points + stageRecord.points
            };
        });

        const updatedGame = {
            ...game,
            players: newPlayersData,
            stages: [...game.stages, newStage]
        };

        setGame(updatedGame);

        // Reset inputs for next stage
        setTargetYard('');
        setPlayerYards(game.players.reduce((acc, p) => ({ ...acc, [p.id]: '' }), {}));
    };

    const deleteStage = (stageId) => {
        if (!window.confirm("このラウンドの記録を削除しますか？")) return;

        const stageToDelete = game.stages.find(s => s.id === stageId);
        if (!stageToDelete) return;

        // Subtract points that were given in this stage
        const newPlayersData = game.players.map(p => {
            const playerResultInStage = stageToDelete.results.find(r => r.playerId === p.id);
            const pointsToDeduct = playerResultInStage ? playerResultInStage.points : 0;
            return {
                ...p,
                points: p.points - pointsToDeduct
            };
        });

        const newStages = game.stages.filter(s => s.id !== stageId);

        setGame({
            ...game,
            players: newPlayersData,
            stages: newStages
        });
    };

    // Sort players by total points descending for the leaderboard
    const sortedPlayers = [...game.players].sort((a, b) => b.points - a.points);

    return (
        <div className="fade-in">
            {/* Current Leaderboard */}
            <div className="ios-card" style={{ background: 'linear-gradient(135deg, var(--ios-blue) 0%, #4facfe 100%)', color: 'white' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flag size={20} /> 現在の順位 (ラウンド: {game.stages.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sortedPlayers.map((p, index) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                            <span style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                                {index + 1}位 {p.name}
                            </span>
                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{p.points}pt</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ios-subtitle">次ラウンド入力</div>

            <div className="ios-card">
                {/* Target Yard Input */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', padding: '12px', background: 'var(--ios-bg)', borderRadius: '8px' }}>
                    <Target size={24} color="var(--ios-red)" style={{ marginRight: '12px' }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: 'var(--ios-text-secondary)', marginBottom: '4px' }}>打席からカップまで</div>
                        <input
                            type="number"
                            placeholder="ターゲットヤード数"
                            value={targetYard}
                            onChange={(e) => setTargetYard(e.target.value)}
                            style={{ width: '100%', fontSize: '20px', fontWeight: 'bold', border: 'none', background: 'transparent', outline: 'none', color: 'var(--ios-text)' }}
                        />
                    </div>
                    <span style={{ fontSize: '16px', color: 'var(--ios-gray)', fontWeight: 'bold' }}>yd</span>
                </div>

                {/* Player Remaining Yards Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {game.players.map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', borderBottom: '0.5px solid var(--ios-gray-light)', paddingBottom: '8px' }}>
                            <div style={{ width: '100px', fontWeight: '500' }}>{p.name}</div>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="不参加"
                                value={playerYards[p.id]}
                                onChange={(e) => handleYardsChange(p.id, e.target.value)}
                                style={{ flex: 1, fontSize: '17px', padding: '4px', border: 'none', background: 'transparent', outline: 'none', color: 'var(--ios-text)', textAlign: 'right' }}
                            />
                            <span style={{ marginLeft: '8px', color: 'var(--ios-gray)' }}>yd</span>
                        </div>
                    ))}
                </div>

                <button
                    className="ios-button"
                    onClick={calculateStage}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <Calculator size={20} />
                    ポイント計算・追加
                </button>
            </div>

            {/* Previous Stages List */}
            {game.stages.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <div className="ios-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <List size={16} /> 記録済みラウンド
                    </div>
                    <div className="ios-list">
                        {game.stages.map((stage, idx) => (
                            <div key={stage.id} className="ios-list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                                        ラウンド {idx + 1} <span style={{ color: 'var(--ios-gray)', fontWeight: 'normal', fontSize: '13px', marginLeft: '8px' }}>ターゲット: {stage.targetYard}yd</span>
                                    </div>
                                    <button
                                        onClick={() => deleteStage(stage.id)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--ios-red)', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {stage.results.map(r => (
                                        <div key={r.playerId} style={{ fontSize: '12px', background: 'var(--ios-gray-light)', padding: '2px 6px', borderRadius: '4px', opacity: r.remainderYard === null ? 0.5 : 1 }}>
                                            {r.name}: {r.remainderYard !== null ? `${r.remainderYard}yd` : '不参加'} ({r.points}pt)
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: '30px', display: 'flex', gap: '12px', paddingBottom: '40px' }}>
                <button
                    className="ios-button"
                    onClick={() => onFinish(game)}
                    disabled={game.stages.length === 0}
                    style={{ flex: 1, backgroundColor: game.stages.length === 0 ? 'var(--ios-gray)' : 'var(--ios-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <CheckCircle size={20} />
                    ゲーム終了
                </button>
            </div>
        </div>
    );
};

export default GameArea;
