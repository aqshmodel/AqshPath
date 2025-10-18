import React, { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: Add .ts/.tsx extensions to imports to resolve modules.
import { BigRock, ImpulseLog } from '../types.ts';
import { CheckCircleIcon, XCircleIcon, ZapIcon, BookOpenIcon } from './Icons.tsx';
import { REGRET_MINIMIZATION_QUESTIONS } from '../philosophy.ts';

interface ImpulseModuleProps {
  impulseLogs: ImpulseLog[];
  setImpulseLogs: React.Dispatch<React.SetStateAction<ImpulseLog[]>>;
  trustScore: number;
  setTrustScore: React.Dispatch<React.SetStateAction<number>>;
  impulseTimerDuration: number;
  setImpulseTimerDuration: React.Dispatch<React.SetStateAction<number>>;
  bigRocks: BigRock[];
}

const ImpulseTimer: React.FC<{ 
    onClose: (result: 'resisted' | 'gave_in' | 'cancelled') => void;
    duration: number;
    bigRocks: BigRock[];
}> = ({ onClose, duration, bigRocks }) => {
    const [seconds, setSeconds] = useState(duration); 
    const [question, setQuestion] = useState('');

    useEffect(() => {
        if (seconds <= 0) {
            onClose('resisted'); // Timer finished is a success
            return;
        }
        const timer = setInterval(() => setSeconds(s => s - 1), 1000);
        return () => clearInterval(timer);
    }, [seconds, onClose]);

    useEffect(() => {
        setQuestion(REGRET_MINIMIZATION_QUESTIONS[Math.floor(Math.random() * REGRET_MINIMIZATION_QUESTIONS.length)]);
        const questionInterval = setInterval(() => {
            setQuestion(REGRET_MINIMIZATION_QUESTIONS[Math.floor(Math.random() * REGRET_MINIMIZATION_QUESTIONS.length)]);
        }, 15000);

        return () => clearInterval(questionInterval);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-90 flex flex-col justify-center items-center z-50 p-4 text-white text-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">未来の自分への投資</h2>
            <p className="mb-4 text-slate-300">今の選択が未来を創る。</p>
            
            {bigRocks.length > 0 && (
                <div className="mb-6 bg-slate-800 p-4 rounded-lg max-w-sm w-full">
                    <h3 className="text-sm font-bold text-yellow-400 mb-2">思い出そう、あなたのビジョン:</h3>
                    <ul className="text-sm text-slate-200 list-disc list-inside">
                       {/* FIX: The 'title' property is on 'visionBoard', not directly on 'BigRock'. */}
                       {bigRocks.slice(0, 3).map(rock => <li key={rock.id}>{rock.visionBoard.title}</li>)}
                    </ul>
                </div>
            )}
            
            <p className="text-7xl font-mono font-bold tracking-wider animate-pulse">{formatTime(seconds)}</p>

            <div className="my-6 bg-slate-800/50 p-4 rounded-lg max-w-sm w-full animate-fade-in min-h-[100px] flex items-center justify-center">
                <div>
                    <h3 className="text-sm font-bold text-yellow-300 mb-2">後悔最小化フレームワーク</h3>
                    <p className="text-slate-200 text-center italic">"{question}"</p>
                </div>
            </div>

            <div className="flex gap-4 justify-center">
                <button onClick={() => onClose('gave_in')} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">誘惑に屈する</button>
                <button onClick={() => onClose('cancelled')} className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700">キャンセル</button>
            </div>
        </div>
    );
}

const ImpulseModule: React.FC<ImpulseModuleProps> = ({ impulseLogs, setImpulseLogs, trustScore, setTrustScore, impulseTimerDuration, setImpulseTimerDuration, bigRocks }) => {
    const [view, setView] = useState<'main' | 'timer' | 'result' | 'journal'>('main');
    const [lastResult, setLastResult] = useState<'resisted' | 'gave_in' | null>(null);
    const [journalText, setJournalText] = useState('');

    const successRate = useMemo(() => {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentLogs = impulseLogs.filter(log => log.timestamp > sevenDaysAgo);
        if (recentLogs.length === 0) return 0;
        const successes = recentLogs.filter(log => log.resisted).length;
        return Math.round((successes / recentLogs.length) * 100);
    }, [impulseLogs]);

    const handleTimerClose = (result: 'resisted' | 'gave_in' | 'cancelled') => {
        if (result === 'cancelled') {
            setView('main');
            return;
        }
        setLastResult(result);
        setView('result');
    };

    const handleResultContinue = () => {
        if (lastResult === 'resisted') {
            setTrustScore(prev => Math.min(prev + 2, 100));
            setView('journal');
        } else {
            setTrustScore(prev => Math.max(prev - 2, 0));
            addLog(false, '');
            setView('main');
        }
    };
    
    const addLog = useCallback((resisted: boolean, journal: string) => {
        const newLog: ImpulseLog = {
            id: `il-${Date.now()}`,
            timestamp: Date.now(),
            resisted,
            journal,
        };
        setImpulseLogs(prev => [newLog, ...prev]);
    }, [setImpulseLogs]);

    const handleSaveJournal = () => {
        addLog(true, journalText);
        setJournalText('');
        setView('main');
    };

    if (view === 'timer') return <ImpulseTimer onClose={handleTimerClose} duration={impulseTimerDuration} bigRocks={bigRocks} />;
    
    if (view === 'result') {
        return (
            <div className="flex flex-col justify-center items-center h-full text-center p-4 animate-fade-in">
                {lastResult === 'resisted' ? (
                    <>
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold">素晴らしい！</h2>
                        <p className="text-slate-600 mt-2 mb-6">あなたは未来の自分への投資に成功しました。</p>
                        <button onClick={handleResultContinue} className="w-full max-w-xs py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                            勝利を記録する
                        </button>
                    </>
                ) : (
                    <>
                        <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold">誘惑に屈しました</h2>
                        <p className="text-slate-600 mt-2 mb-6">大丈夫、これも学びです。次はきっと大丈夫。</p>
                        <button onClick={handleResultContinue} className="w-full max-w-xs py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-semibold">
                            メインに戻る
                        </button>
                    </>
                )}
            </div>
        );
    }
    
    if (view === 'journal') {
        return (
            <div className="flex flex-col justify-center items-center h-full text-center p-4 animate-fade-in">
                <BookOpenIcon className="w-12 h-12 text-blue-500 mb-4" />
                <h2 className="text-2xl font-bold">勝利の記録</h2>
                <p className="text-slate-600 mt-2 mb-6">なぜ抵抗できたのか、その時の感情や思考を記録しましょう。</p>
                <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    className="w-full max-w-xs h-32 p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例: Big Rocksを思い出したら、衝動が小さく感じた。"
                ></textarea>
                <button onClick={handleSaveJournal} className="w-full max-w-xs mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                    保存する
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">自己信頼スコア</h2>
                <div className="flex justify-center items-end gap-2">
                    <span className="text-5xl font-bold text-blue-600">{trustScore}</span>
                    <span className="text-lg font-semibold text-slate-500 mb-1">/ 100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-4">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${trustScore}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 text-center mt-2">自分との約束を守ることでスコアが上がります。</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">衝動ログ</h2>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${successRate >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        成功率 (7日間): {successRate}%
                    </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {impulseLogs.slice(0, 10).map(log => (
                        <div key={log.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-md">
                            {log.resisted ? <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" /> : <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />}
                            <div>
                                <p className="text-sm font-semibold">{log.resisted ? '抵抗に成功' : '誘惑に屈した'}</p>
                                <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                     {impulseLogs.length === 0 && (
                        <p className="text-center text-slate-400 p-4">まだログはありません。</p>
                    )}
                </div>
            </div>

            <button onClick={() => setView('timer')} className="w-full py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold shadow-lg text-lg flex items-center justify-center gap-2">
                <ZapIcon className="w-6 h-6" />
                衝動遅延タイマー起動
            </button>
        </div>
    );
};

export default ImpulseModule;
