import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, Flag, History as HistoryIcon, User as UserIcon } from 'lucide-react';
import Home from './components/Home';
import GameArea from './components/GameArea';
import GameResult from './components/GameResult';
import History from './components/History';
import PlayerHistory from './components/PlayerHistory';

// Simple router-like state management
function App() {
    const [currentTab, setCurrentTab] = useState('home');
    const [activeGame, setActiveGame] = useState(null);
    const [historyItems, setHistoryItems] = useState([]);
    const [selectedPlayerForHistory, setSelectedPlayerForHistory] = useState(null);

    // Load history from localStorage on first render
    useEffect(() => {
        const saved = localStorage.getItem('golfGameHistory');
        if (saved) {
            try {
                setHistoryItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse game history", e);
            }
        }
    }, []);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('golfGameHistory', JSON.stringify(historyItems));
    }, [historyItems]);

    const startGame = (players) => {
        const newGame = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            players: players.map(p => ({ id: p.id, name: p.name, points: 0 })),
            stages: [],
            isFinished: false
        };
        setActiveGame(newGame);
        setCurrentTab('game');
    };

    const finishGame = (finalGameData) => {
        const completedGame = { ...finalGameData, isFinished: true };
        setActiveGame(completedGame);
        setHistoryItems([completedGame, ...historyItems]);
        setCurrentTab('result');
    };

    const navToHome = () => {
        setActiveGame(null);
        setCurrentTab('home');
    };

    const viewPlayerHistory = (playerName) => {
        setSelectedPlayerForHistory(playerName);
        setCurrentTab('playerHistory');
    };

    const backToHistoryList = () => {
        setSelectedPlayerForHistory(null);
        setCurrentTab('history');
    };

    const deleteGame = (gameId) => {
        if (window.confirm('このゲーム履歴を削除しますか？')) {
            const updatedHistory = historyItems.filter(g => g.id !== gameId);
            setHistoryItems(updatedHistory);
            // Optional: if the current active game was deleted, reset
            if (activeGame && activeGame.id === gameId) {
                setActiveGame(null);
                setCurrentTab('home');
            }
        }
    };

    // Render content based on current tab
    const renderContent = () => {
        switch (currentTab) {
            case 'home':
                return <Home onStartGame={startGame} />;
            case 'game':
                return <GameArea game={activeGame} setGame={setActiveGame} onFinish={finishGame} />;
            case 'result':
                return <GameResult game={activeGame} onBackHome={navToHome} />;
            case 'history':
                return <History history={historyItems} onViewPlayerHistory={viewPlayerHistory} onDeleteGame={deleteGame} />;
            case 'playerHistory':
                return <PlayerHistory playerName={selectedPlayerForHistory} history={historyItems} onBack={backToHistoryList} />;
            default:
                return <Home onStartGame={startGame} />;
        }
    };

    // Get dynamic header title
    const getHeaderTitle = () => {
        if (currentTab === 'home') return 'アプローチ記録';
        if (currentTab === 'game') return '対決中';
        if (currentTab === 'result') return '結果';
        if (currentTab === 'history') return '履歴';
        if (currentTab === 'playerHistory') return `${selectedPlayerForHistory} の成績`;
        return 'アプローチ対決';
    };

    return (
        <div className="app-container">
            {/* iOS styled header */}
            <header className="ios-header">
                {getHeaderTitle()}
            </header>

            {/* Main content area (scrollable) */}
            <main className="main-content">
                {renderContent()}
            </main>

            {/* iOS styled bottom tab bar */}
            {currentTab !== 'game' && currentTab !== 'result' && (
                <nav className="ios-tabbar">
                    <div
                        className={`tab-item ${['home'].includes(currentTab) ? 'active' : ''}`}
                        onClick={() => navToHome()}
                    >
                        <HomeIcon size={24} />
                        <span>ホーム</span>
                    </div>

                    <div
                        className={`tab-item ${['history', 'playerHistory'].includes(currentTab) ? 'active' : ''}`}
                        onClick={() => setCurrentTab('history')}
                    >
                        <HistoryIcon size={24} />
                        <span>履歴</span>
                    </div>
                </nav>
            )}
        </div>
    );
}

export default App;
