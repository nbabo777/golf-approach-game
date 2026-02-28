import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Users, UserPlus, X, Play } from 'lucide-react';

const Home = ({ onStartGame }) => {
    const [playerCount, setPlayerCount] = useState(3);
    const [players, setPlayers] = useState([
        { id: uuidv4(), name: 'プレイヤー1' },
        { id: uuidv4(), name: 'プレイヤー2' },
        { id: uuidv4(), name: 'プレイヤー3' }
    ]);

    const handlePlayerCountChange = (e) => {
        const count = parseInt(e.target.value) || 0;
        setPlayerCount(count);

        // Adjust players array size based on count
        if (count > players.length) {
            const newPlayers = [...players];
            for (let i = players.length; i < count; i++) {
                newPlayers.push({ id: uuidv4(), name: `プレイヤー${i + 1}` });
            }
            setPlayers(newPlayers);
        } else if (count < players.length && count > 0) {
            setPlayers(players.slice(0, count));
        }
    };

    const updatePlayerName = (index, newName) => {
        const updatedPlayers = [...players];
        updatedPlayers[index].name = newName;
        setPlayers(updatedPlayers);
    };

    const removePlayer = (index) => {
        if (players.length <= 2) return; // Minimum 2 players
        const updatedPlayers = players.filter((_, i) => i !== index);
        setPlayers(updatedPlayers);
        setPlayerCount(updatedPlayers.length);
    };

    const addPlayer = () => {
        const newCount = players.length + 1;
        setPlayers([...players, { id: uuidv4(), name: `プレイヤー${newCount}` }]);
        setPlayerCount(newCount);
    };

    const handleStart = () => {
        // Validate
        if (players.length < 2) {
            alert("最低2人のプレイヤーが必要です");
            return;
        }
        if (players.some(p => p.name.trim() === '')) {
            alert("すべてのプレイヤー名を入力してください");
            return;
        }

        onStartGame(players);
    };

    return (
        <div className="fade-in">
            <div className="ios-card">
                <h2 className="ios-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={24} color="var(--ios-blue)" />
                    ゲーム設定
                </h2>

                <div className="ios-input-group">
                    <div className="ios-input-row">
                        <label>参加人数</label>
                        <input
                            type="number"
                            value={playerCount}
                            onChange={handlePlayerCountChange}
                            min="2"
                            max="10"
                        />
                    </div>
                </div>
            </div>

            <div className="ios-subtitle">プレイヤー名</div>

            <div className="ios-list">
                {players.map((player, index) => (
                    <div key={player.id} className="ios-list-item">
                        <input
                            type="text"
                            value={player.name}
                            onChange={(e) => updatePlayerName(index, e.target.value)}
                            placeholder={`プレイヤー${index + 1}`}
                            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '17px', outline: 'none', color: 'var(--ios-text)' }}
                        />
                        {players.length > 2 && (
                            <button
                                className="ios-delete-button"
                                onClick={() => removePlayer(index)}
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                className="ios-button secondary"
                onClick={addPlayer}
                style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <UserPlus size={20} />
                プレイヤーを追加
            </button>

            <button
                className="ios-button"
                onClick={handleStart}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <Play fill="white" size={20} />
                対決スタート
            </button>
        </div>
    );
};

export default Home;
