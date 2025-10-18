import React, { useState, useMemo, useEffect } from 'react';
import { Routine, RoutineBlock, BadHabit, BadHabitLog, UserProfile, JournalEntry, ImpactLogEntry, Habit7Id, DailyFocus, SEVEN_HABITS_IDS } from '../types.ts';
import { HABIT_TEMPLATES, SEVEN_HABITS_DETAILS } from '../constants.ts';
import { 
    EditIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, PlayIcon, StopIcon, PlusCircleIcon, 
    TargetIcon, AwardIcon, ClipboardCheckIcon, XCircleIcon, CheckCircleIcon, PlusIcon, AlertTriangleIcon 
} from './Icons.tsx';

// --- PROPS INTERFACES ---

interface HabitModuleProps {
    routines: Routine[];
    setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>;
    badHabits: BadHabit[];
    setBadHabits: React.Dispatch<React.SetStateAction<BadHabit[]>>;
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    journalEntries: JournalEntry[];
    setJournalModal: React.Dispatch<React.SetStateAction<{ isOpen: boolean; type: 'cbt' | 'free' | 'impact' | 'selecting' | null; prefill?: Partial<ImpactLogEntry>}>>;
}

// --- SUB-COMPONENTS for My Routines ---

const HabitBuilder: React.FC<{
    existingRoutine?: Routine | null;
    onSave: (routine: Routine) => void;
    onClose: () => void;
}> = ({ existingRoutine, onSave, onClose }) => {
    const [name, setName] = useState(existingRoutine?.name || '');
    const [blocks, setBlocks] = useState<RoutineBlock[]>(existingRoutine?.blocks || []);
    const [disciplineMode, setDisciplineMode] = useState(existingRoutine?.disciplineMode || { enabled: false, time: '08:00', window: 15 });
    const [blockTitle, setBlockTitle] = useState('');
    const [blockDuration, setBlockDuration] = useState(15);

    const handleAddBlock = () => {
        if(blockTitle.trim() && blockDuration > 0) {
            setBlocks([...blocks, {id: `b-${Date.now()}`, title: blockTitle, duration: blockDuration}]);
            setBlockTitle('');
            setBlockDuration(15);
        }
    }

    const handleRemoveBlock = (blockId: string) => setBlocks(blocks.filter(b => b.id !== blockId));

    const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    }

    const handleSave = () => {
        onSave({ id: existingRoutine?.id || `r-${Date.now()}`, name, blocks, disciplineMode: disciplineMode.enabled ? disciplineMode : undefined });
        onClose();
    }
    
    const loadTemplate = (template: Routine) => {
        setName(template.name);
        setBlocks(template.blocks.map(b => ({...b, id: `b-${Date.now()}-${Math.random()}`})));
    }
    
    const StoicModeToggle: React.FC = () => (
         <div className="bg-slate-50 p-3 rounded-lg">
            <label className="flex items-center justify-between space-x-3 cursor-pointer">
                <span className="font-semibold text-slate-700 flex items-center gap-2"><TargetIcon className="w-5 h-5 text-blue-600"/> ストイックモード</span>
                <div className="relative">
                    <input type="checkbox" checked={disciplineMode.enabled} onChange={e => setDisciplineMode(d => ({...d, enabled: e.target.checked}))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
            </label>
            {disciplineMode.enabled && (
                <div className="mt-3 space-y-2 pl-7 animate-fade-in">
                    <p className="text-xs text-slate-500">例外なく規律を守るための厳格モードです。</p>
                    <div>
                        <label className="text-sm font-medium">実行時間:</label>
                        <input type="time" value={disciplineMode.time} onChange={e => setDisciplineMode(d => ({...d, time: e.target.value}))} className="ml-2 p-1 border rounded-md" />
                    </div>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg h-[90vh] flex flex-col animate-fade-in">
                <h2 className="text-xl font-bold mb-4 text-slate-800">{existingRoutine ? '習慣を編集' : '習慣ビルダー'}</h2>
                <div className="mb-4">
                    <p className="text-sm text-slate-600 mb-2">テンプレートから始める:</p>
                    <div className="flex gap-2 flex-wrap">
                        {HABIT_TEMPLATES.map(t => (
                            <button key={t.id} onClick={() => loadTemplate(t)} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200">{t.name}</button>
                        ))}
                    </div>
                </div>
                
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="習慣名 (例: 仕事前の準備)" className="w-full p-2 border bg-white border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

                <div className="flex-grow overflow-y-auto mb-4 border-t pt-4 space-y-2">
                    {blocks.map((block, index) => (
                        <div key={block.id} className="bg-slate-100 p-2 rounded-lg flex justify-between items-center">
                            <span className="truncate">{index + 1}. {block.title} ({block.duration}分)</span>
                            <div className="flex gap-2 items-center">
                                <button onClick={() => handleMoveBlock(index, 'up')} disabled={index === 0} className="disabled:opacity-25 p-1"><ArrowUpIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleMoveBlock(index, 'down')} disabled={index === blocks.length - 1} className="disabled:opacity-25 p-1"><ArrowDownIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleRemoveBlock(block.id)} className="text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                     {blocks.length === 0 && <p className="text-center text-slate-400 p-4">活動ブロックを追加してください</p>}
                </div>
                
                <div className="border-t pt-4">
                     <StoicModeToggle />
                </div>

                <div className="border-t pt-4 space-y-2 mt-4">
                    <input type="text" value={blockTitle} onChange={e => setBlockTitle(e.target.value)} placeholder="活動 (例: メールチェック)" className="w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <input type="number" value={blockDuration} onChange={e => setBlockDuration(parseInt(e.target.value))} placeholder="時間(分)" className="w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <button onClick={handleAddBlock} className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold">ブロックを追加</button>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold">閉じる</button>
                    <button onClick={handleSave} disabled={!name || blocks.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-300">保存</button>
                </div>
            </div>
        </div>
    )
}

const ActiveRoutinePlayer: React.FC<{
    routine: Routine;
    onClose: (completed: boolean) => void;
}> = ({ routine, onClose }) => {
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(routine.blocks[0].duration * 60);

    const currentBlock = routine.blocks[currentBlockIndex];
    const totalBlocks = routine.blocks.length;

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    goToNext();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [currentBlockIndex]);

    const goToNext = () => {
        if (currentBlockIndex < totalBlocks - 1) {
            const nextIndex = currentBlockIndex + 1;
            setCurrentBlockIndex(nextIndex);
            setSecondsLeft(routine.blocks[nextIndex].duration * 60);
        } else {
            onClose(true);
        }
    };
    
    const goToPrev = () => {
        if (currentBlockIndex > 0) {
            const prevIndex = currentBlockIndex - 1;
            setCurrentBlockIndex(prevIndex);
            setSecondsLeft(routine.blocks[prevIndex].duration * 60);
        }
    };

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    const progressPercentage = ((currentBlock.duration * 60 - secondsLeft) / (currentBlock.duration * 60)) * 100;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg animate-slide-in-up">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold text-slate-800">{routine.name}</h2>
                 <button onClick={() => onClose(false)} className="font-semibold text-red-500 hover:text-red-700">終了</button>
            </div>
            <div className="text-center">
                <p className="text-sm text-slate-500">ステップ {currentBlockIndex + 1} / {totalBlocks}</p>
                <h3 className="text-2xl font-bold my-3 text-blue-600">{currentBlock.title}</h3>
                <p className="text-6xl font-mono font-bold my-4 text-slate-800">{formatTime(secondsLeft)}</p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 my-4">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-6">
                <button onClick={goToPrev} disabled={currentBlockIndex === 0} className="px-4 py-2 bg-slate-200 rounded-lg disabled:opacity-40">前へ</button>
                <button onClick={goToNext} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold">{currentBlockIndex === totalBlocks - 1 ? '完了' : '次へ'}</button>
            </div>
        </div>
    )
}

const VictoryLogModal: React.FC<{
    onSave: (log: string) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [log, setLog] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fade-in">
                <h2 className="text-xl font-bold mb-2 text-slate-800 flex items-center gap-2"><AwardIcon className="w-6 h-6 text-yellow-500" /> 勝利の記録</h2>
                <p className="text-slate-600 mb-4">昨日の自分に勝ちましたか？今日の小さな勝利を記録しましょう。</p>
                <textarea 
                    value={log}
                    onChange={e => setLog(e.target.value)}
                    placeholder="例：昨日より1ページ多く読んだ"
                    className="w-full p-2 border bg-white border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
                 <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold">スキップ</button>
                    <button onClick={() => { onSave(log); onClose(); }} disabled={!log.trim()} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold disabled:bg-yellow-300">この勝利を刻む</button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS for Growth Habits ---

const RadarChart: React.FC<{
    assessment: Record<Habit7Id, number>;
    activity: Record<Habit7Id, number>;
}> = ({ assessment, activity }) => {
    const size = 380;
    const center = size / 2;
    const radius = size * 0.3;
    const levels = 5;

    const getPoint = (value: number, index: number) => {
        const angle = (Math.PI * 2 * index) / SEVEN_HABITS_IDS.length - Math.PI / 2;
        const r = (radius * value) / levels;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return { x, y, angle };
    };

    const pointsToString = (data: Record<Habit7Id, number>) => {
        return SEVEN_HABITS_IDS.map((habitId, i) => {
            const { x, y } = getPoint(data[habitId] || 0, i);
            return `${x},${y}`;
        }).join(' ');
    };

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-w-md mx-auto">
            <title>成長バランスレーダーチャート</title>
            {/* Grid Lines */}
            {Array.from({ length: levels }).map((_, i) => (
                <circle key={i} cx={center} cy={center} r={(radius * (i + 1)) / levels} fill="none" stroke="#e2e8f0" strokeWidth="1" />
            ))}
            
            {/* Labels & Spokes */}
            {SEVEN_HABITS_IDS.map((habitId, i) => {
                const { x, y, angle } = getPoint(levels, i);
                const habit = SEVEN_HABITS_DETAILS.find(h => h.id === habitId);
                const labelLines = habit ? habit.chartLabel : [];
                const labelPos = {
                    x: center + (radius + 40) * Math.cos(angle),
                    y: center + (radius + 40) * Math.sin(angle)
                };

                // FIX: Add explicit type for textAnchor to prevent type error.
                let textAnchor: "inherit" | "middle" | "start" | "end" = "middle";
                const tolerance = 0.1; 
                if (Math.cos(angle) > tolerance) {
                    textAnchor = "start";
                } else if (Math.cos(angle) < -tolerance) {
                    textAnchor = "end";
                }

                return (
                    <g key={habitId}>
                        <line x1={center} y1={center} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                        <text 
                            x={labelPos.x} 
                            y={labelPos.y} 
                            fill="#475569" 
                            fontSize="11" 
                            fontWeight="bold" 
                            textAnchor={textAnchor}
                            dominantBaseline="middle"
                        >
                            {labelLines.map((line, lineIndex) => (
                                <tspan key={lineIndex} x={labelPos.x} dy={lineIndex > 0 ? "1.2em" : "0"}>
                                    {line}
                                </tspan>
                            ))}
                        </text>
                    </g>
                );
            })}
            
            {/* Data Polygons */}
            <polygon points={pointsToString(activity)} fill="rgba(251, 191, 36, 0.4)" stroke="#f59e0b" strokeWidth="2" />
            <polygon points={pointsToString(assessment)} fill="rgba(59, 130, 246, 0.4)" stroke="#3b82f6" strokeWidth="2" />
        </svg>
    );
};


const SelfAssessmentModal: React.FC<{
    assessments: Record<Habit7Id, number>;
    onSave: (newAssessments: Record<Habit7Id, number>) => void;
    onClose: () => void;
}> = ({ assessments, onSave, onClose }) => {
    const [localAssessments, setLocalAssessments] = useState(assessments);

    const handleChange = (habitId: Habit7Id, value: number) => {
        setLocalAssessments(prev => ({...prev, [habitId]: value}));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg animate-slide-in-up h-[90vh] flex flex-col">
                 <h2 className="text-xl font-bold text-slate-800 mb-2">自己評価</h2>
                 <p className="text-slate-600 mb-4 text-sm">各習慣について、現在の自分を正直に評価しましょう。(1: 課題あり ~ 5: 得意)</p>
                 <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                    {SEVEN_HABITS_DETAILS.map(habit => (
                        <div key={habit.id}>
                            <label className="font-semibold">{habit.title}: <span className="text-blue-600 font-bold">{localAssessments[habit.id] || 1}</span></label>
                            <input 
                                type="range" 
                                min="1" max="5" 
                                value={localAssessments[habit.id] || 1}
                                onChange={e => handleChange(habit.id, parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-1"
                            />
                        </div>
                    ))}
                 </div>
                 <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg">キャンセル</button>
                    <button onClick={() => { onSave(localAssessments); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">保存する</button>
                </div>
            </div>
        </div>
    );
};

const DailyFocusModal: React.FC<{
    onSave: (focus: Omit<DailyFocus, 'date' | 'isCompleted'>) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [selectedHabits, setSelectedHabits] = useState<Habit7Id[]>([]);
    const [action, setAction] = useState('');

    const toggleHabit = (habitId: Habit7Id) => {
        const isSelected = selectedHabits.includes(habitId);
        if (isSelected) {
            setSelectedHabits(selectedHabits.filter(id => id !== habitId));
        } else if (selectedHabits.length < 2) {
            setSelectedHabits([...selectedHabits, habitId]);
        }
    };

    const handleSave = () => {
        if (selectedHabits.length > 0 && action.trim()) {
            onSave({ habitIds: selectedHabits, action });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg animate-slide-in-up">
                 <h2 className="text-xl font-bold text-slate-800 mb-2">今日のフォーカス</h2>
                 <div className="space-y-4">
                     <div>
                        <label className="font-semibold block mb-2">今日、あなたが特に意識する習慣はどれですか？ (2つまで)</label>
                        <div className="flex flex-wrap gap-2">
                            {SEVEN_HABITS_DETAILS.map(habit => (
                                <button key={habit.id} onClick={() => toggleHabit(habit.id)} className={`px-3 py-1 text-sm rounded-full border ${selectedHabits.includes(habit.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}>
                                    {habit.title}
                                </button>
                            ))}
                        </div>
                     </div>
                     <div>
                        <label className="font-semibold block mb-2">そのために、今日具体的に何をしますか？</label>
                        <textarea value={action} onChange={e => setAction(e.target.value)} className="w-full p-2 border bg-white border-slate-300 rounded-lg h-20" placeholder={SEVEN_HABITS_DETAILS.find(h => h.id === selectedHabits[0])?.actionExample || "例：会議で人の話を最後まで聞く"}/>
                     </div>
                 </div>
                 <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} disabled={selectedHabits.length === 0 || !action.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-300">設定する</button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS for Bad Habits ---

const BadHabitEditor: React.FC<{
    habitToEdit?: BadHabit | null;
    onSave: (habit: Omit<BadHabit, 'id' | 'logs'>) => void;
    onClose: () => void;
}> = ({ habitToEdit, onSave, onClose }) => {
    const [name, setName] = useState(habitToEdit?.name || '');
    const [trigger, setTrigger] = useState(habitToEdit?.trigger || '');
    const [replacementAction, setReplacementAction] = useState(habitToEdit?.replacementAction || '');

    const handleSave = () => {
        if (name.trim()) {
            onSave({ name, trigger, replacementAction });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-fade-in">
                <h2 className="text-xl font-bold mb-4 text-slate-800">{habitToEdit ? '悪習慣を編集' : '悪習慣を追加'}</h2>
                <div className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="やめたい習慣 (例: SNSのダラダラ見)" className="w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <input type="text" value={trigger} onChange={e => setTrigger(e.target.value)} placeholder="きっかけ (例: 退屈な時)" className="w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <input type="text" value={replacementAction} onChange={e => setReplacementAction(e.target.value)} placeholder="代わりの行動 (例: 1分間瞑想する)" className="w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg">キャンセル</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">保存</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENTS for each TAB ---

const MyRoutines: React.FC<{
    routines: Routine[];
    setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>;
}> = ({ routines, setRoutines }) => {
    const [modalState, setModalState] = useState<{ mode: 'closed' | 'add' | 'edit', routine: Routine | null }>({ mode: 'closed', routine: null });
    const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
    const [loggingRoutine, setLoggingRoutine] = useState<Routine | null>(null);

    const handleSaveRoutine = (routine: Routine) => {
        const exists = routines.find(r => r.id === routine.id);
        if(exists) {
            setRoutines(routines.map(r => r.id === routine.id ? routine : r));
        } else {
            setRoutines([...routines, routine]);
        }
        setModalState({ mode: 'closed', routine: null });
    }

    const handleDeleteRoutine = (routineId: string) => {
        if(window.confirm('この習慣を本当に削除しますか？')) {
            setRoutines(routines.filter(r => r.id !== routineId));
        }
    }

    const handlePlayerClose = (completed: boolean) => {
        if(completed && activeRoutine) {
            setLoggingRoutine(activeRoutine);
        }
        setActiveRoutine(null);
    }
    
    const handleSaveVictorLog = (log: string) => {
        if (!loggingRoutine) return;
        const newLog = { date: Date.now(), entry: log };
        setRoutines(routines.map(r => 
            r.id === loggingRoutine.id 
            ? { ...r, victorsLog: [...(r.victorsLog || []), newLog] } 
            : r
        ));
    };

    if (activeRoutine) {
        return <ActiveRoutinePlayer routine={activeRoutine} onClose={handlePlayerClose} />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {modalState.mode !== 'closed' && <HabitBuilder existingRoutine={modalState.routine} onSave={handleSaveRoutine} onClose={() => setModalState({ mode: 'closed', routine: null })} />}
            {loggingRoutine && <VictoryLogModal onClose={() => setLoggingRoutine(null)} onSave={handleSaveVictorLog} />}
            
            <div className="space-y-4">
                {routines.map((routine, index) => (
                    <div key={routine.id} className="bg-white p-4 rounded-xl shadow-md animate-slide-in-up" style={{animationDelay: `${index * 50}ms`}}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{routine.name}</h3>
                                {routine.disciplineMode?.enabled && (
                                    <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1">
                                        <TargetIcon className="w-4 h-4" />
                                        <span>{routine.disciplineMode.time}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 items-center">
                                <button onClick={() => setActiveRoutine(routine)} className="text-green-500 hover:text-green-700 p-1"><PlayIcon className="w-5 h-5"/></button>
                                <button onClick={() => setModalState({ mode: 'edit', routine })} className="text-slate-400 hover:text-blue-600 p-1"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDeleteRoutine(routine.id)} className="text-slate-400 hover:text-red-600 p-1"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-2 text-sm">
                            {routine.blocks.slice(0, 3).map(block => (
                                <li key={block.id}>{block.title} <span className="text-slate-500">({block.duration}分)</span></li>
                            ))}
                            {routine.blocks.length > 3 && <li className="text-slate-400">...他{routine.blocks.length - 3}件</li>}
                        </ol>
                        <div className="mt-3 border-t pt-3 flex justify-end">
                             <button onClick={() => setLoggingRoutine(routine)} className="flex items-center gap-1 text-sm font-semibold text-yellow-600 hover:text-yellow-800">
                                <ClipboardCheckIcon className="w-5 h-5"/> 勝利を刻む
                            </button>
                        </div>
                        {routine.victorsLog && routine.victorsLog.length > 0 && (
                            <details className="mt-3">
                                <summary className="text-sm font-semibold text-slate-500 cursor-pointer">勝利の記録を見る</summary>
                                <div className="mt-2 space-y-2 pl-2 border-l-2 border-yellow-400">
                                    {routine.victorsLog.slice(-5).reverse().map(log => (
                                        <div key={log.date} className="text-sm p-2 bg-yellow-50 rounded-r-lg">
                                            <p className="font-semibold text-yellow-800">🏆 {log.entry}</p>
                                            <p className="text-xs text-slate-500">{new Date(log.date).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}
                    </div>
                ))}
            </div>

            <button onClick={() => setModalState({ mode: 'add', routine: null })} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md">
                新しい習慣を作成
            </button>
            
            {routines.length === 0 && (
                 <div className="text-center text-slate-500 p-8 border-2 border-dashed rounded-lg">
                    <p>まだ習慣がありません。</p>
                    <p>上のボタンから最初の習慣を作成しましょう！</p>
                </div>
            )}
        </div>
    );
};

const GrowthHabits: React.FC<Omit<HabitModuleProps, 'routines' | 'setRoutines' | 'badHabits' | 'setBadHabits'>> = ({ profile, setProfile, journalEntries, setJournalModal }) => {
    const [modal, setModal] = useState<'none' | 'assessment' | 'focus'>('none');
    const todayStr = new Date().toISOString().split('T')[0];

    const assessments = useMemo(() => {
        const initial = SEVEN_HABITS_IDS.reduce((acc, id) => ({...acc, [id]: 1}), {} as Record<Habit7Id, number>);
        return profile.habit7Assessments || initial;
    }, [profile.habit7Assessments]);

    const activityScores = useMemo(() => {
        const impactLogs = journalEntries.filter(e => e.type === 'impact') as ImpactLogEntry[];
        const counts = SEVEN_HABITS_IDS.reduce((acc, id) => ({...acc, [id]: 0}), {} as Record<Habit7Id, number>);
        impactLogs.forEach(log => {
            log.relatedHabits.forEach(habitId => { counts[habitId]++; });
        });
        const maxCount = Math.max(1, ...Object.values(counts));
        return SEVEN_HABITS_IDS.reduce((acc, id) => ({...acc, [id]: (counts[id] / maxCount) * 5}), {} as Record<Habit7Id, number>);
    }, [journalEntries]);
    
    const todaysFocus = useMemo(() => (profile.dailyFocuses || []).find(c => c.date === todayStr), [profile.dailyFocuses, todayStr]);

    const handleSaveAssessments = (newAssessments: Record<Habit7Id, number>) => {
        setProfile(p => ({...p, habit7Assessments: newAssessments}));
    };
    
    const handleSaveFocus = (focus: Omit<DailyFocus, 'date' | 'isCompleted'>) => {
        const newFocus: DailyFocus = { ...focus, date: todayStr, isCompleted: false };
        setProfile(p => ({ ...p, dailyFocuses: [...(p.dailyFocuses || []).filter(c => c.date !== todayStr), newFocus] }));
        setModal('none');
    };
    
    const handleCompleteFocus = () => {
        setProfile(p => ({
            ...p,
            dailyFocuses: (p.dailyFocuses || []).map(c => c.date === todayStr ? { ...c, isCompleted: true } : c)
        }));
        if (window.confirm('素晴らしい！誓約を達成しましたね。\nこの行動がもたらした「インパクト」を記録しますか？')) {
            setJournalModal({
                isOpen: true,
                type: 'impact',
                prefill: { myAction: todaysFocus?.action, relatedHabits: todaysFocus?.habitIds }
            });
        }
    };
    
    const impactLogs = useMemo(() => (journalEntries.filter(e => e.type === 'impact').sort((a, b) => b.date - a.date) as ImpactLogEntry[]), [journalEntries]);

    return (
        <div className="space-y-6 animate-fade-in">
            {modal === 'assessment' && <SelfAssessmentModal assessments={assessments} onSave={handleSaveAssessments} onClose={() => setModal('none')} />}
            {modal === 'focus' && <DailyFocusModal onSave={handleSaveFocus} onClose={() => setModal('none')} />}

            <div className="bg-white p-4 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">成長バランス</h2>
                <RadarChart assessment={assessments} activity={activityScores} />
                <div className="flex justify-center items-center gap-4 text-xs mt-2">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span>自己評価</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-sm"></span>活動スコア</span>
                </div>
                 <button onClick={() => setModal('assessment')} className="w-full mt-4 text-sm font-semibold text-blue-600 p-2 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1">
                    <EditIcon className="w-4 h-4" /> 自己評価を更新
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-bold text-slate-800 mb-4">今日のフォーカス</h2>
                {todaysFocus ? (
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500">意識する習慣: {todaysFocus.habitIds.map(id => SEVEN_HABITS_DETAILS.find(h => h.id === id)?.title).join(', ')}</p>
                        <p className="font-semibold text-slate-800 my-2 text-lg">「{todaysFocus.action}」</p>
                        {todaysFocus.isCompleted ? (
                            <div className="flex items-center gap-2 text-green-600 font-bold p-2 bg-green-100 rounded-md">
                                <CheckCircleIcon className="w-6 h-6" /><span>達成済み！素晴らしい！</span>
                            </div>
                        ) : (
                            <button onClick={handleCompleteFocus} className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold">完了</button>
                        )}
                    </div>
                ) : (
                    <button onClick={() => setModal('focus')} className="w-full py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold border-2 border-dashed border-blue-300">
                        + 今日のフォーカスを設定する
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">インパクトログ</h2>
                    <button onClick={() => setJournalModal({isOpen: true, type: 'impact', prefill: undefined})} className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 font-semibold">
                        <PlusIcon className="w-4 h-4"/> 記録
                    </button>
                </div>
                 <div className="space-y-3 max-h-80 overflow-y-auto">
                    {impactLogs.length > 0 ? impactLogs.map(log => (
                        <div key={log.id} className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                            <p className="text-xs text-slate-500">{new Date(log.date).toLocaleDateString()}</p>
                            <p className="font-semibold text-slate-800 mt-1">行動: {log.myAction}</p>
                            <p className="text-sm text-slate-700 mt-2">影響: {log.impact}</p>
                        </div>
                    )) : ( <p className="text-center text-slate-500 p-4">まだインパクトログはありません。</p> )}
                </div>
            </div>
        </div>
    );
};

const BadHabits: React.FC<Omit<HabitModuleProps, 'routines' | 'setRoutines' | 'profile' | 'setProfile' | 'journalEntries' | 'setJournalModal'>> = ({ badHabits, setBadHabits }) => {
    const [isEditing, setIsEditing] = useState<BadHabit | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleSave = (habitData: Omit<BadHabit, 'id' | 'logs'>) => {
        if (isEditing) {
            setBadHabits(badHabits.map(h => h.id === isEditing.id ? { ...isEditing, ...habitData } : h));
        } else {
            setBadHabits([...badHabits, { ...habitData, id: `bh-${Date.now()}`, logs: [] }]);
        }
        setIsAdding(false);
        setIsEditing(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('この悪習慣を削除しますか？')) {
            setBadHabits(badHabits.filter(h => h.id !== id));
        }
    };

    const addLog = (habitId: string, resisted: boolean) => {
        const newLog: BadHabitLog = { timestamp: Date.now(), resisted };
        setBadHabits(badHabits.map(h => h.id === habitId ? { ...h, logs: [...h.logs, newLog] } : h));
    };

    const getSuccessRate = (logs: BadHabitLog[]) => {
        if (logs.length === 0) return 'N/A';
        const successes = logs.filter(l => l.resisted).length;
        return `${Math.round((successes / logs.length) * 100)}%`;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {(isAdding || isEditing) && <BadHabitEditor habitToEdit={isEditing} onSave={handleSave} onClose={() => { setIsAdding(false); setIsEditing(null); }} />}
            
            {badHabits.map(habit => (
                <div key={habit.id} className="bg-white p-4 rounded-xl shadow-md">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-800">{habit.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-600">成功率: {getSuccessRate(habit.logs)}</span>
                            <button onClick={() => setIsEditing(habit)}><EditIcon className="w-5 h-5 text-slate-400"/></button>
                            <button onClick={() => handleDelete(habit.id)}><TrashIcon className="w-5 h-5 text-slate-400"/></button>
                        </div>
                    </div>
                    <div className="mt-2 text-sm space-y-1">
                        <p><strong className="text-red-600">きっかけ:</strong> {habit.trigger}</p>
                        <p><strong className="text-green-600">代替行動:</strong> {habit.replacementAction}</p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => addLog(habit.id, false)} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">誘惑に屈した</button>
                        <button onClick={() => addLog(habit.id, true)} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">抵抗に成功</button>
                    </div>
                </div>
            ))}

            <button onClick={() => setIsAdding(true)} className="w-full py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold border-2 border-dashed border-blue-300">
                + やめたい習慣を追加する
            </button>
        </div>
    );
};

// --- MAIN CONTAINER ---

const HabitModule: React.FC<HabitModuleProps> = (props) => {
    const [activeSubTab, setActiveSubTab] = useState<'my_routines' | 'growth_habits' | 'bad_habits'>('my_routines');

    const subTabStyle = (isActive: boolean) => 
        `flex-1 py-3 px-2 text-center text-sm transition-colors duration-200 flex items-center justify-center gap-2 ${
            isActive 
                ? 'font-bold text-blue-600 border-b-2 border-blue-500 bg-blue-50' 
                : 'font-medium text-slate-500 hover:bg-slate-100'
        }`;

    const renderContent = () => {
        switch (activeSubTab) {
            case 'my_routines':
                return <MyRoutines routines={props.routines} setRoutines={props.setRoutines} />;
            case 'growth_habits':
                return <GrowthHabits {...props} />;
            case 'bad_habits':
                return <BadHabits badHabits={props.badHabits} setBadHabits={props.setBadHabits} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4">
            <div className="flex bg-white rounded-lg shadow-sm overflow-hidden border mb-6">
                <button onClick={() => setActiveSubTab('my_routines')} className={subTabStyle(activeSubTab === 'my_routines')}>マイ習慣</button>
                <button onClick={() => setActiveSubTab('growth_habits')} className={subTabStyle(activeSubTab === 'growth_habits')}>成長習慣</button>
                <button onClick={() => setActiveSubTab('bad_habits')} className={subTabStyle(activeSubTab === 'bad_habits')}>悪習慣の克服</button>
            </div>
            {renderContent()}
        </div>
    );
};

export default HabitModule;