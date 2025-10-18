import React, { useState, useMemo } from 'react';
// FIX: Add .ts/.tsx extensions to imports to resolve modules.
import { Challenge, CompletedChallenge } from '../types.ts';
import { PlusIcon, EditIcon, TrashIcon, CheckCircleIcon, SparklesIcon, TargetIcon, XCircleIcon } from './Icons.tsx';

interface ComfortZoneModuleProps {
    challenges: Challenge[];
    setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
    completedChallenges: CompletedChallenge[];
    setCompletedChallenges: React.Dispatch<React.SetStateAction<CompletedChallenge[]>>;
}

const ChallengeEditorModal: React.FC<{
    challengeToEdit?: Challenge | null;
    onClose: () => void;
    onSave: (challenge: Challenge) => void;
}> = ({ challengeToEdit, onClose, onSave }) => {
    const [title, setTitle] = useState(challengeToEdit?.title || '');
    const [description, setDescription] = useState(challengeToEdit?.description || '');
    const [category, setCategory] = useState(challengeToEdit?.category || '日常');
    const [discomfortLevel, setDiscomfortLevel] = useState<1|2|3|4|5>(challengeToEdit?.discomfortLevel || 1);

    const handleSubmit = () => {
        if (!title.trim()) return;
        onSave({
            id: challengeToEdit?.id || `c-${Date.now()}`,
            title,
            description,
            category,
            discomfortLevel
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-slide-in-up">
                <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-yellow-500" />
                    {challengeToEdit ? 'チャレンジを編集' : '新しいチャレンジを作成'}
                </h2>
                <div className="space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトル" className="w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="説明" className="w-full p-2 border bg-white border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="カテゴリー" className="w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <div>
                        <label className="block text-sm font-medium text-slate-700">不快感レベル: {discomfortLevel}</label>
                        <input type="range" min="1" max="5" value={discomfortLevel} onChange={e => setDiscomfortLevel(parseInt(e.target.value) as 1|2|3|4|5)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold">キャンセル</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">保存</button>
                </div>
            </div>
        </div>
    )
}


const ReflectionModal: React.FC<{
    challenge: Challenge;
    onClose: () => void;
    onComplete: (reflection: Omit<CompletedChallenge, 'challengeId' | 'date'>) => void;
}> = ({ challenge, onClose, onComplete }) => {
    const [userDiscomfortLevel, setUserDiscomfortLevel] = useState(3);
    const [accomplishment, setAccomplishment] = useState(3);
    const [takeaway, setTakeaway] = useState('');

    const handleSubmit = () => {
        onComplete({
            userDiscomfortLevel,
            accomplishment,
            takeaway
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-fade-in">
                <h2 className="text-xl font-bold mb-2 text-slate-800 flex items-center gap-2"><CheckCircleIcon className="w-6 h-6 text-green-500" />チャレンジ完了！</h2>
                <p className="text-slate-600 mb-4">{challenge.title}</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">実際に感じた不快感レベル: {userDiscomfortLevel}</label>
                        <input type="range" min="1" max="5" value={userDiscomfortLevel} onChange={e => setUserDiscomfortLevel(parseInt(e.target.value))} className="w-full accent-red-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">達成感: {accomplishment}</label>
                        <input type="range" min="1" max="5" value={accomplishment} onChange={e => setAccomplishment(parseInt(e.target.value))} className="w-full accent-green-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">重要な学び</label>
                        <textarea value={takeaway} onChange={e => setTakeaway(e.target.value)} className="w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="例：意外と楽しかった。"></textarea>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold">キャンセル</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">記録する</button>
                </div>
            </div>
        </div>
    );
};

const DiscomfortStars: React.FC<{ level: number, className?: string }> = ({ level, className = '' }) => (
    <div className={`flex items-center gap-1 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className={`w-4 h-4 ${i < level ? 'text-red-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);


const ComfortZoneModule: React.FC<ComfortZoneModuleProps> = ({ challenges, setChallenges, completedChallenges, setCompletedChallenges }) => {
    const [filterLevel, setFilterLevel] = useState<number | null>(null);
    const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
    const [isReflecting, setIsReflecting] = useState(false);
    const [isEditing, setIsEditing] = useState<Challenge | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleSaveChallenge = (challenge: Challenge) => {
        const exists = challenges.find(c => c.id === challenge.id);
        if (exists) {
            setChallenges(challenges.map(c => c.id === challenge.id ? challenge : c));
        } else {
            setChallenges([...challenges, challenge]);
        }
    }

    const handleDeleteChallenge = (challengeId: string) => {
        if(window.confirm('このチャレンジを本当に削除しますか？')) {
            setChallenges(challenges.filter(c => c.id !== challengeId));
        }
    }

    const handleCompleteChallenge = (reflection: Omit<CompletedChallenge, 'challengeId' | 'date'>) => {
        if (!activeChallenge) return;
        const newCompletion: CompletedChallenge = {
            challengeId: activeChallenge.id,
            date: Date.now(),
            ...reflection
        };
        setCompletedChallenges(prev => [newCompletion, ...prev]);
        setActiveChallenge(null);
    };

    const growthFactor = useMemo(() => {
        return Math.min(completedChallenges.reduce((acc, c) => acc + c.accomplishment * 1.5, 0), 100);
    }, [completedChallenges]);

    const filteredChallenges = useMemo(() => {
        return challenges.filter(c => filterLevel ? c.discomfortLevel === filterLevel : true);
    }, [filterLevel, challenges]);

    const todayString = new Date().toDateString();
    const challengeCompletedToday = completedChallenges.some(c => new Date(c.date).toDateString() === todayString);

    return (
        <div className="space-y-6">
            {(isAdding || isEditing) && (
                <ChallengeEditorModal
                    challengeToEdit={isEditing}
                    onClose={() => { setIsAdding(false); setIsEditing(null); }}
                    onSave={handleSaveChallenge}
                />
            )}
            {activeChallenge && isReflecting && (
                <ReflectionModal
                    challenge={activeChallenge}
                    onClose={() => setIsReflecting(false)}
                    onComplete={handleCompleteChallenge}
                />
            )}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-bold text-slate-800 text-center mb-4">成長マップ</h2>
                <div className="relative w-52 h-52 mx-auto flex justify-center items-center">
                    <div className="absolute bg-blue-100 rounded-full transition-all duration-1000 ease-out" style={{ width: `${80 + growthFactor}px`, height: `${80 + growthFactor}px` }}></div>
                    <div className="relative bg-blue-500 text-white rounded-full w-24 h-24 flex flex-col justify-center items-center font-bold text-sm shadow-lg">
                        <span>Comfort</span>
                        <span>Zone</span>
                    </div>
                </div>
                <p className="text-center text-slate-500 text-sm mt-4">チャレンジをクリアしてゾーンを広げよう！</p>
            </div>

            {activeChallenge ? (
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg text-center animate-fade-in">
                    <h3 className="font-bold opacity-80">今日のチャレンジ</h3>
                    <p className="text-2xl my-2 font-semibold">{activeChallenge.title}</p>
                    <p className="opacity-90 mb-4">{activeChallenge.description}</p>
                    <button onClick={() => setIsReflecting(true)} className="w-full px-4 py-3 bg-white text-blue-600 rounded-lg hover:bg-opacity-90 font-semibold">完了して振り返る</button>
                    <button onClick={() => setActiveChallenge(null)} className="mt-2 text-sm text-white opacity-70 hover:opacity-100">キャンセル</button>
                </div>
            ) : challengeCompletedToday ? (
                 <div className="bg-green-100 text-green-800 p-4 rounded-xl shadow-md text-center">
                    <h3 className="font-bold">今日のチャレンジは完了しました！</h3>
                    <p className="text-sm">素晴らしい！明日も新しい挑戦をしましょう。</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">チャレンジを選択</h3>
                    <button onClick={() => setIsAdding(true)} className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold flex items-center justify-center gap-2 mb-4">
                        <PlusIcon className="w-5 h-5" />
                        新しいチャレンジを作成
                    </button>
                     <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={() => setFilterLevel(null)} className={`px-3 py-1 text-sm rounded-full ${!filterLevel ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>全て</button>
                        {[1, 2, 3, 4, 5].map(l => 
                            <button key={l} onClick={() => setFilterLevel(l)} className={`px-3 py-1 text-sm rounded-full ${filterLevel === l ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Lv. {l}</button>
                        )}
                    </div>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                        {filteredChallenges.map(challenge => (
                            <div key={challenge.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 transition-all hover:border-blue-400 hover:shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <p className="font-semibold text-slate-800">{challenge.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">{challenge.category}</p>
                                        <DiscomfortStars level={challenge.discomfortLevel} className="mt-2" />
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={() => setIsEditing(challenge)} className="text-slate-400 hover:text-blue-600 p-1"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteChallenge(challenge.id)} className="text-slate-400 hover:text-red-600 p-1"><TrashIcon className="w-5 h-5"/></button>
                                        <button onClick={() => setActiveChallenge(challenge)} className="text-sm bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 font-semibold">挑戦</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                         {filteredChallenges.length === 0 && <p className="text-center text-slate-400 p-4">このレベルのチャレンジはありません。</p>}
                    </div>
                </div>
            )}
            
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4">達成したチャレンジ履歴</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {completedChallenges.map(completed => {
                        const challenge = challenges.find(c => c.id === completed.challengeId);
                        if (!challenge) return null;
                        return (
                            <div key={completed.date} className="p-3 rounded-lg bg-green-50 border-l-4 border-green-400">
                                <p className="font-semibold text-green-800">{challenge.title}</p>
                                <p className="text-xs text-slate-500 mb-2">{new Date(completed.date).toLocaleDateString('ja-JP')}</p>
                                {completed.takeaway && <p className="text-sm text-slate-700 bg-white p-2 rounded">💡 学び:「{completed.takeaway}」</p>}
                            </div>
                        )
                    })}
                    {completedChallenges.length === 0 && <p className="text-center text-slate-400 p-4">まだ達成したチャレンジはありません。</p>}
                </div>
            </div>
        </div>
    );
};

export default ComfortZoneModule;