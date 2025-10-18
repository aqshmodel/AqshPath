import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Add .ts/.tsx extensions to imports to resolve modules.
import { ShadowJournalEntry, Belief, UserProfile } from '../types.ts';
import { SHADOW_WORK_DAY_1_QUESTIONS } from '../constants.ts';
import { LockClosedIcon, BookOpenIcon, EditIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon, LightBulbIcon } from './Icons.tsx';

interface ShadowWorkModuleProps {
    journal: ShadowJournalEntry[];
    setJournal: React.Dispatch<React.SetStateAction<ShadowJournalEntry[]>>;
    beliefs: Belief[];
    setBeliefs: React.Dispatch<React.SetStateAction<Belief[]>>;
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const PasscodeScreen: React.FC<{
    passcode: string | null;
    onUnlock: () => void;
    onSet: (code: string) => void;
}> = ({ passcode, onUnlock, onSet }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const isSetting = passcode === null;

    const handleInput = (num: string) => {
        if (input.length < 4) {
            setInput(input + num);
        }
    }
    
    const handleDelete = () => setInput(input.slice(0, -1));

    const handleSubmit = () => {
        if (isSetting) {
            onSet(input);
        } else {
            if (input === passcode) {
                onUnlock();
            } else {
                setError('パスコードが違います');
                setInput('');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-800 z-50 flex flex-col justify-center items-center text-white p-4">
            <LockClosedIcon className="w-12 h-12 text-slate-400 mb-4"/>
            <h2 className="text-xl font-bold mb-2">{isSetting ? 'パスコードを設定' : 'パスコードを入力'}</h2>
            <p className="text-slate-300 text-sm mb-6">{isSetting ? 'ジャーナルを保護するため、4桁の数字を設定してください。' : 'ジャーナルにアクセスするには、パスコードが必要です。'}</p>
            <div className="flex gap-3 mb-4">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${input.length > i ? 'bg-white' : 'border-slate-400'}`}></div>
                ))}
            </div>
            {error && <p className="text-red-400 text-sm mb-4 animate-shake">{error}</p>}
            <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} onClick={() => handleInput(String(n))} className="p-4 text-2xl bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">{n}</button>)}
                <button onClick={handleDelete} className="p-4 text-lg bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">削除</button>
                <button onClick={() => handleInput('0')} className="p-4 text-2xl bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">0</button>
                <button onClick={handleSubmit} className="p-4 text-lg bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">決定</button>
            </div>
        </div>
    );
};

const ReframingFailureModal: React.FC<{
    onSave: (entry: Omit<ShadowJournalEntry, 'id' | 'date'>) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [failureDescription, setFailureDescription] = useState('');
    const [lessonLearned, setLessonLearned] = useState('');

    const handleSave = () => {
        if (!failureDescription.trim() || !lessonLearned.trim()) return;
        onSave({
            type: 'reframing_failure',
            failureDescription,
            lessonLearned,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg animate-slide-in-up">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <LightBulbIcon className="w-6 h-6 text-yellow-500" />
                    失敗は最高の教師
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">「失敗」だと感じた出来事を書き出してください</label>
                        <textarea value={failureDescription} onChange={e => setFailureDescription(e.target.value)} className="w-full h-24 p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">この経験から得られた「学び」は何ですか？</label>
                        <textarea value={lessonLearned} onChange={e => setLessonLearned(e.target.value)} className="w-full h-24 p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold">キャンセル</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">保存</button>
                </div>
            </div>
        </div>
    );
};

const BeliefEditorModal: React.FC<{
    belief: Belief;
    onSave: (belief: Belief) => void;
    onClose: () => void;
}> = ({ belief, onSave, onClose }) => {
    const [rewrittenText, setRewrittenText] = useState(belief.rewrittenText || '');

    const handleSave = () => {
        onSave({ ...belief, rewrittenText, status: 'rewritten' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg animate-slide-in-up">
                <h2 className="text-xl font-bold text-slate-800 mb-4">信念を書き換える</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">元の信念</label>
                        <p className="w-full p-2 bg-slate-100 rounded-lg">{belief.originalText}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">新しい、力づける信念</label>
                        <textarea value={rewrittenText} onChange={e => setRewrittenText(e.target.value)} className="w-full h-24 p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="例：挑戦することで、私は成長できる" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg">キャンセル</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">保存</button>
                </div>
            </div>
        </div>
    );
};

const BeliefDiscoveryModal: React.FC<{
    onSave: (beliefText: string) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [text, setText] = useState('');

    const handleSave = () => {
        if (text.trim()) {
            onSave(text.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg animate-slide-in-up">
                <h2 className="text-xl font-bold text-slate-800 mb-2">信念を発見する</h2>
                <p className="text-slate-600 mb-4">このシャドウワークから気づいた「自分を縛る思い込み（信念）」は何ですか？</p>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-24 p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例：私は完璧でなければならない"
                ></textarea>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold">キャンセル</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">保存</button>
                </div>
            </div>
        </div>
    );
};


const DailyJournalModal: React.FC<{
    day: number;
    entry: ShadowJournalEntry | undefined;
    onSave: (answers: { question: string, answer: string }[]) => void;
    onClose: () => void;
    onDiscoverBelief: (day: number) => void;
}> = ({ day, entry, onSave, onClose, onDiscoverBelief }) => {
    const [questions, setQuestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            if (entry?.answers) {
                setQuestions(entry.answers.map(a => a.question));
                setAnswers(entry.answers);
                setIsLoading(false);
                return;
            }
            if (day === 1) {
                setQuestions(SHADOW_WORK_DAY_1_QUESTIONS);
            } else {
                try {
                    const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: `あなたは経験豊富な心理療法士で、シャドウワークのエキスパートです。これは30日間のシャドウワークプログラムの${day}日目です。${day}日目にふさわしい、自己探求を深めるためのユニークで洞察に満ちた質問を5つ生成してください。質問は、ユーザーが自分自身の隠された側面（シャドウ）と向き合うことを促すものでなければなりません。`,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    questions: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    });
                    const parsed = JSON.parse(response.text);
                    setQuestions(parsed.questions || []);
                } catch (error) {
                    console.error("Error generating questions:", error);
                    setQuestions([`Day ${day}の質問を生成できませんでした。もう一度お試しください。`]);
                }
            }
            setIsLoading(false);
        };
        fetchQuestions();
    }, [day, entry]);

    useEffect(() => {
        if (!entry) {
            setAnswers(questions.map(q => ({ question: q, answer: '' })));
        }
    }, [questions, entry]);

    const handleAnswerChange = (index: number, text: string) => {
        const newAnswers = [...answers];
        newAnswers[index].answer = text;
        setAnswers(newAnswers);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg animate-slide-in-up h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Day {day} シャドウワーク</h3>
                    <button onClick={onClose}><XCircleIcon className="w-7 h-7 text-slate-400"/></button>
                </div>
                
                <div className="mt-4 space-y-4 flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="ml-4 text-slate-600">今日の問いを生成中...</p>
                        </div>
                    ) : (
                        questions.map((q, i) => (
                            <div key={i}>
                                <label className="block font-semibold text-slate-700 mb-2">{i+1}. {q}</label>
                                <textarea
                                    value={answers[i]?.answer || ''}
                                    onChange={e => handleAnswerChange(i, e.target.value)}
                                    readOnly={!!entry}
                                    className={`w-full h-28 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${entry ? 'bg-slate-50' : 'bg-white border-slate-300'}`}
                                />
                            </div>
                        ))
                    )}
                </div>

                {!entry && !isLoading && (
                    <div className="mt-6 border-t pt-4">
                         <button onClick={() => onDiscoverBelief(day)} className="w-full mb-2 py-2 text-sm text-blue-600 font-semibold border-2 border-blue-500 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2">
                            <LightBulbIcon className="w-5 h-5"/> このシャドウワークから信念を発見する
                        </button>
                        <button onClick={() => onSave(answers)} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">記録する</button>
                    </div>
                )}
            </div>
        </div>
    );
}


const ShadowWorkModule: React.FC<ShadowWorkModuleProps> = ({ journal, setJournal, beliefs, setBeliefs, profile, setProfile }) => {
    const [isLocked, setIsLocked] = useState(!!profile.shadowWorkPasscode);
    const [activeView, setActiveView] = useState<'shadow_work' | 'library'>('shadow_work');
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [showReframingModal, setShowReframingModal] = useState(false);
    const [editingBelief, setEditingBelief] = useState<Belief | null>(null);
    const [isDiscoveringBelief, setIsDiscoveringBelief] = useState(false);

    const journeyEntries = useMemo(() => journal.filter(e => e.type === 'daily_journey'), [journal]);
    const reframingEntries = useMemo(() => journal.filter(e => e.type === 'reframing_failure'), [journal]);
    const currentDay = useMemo(() => {
        if (journeyEntries.length === 0) return 1;
        const maxDay = Math.max(...journeyEntries.map(e => e.day || 0));
        return Math.min(maxDay + 1, 30);
    }, [journeyEntries]);

    if (isLocked) {
        return <PasscodeScreen 
            passcode={profile.shadowWorkPasscode} 
            onUnlock={() => setIsLocked(false)} 
            onSet={code => {
                setProfile(p => ({ ...p, shadowWorkPasscode: code }));
                setIsLocked(false);
            }} 
        />
    }

    const handleSaveDailyJournal = (day: number, answers: { question: string, answer: string }[]) => {
        const newEntry: ShadowJournalEntry = {
            id: `s-day-${day}`,
            date: Date.now(),
            type: 'daily_journey',
            day,
            answers
        };
        const otherEntries = journal.filter(j => !(j.type === 'daily_journey' && j.day === day));
        setJournal([...otherEntries, newEntry]);
        setSelectedDay(null);
    };

    const handleSaveReframing = (entryData: Omit<ShadowJournalEntry, 'id' | 'date'>) => {
        const newEntry: ShadowJournalEntry = {
            ...entryData,
            id: `s-ref-${Date.now()}`,
            date: Date.now(),
        };
        setJournal(j => [...j, newEntry]);
    };

    const handleOpenBeliefDiscovery = () => {
        setIsDiscoveringBelief(true);
    };
    
    const handleSaveDiscoveredBelief = (beliefText: string) => {
        const newBelief: Belief = {
            id: `b-${Date.now()}`,
            originalText: beliefText,
            status: 'uncovered',
            dateUncovered: Date.now(),
            sourceJournalDay: selectedDay || 0,
        };
        setBeliefs(b => [...b, newBelief]);
        alert("新しい信念がライブラリに追加されました。");
    };
    
    const handleSaveBelief = (beliefToSave: Belief) => {
        setBeliefs(beliefs.map(b => b.id === beliefToSave.id ? beliefToSave : b));
        setEditingBelief(null);
    }

    const DayTile: React.FC<{ day: number }> = ({ day }) => {
        const isCompleted = journeyEntries.some(e => e.day === day);
        const isCurrent = day === currentDay;
        const isFuture = day > currentDay;
        
        let statusClass = 'bg-slate-200 text-slate-400 cursor-not-allowed';
        if (isCompleted) statusClass = 'bg-blue-600 text-white';
        if (isCurrent) statusClass = 'border-2 border-blue-500 animate-pulse-subtle';
        
        return (
            <button
                onClick={() => !isFuture && setSelectedDay(day)}
                disabled={isFuture}
                className={`w-full h-16 rounded-lg flex flex-col items-center justify-center font-bold transition-transform hover:scale-105 relative ${statusClass}`}
            >
                <span className="text-xs opacity-80">Day</span>
                <span className="text-2xl leading-none">{day}</span>
                {isCompleted && <CheckCircleIcon className="w-5 h-5 absolute -top-1 -right-1 text-white bg-blue-600 rounded-full" />}
            </button>
        );
    };


    return (
        <div className="space-y-6">
            {selectedDay && (
                <DailyJournalModal 
                    day={selectedDay}
                    entry={journeyEntries.find(j => j.day === selectedDay)}
                    onSave={(answers) => handleSaveDailyJournal(selectedDay, answers)}
                    onClose={() => setSelectedDay(null)}
                    onDiscoverBelief={handleOpenBeliefDiscovery}
                />
            )}
            {showReframingModal && <ReframingFailureModal onClose={() => setShowReframingModal(false)} onSave={handleSaveReframing} />}
            {editingBelief && <BeliefEditorModal belief={editingBelief} onSave={handleSaveBelief} onClose={() => setEditingBelief(null)} />}
            {isDiscoveringBelief && <BeliefDiscoveryModal onClose={() => setIsDiscoveringBelief(false)} onSave={handleSaveDiscoveredBelief} />}

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-center mb-4 border-b">
                    <button onClick={() => setActiveView('shadow_work')} className={`px-4 py-2 font-semibold ${activeView === 'shadow_work' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>シャドウワーク</button>
                    <button onClick={() => setActiveView('library')} className={`px-4 py-2 font-semibold ${activeView === 'library' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500'}`}>信念ライブラリ</button>
                </div>
                
                {activeView === 'shadow_work' && (
                    <div className="animate-fade-in">
                        <h2 className="text-lg font-bold text-slate-800 text-center mb-1">30日間のシャドウワーク</h2>
                        <p className="text-center text-sm text-slate-500 mb-6">毎日ひとつの問いに向き合い、普段は意識しない自分の心（シャドウ）を探求します。</p>
                        <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto">
                            {Array.from({length: 30}).map((_, i) => <DayTile key={i} day={i+1}/>)}
                        </div>
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">学びの再定義</h3>
                             <button onClick={() => setShowReframingModal(true)} className="flex items-center gap-2 text-sm text-blue-600 font-semibold p-2 rounded-lg hover:bg-blue-50 w-full justify-center border-2 border-dashed">
                                <PlusCircleIcon className="w-5 h-5"/>
                                失敗から学んだことを記録する
                            </button>
                            <div className="mt-4 space-y-3">
                                {reframingEntries.map(entry => (
                                    <div key={entry.id} className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString()}</p>
                                        <p className="font-semibold text-slate-700 mt-1">🤔 <span className="font-normal">「{entry.failureDescription}」</span></p>
                                        <p className="font-semibold text-green-700 mt-2">💡 <span className="font-normal">「{entry.lessonLearned}」</span></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'library' && (
                    <div className="animate-fade-in">
                        <h2 className="text-lg font-bold text-slate-800 text-center mb-1">私の信念ライブラリ</h2>
                        <p className="text-center text-sm text-slate-500 mb-6">シャドウワークから見つけた「思い込み」を、力になる「信念」へと書き換えましょう。</p>
                        <div className="space-y-3">
                            {beliefs.map(belief => (
                                <div key={belief.id} className="bg-slate-50 p-3 rounded-lg border-l-4 border-blue-400">
                                    <p className="text-slate-700">{belief.originalText}</p>
                                    {belief.rewrittenText && (
                                        <p className="mt-2 text-green-700 font-semibold bg-green-100 p-2 rounded-lg">→ {belief.rewrittenText}</p>
                                    )}
                                    <div className="flex justify-end items-center mt-2">
                                        <span className="text-xs text-slate-500">Day {belief.sourceJournalDay}のシャドウワークより</span>
                                        <button onClick={() => setEditingBelief(belief)} className="ml-4 text-sm text-blue-600 font-semibold hover:underline">
                                            {belief.rewrittenText ? '編集' : '書き換える'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {beliefs.length === 0 && <p className="text-center text-slate-400 p-4">シャドウワークを書き、自分を縛る信念を見つけてみましょう。</p>}
                        </div>
                    </div>
                )}
            </div>
             <p className="text-center text-xs text-slate-400">データはあなたのデバイスにのみ保存されます。</p>
        </div>
    );
};

export default ShadowWorkModule;