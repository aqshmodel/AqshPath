import React, { useState } from 'react';
// FIX: Add .ts/.tsx extensions to all local imports to resolve modules.
import useLocalStorage from './hooks/useLocalStorage.ts';
import { BigRock, Challenge, CompletedChallenge, ImpulseLog, Routine, ShadowJournalEntry, Belief, UserProfile, MotivationType, JournalEntry, ImpactLogEntry, BadHabit, CognitiveJournalEntry, FreeJournalEntry, Habit7Id } from './types.ts';
import GoalModule from './components/GoalModule.tsx';
import ImpulseModule from './components/ImpulseModule.tsx';
import ComfortZoneModule from './components/ComfortZoneModule.tsx';
import HabitModule from './components/HabitModule.tsx';
import ShadowWorkModule from './components/ShadowWorkModule.tsx';
import ActionModule from './components/ActionModule.tsx';
import ReflectionModule from './components/ReflectionModule.tsx';
import { HomeIcon, ZapIcon, BookOpenIcon, ClipboardCheckIcon, BrainIcon, XCircleIcon, AwardIcon, PlusIcon } from './components/Icons.tsx';
import { CHALLENGE_TEMPLATES, SEVEN_HABITS_DETAILS } from './constants.ts';

type Tab = 'home' | 'habits' | 'action' | 'reflection';

// --- START: Journal Modals (moved from CognitiveJournalModule) ---

const JournalTypeSelectionModal: React.FC<{
    onSelect: (type: 'cbt' | 'free' | 'impact') => void;
    onClose: () => void;
}> = ({ onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fade-in text-center">
                <h2 className="text-xl font-bold text-slate-800 mb-4">どちらのジャーナルを書きますか？</h2>
                <div className="space-y-3">
                    <button onClick={() => onSelect('cbt')} className="w-full p-4 border border-slate-300 rounded-lg hover:bg-slate-50 text-left">
                        <h3 className="font-bold text-blue-600 flex items-center gap-2"><BrainIcon className="w-5 h-5"/> 思考改善ジャーナル (CBT)</h3>
                        <p className="text-sm text-slate-600 mt-1">思考の癖を見つけ、悪習慣を断ち切りたい時に。</p>
                    </button>
                     <button onClick={() => onSelect('impact')} className="w-full p-4 border border-slate-300 rounded-lg hover:bg-slate-50 text-left">
                        <h3 className="font-bold text-yellow-600 flex items-center gap-2"><AwardIcon className="w-5 h-5"/> インパクトログ</h3>
                        <p className="text-sm text-slate-600 mt-1">自分の行動が与えた良い影響を記録する時に。</p>
                    </button>
                    <button onClick={() => onSelect('free')} className="w-full p-4 border border-slate-300 rounded-lg hover:bg-slate-50 text-left">
                        <h3 className="font-bold text-green-600 flex items-center gap-2"><BookOpenIcon className="w-5 h-5"/> フリージャーナル</h3>
                        <p className="text-sm text-slate-600 mt-1">頭に浮かんだことを自由に書き出したい時に。</p>
                    </button>
                </div>
                 <button onClick={onClose} className="mt-6 text-sm text-slate-500 hover:underline">キャンセル</button>
            </div>
        </div>
    );
};


const FreeJournalModal: React.FC<{
    onSave: (entry: Omit<FreeJournalEntry, 'id' | 'date' | 'type'>) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [impactfulEvent, setImpactfulEvent] = useState('');
    const [emotionsFelt, setEmotionsFelt] = useState('');
    const [reasoning, setReasoning] = useState('');

    const handleSave = () => {
        if (!title.trim() || !content.trim()) return;
        onSave({ title, content, impactfulEvent, emotionsFelt, reasoning });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg h-[90vh] flex flex-col animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">フリージャーナル</h2>
                    <button onClick={onClose}><XCircleIcon className="w-7 h-7 text-slate-400"/></button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="タイトル"
                        className="w-full p-2 border bg-white border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="今日あったこと、感じたことなどを自由に書きましょう..."
                        className="w-full h-48 p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                     <details className="mt-4 bg-slate-50 p-3 rounded-lg">
                        <summary className="font-semibold text-slate-700 cursor-pointer">今日のインパクト・ログ (任意)</summary>
                        <div className="mt-4 space-y-3 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">最もインパクトのあった出来事</label>
                                <textarea value={impactfulEvent} onChange={e => setImpactfulEvent(e.target.value)} className="w-full p-2 border bg-white border-slate-300 rounded-lg h-20 focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">それによってどう感情が動いたか</label>
                                <textarea value={emotionsFelt} onChange={e => setEmotionsFelt(e.target.value)} className="w-full p-2 border bg-white border-slate-300 rounded-lg h-20 focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">なぜ、その感情が生まれたか (考察)</label>
                                <textarea value={reasoning} onChange={e => setReasoning(e.target.value)} className="w-full p-2 border bg-white border-slate-300 rounded-lg h-20 focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                        </div>
                    </details>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">保存</button>
                </div>
            </div>
        </div>
    );
};

const ImpactLogModal: React.FC<{
    onSave: (entry: Omit<ImpactLogEntry, 'id' | 'date' | 'type'>) => void;
    onClose: () => void;
    prefill?: Partial<ImpactLogEntry>;
}> = ({ onSave, onClose, prefill }) => {
    const [myAction, setMyAction] = useState(prefill?.myAction || '');
    const [impact, setImpact] = useState('');
    const [feeling, setFeeling] = useState('');
    const [relatedHabits, setRelatedHabits] = useState<Habit7Id[]>(prefill?.relatedHabits || []);

    const toggleHabit = (habitId: Habit7Id) => {
        setRelatedHabits(prev => 
            prev.includes(habitId) 
                ? prev.filter(id => id !== habitId)
                : [...prev, habitId]
        );
    };

    const handleSave = () => {
        if (!myAction.trim() || !impact.trim() || !feeling.trim()) return;
        onSave({ myAction, impact, feeling, relatedHabits });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg h-[90vh] flex flex-col animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><AwardIcon className="w-6 h-6 text-yellow-500" /> インパクトログ</h2>
                    <button onClick={onClose}><XCircleIcon className="w-7 h-7 text-slate-400"/></button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <div>
                        <label className="font-semibold text-slate-700 mb-1 block">私の行動</label>
                        <textarea value={myAction} onChange={e => setMyAction(e.target.value)} placeholder="実行した「今日の誓約」や、その他のポジティブな行動" className="w-full p-2 border bg-white border-slate-300 rounded-lg h-20 focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div>
                        <label className="font-semibold text-slate-700 mb-1 block">生まれた影響</label>
                        <textarea value={impact} onChange={e => setImpact(e.target.value)} placeholder="その行動によって、誰に、どのような良い影響がありましたか？" className="w-full p-2 border bg-white border-slate-300 rounded-lg h-20 focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                     <div>
                        <label className="font-semibold text-slate-700 mb-1 block">得られた感情</label>
                        <textarea value={feeling} onChange={e => setFeeling(e.target.value)} placeholder="その結果、自分が何を感じましたか？（例：誇らしい、嬉しい）" className="w-full p-2 border bg-white border-slate-300 rounded-lg h-20 focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div>
                        <label className="font-semibold text-slate-700 mb-2 block">関連する習慣</label>
                        <div className="flex flex-wrap gap-2">
                            {SEVEN_HABITS_DETAILS.map(habit => (
                                <button key={habit.id} onClick={() => toggleHabit(habit.id)} className={`px-3 py-1 text-sm rounded-full border ${relatedHabits.includes(habit.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}>
                                    {habit.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">保存</button>
                </div>
            </div>
        </div>
    );
};

const ABCDEWizard: React.FC<{
    onSave: (entry: Omit<CognitiveJournalEntry, 'id' | 'date' | 'type'>) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        activatingEvent: { text: '', tags: [] as string[] },
        belief: '',
        consequence: { text: '', tags: [] as string[] },
        disputation: '',
        effectiveNewBelief: '',
    });
    
    const STEPS = [
        { key: 'A', title: '引き金', description: '悪習慣の引き金になった出来事を具体的に教えてください。' },
        { key: 'B', title: '自動思考', description: 'その時、頭に浮かんだ「言い訳」や「考え」は何でしたか？' },
        { key: 'C', title: '結果', description: 'その結果、どうなりましたか？（行動や感情）' },
        { key: 'D', title: '反論', description: 'その考え(B)に対して、賢いあなたが反論するなら何と言いますか？' },
        { key: 'E', title: '新しい考え', description: 'では、次からはどう考え、どう行動しますか？ (If-Thenルール)' },
    ];

    const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const renderStepContent = () => {
        const currentStepDetails = STEPS[step - 1];
        let value, onChange;

        switch (step) {
            case 1:
                value = data.activatingEvent.text;
                onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setData(d => ({ ...d, activatingEvent: { ...d.activatingEvent, text: e.target.value } }));
                break;
            case 2:
                value = data.belief;
                onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setData(d => ({ ...d, belief: e.target.value }));
                break;
            case 3:
                value = data.consequence.text;
                onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setData(d => ({ ...d, consequence: { ...d.consequence, text: e.target.value } }));
                break;
            case 4:
                value = data.disputation;
                onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setData(d => ({ ...d, disputation: e.target.value }));
                break;
            case 5:
                value = data.effectiveNewBelief;
                onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setData(d => ({ ...d, effectiveNewBelief: e.target.value }));
                break;
            default:
                return null;
        }

        return (
            <div>
                <h3 className="font-semibold text-slate-700 mb-2">{currentStepDetails.key}: {currentStepDetails.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{currentStepDetails.description}</p>
                <textarea value={value} onChange={onChange} className="w-full h-32 p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
        );
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg h-[90vh] flex flex-col animate-fade-in">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">思考改善ジャーナル (CBT)</h2>
                     <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <XCircleIcon className="w-7 h-7"/>
                    </button>
                </div>
                
                <div className="my-4">
                    <div className="flex justify-between mb-1">
                        {STEPS.map((s, i) => (
                            <span key={s.key} className={`text-xs font-bold ${step > i ? 'text-blue-600' : 'text-slate-400'}`}>{s.title}</span>
                        ))}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(step / STEPS.length) * 100}%`, transition: 'width 0.3s ease-in-out' }}></div>
                    </div>
                </div>

                <div className="flex-grow space-y-4">{renderStepContent()}</div>
                
                <div className="flex justify-between mt-6">
                    <button onClick={handlePrev} disabled={step === 1} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold disabled:opacity-50">戻る</button>
                    {step < 5 && <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">次へ</button>}
                    {step === 5 && <button onClick={() => { onSave(data); onClose(); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">保存</button>}
                </div>
            </div>
        </div>
    );
};

// --- END: Journal Modals ---


const TAB_CONFIG: Record<Tab, { label: string; icon: React.FC<any> }> = {
    home: { label: 'ホーム', icon: HomeIcon },
    habits: { label: '習慣', icon: ClipboardCheckIcon },
    action: { label: 'アクション', icon: ZapIcon },
    reflection: { label: '内省', icon: BookOpenIcon },
};


const MotivationQuizModal: React.FC<{ onComplete: (type: MotivationType) => void }> = ({ onComplete }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fade-in text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">はじめに</h2>
            <p className="text-slate-600 mb-6">あなたをより深く理解するため、簡単な質問にお答えください。</p>
            <p className="font-semibold mb-4">「成功を達成すること」と「失敗を回避すること」、どちらにより強く動機づけられますか？</p>
            <div className="space-y-3">
                <button onClick={() => onComplete('approach')} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">成功を達成すること (欲望接近型)</button>
                <button onClick={() => onComplete('avoidance')} className="w-full py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-semibold">失敗を回避すること (危機回避型)</button>
            </div>
        </div>
    </div>
);


const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('home');
    
    // State management with localStorage
    const [profile, setProfile] = useLocalStorage<UserProfile>('self_mastery_profile_v3', { 
        motivationType: 'unknown', 
        shadowWorkPasscode: null, 
        values: '',
        habit7Assessments: undefined,
        dailyFocuses: [] 
    });
    const [bigRocks, setBigRocks] = useLocalStorage<BigRock[]>('bigRocks_v2', []);
    const [impulseLogs, setImpulseLogs] = useLocalStorage<ImpulseLog[]>('impulseLogs', []);
    const [trustScore, setTrustScore] = useLocalStorage<number>('trustScore', 70);
    const [impulseTimerDuration, setImpulseTimerDuration] = useLocalStorage<number>('impulseTimerDuration', 5 * 60);
    const [challenges, setChallenges] = useLocalStorage<Challenge[]>('challenges', CHALLENGE_TEMPLATES);
    const [completedChallenges, setCompletedChallenges] = useLocalStorage<CompletedChallenge[]>('completedChallenges', []);
    const [routines, setRoutines] = useLocalStorage<Routine[]>('routines_v2', []);
    const [badHabits, setBadHabits] = useLocalStorage<BadHabit[]>('badHabits_v1', []);
    const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('journalEntries_v3', []);
    // FIX: Define shadowJournal and beliefLibrary state to resolve 'Cannot find name' errors.
    const [shadowJournal, setShadowJournal] = useLocalStorage<ShadowJournalEntry[]>('shadowJournal_v2', []);
    const [beliefLibrary, setBeliefLibrary] = useLocalStorage<Belief[]>('beliefLibrary_v2', []);

    // Shared state for opening journal modals from any component
    const [journalModal, setJournalModal] = useState<{
        isOpen: boolean;
        type: 'cbt' | 'free' | 'impact' | 'selecting' | null;
        prefill?: Partial<ImpactLogEntry>;
    }>({ isOpen: false, type: null, prefill: undefined });

    const closeModal = () => setJournalModal({ isOpen: false, type: null, prefill: undefined });

    const handleSaveCBT = (entryData: Omit<CognitiveJournalEntry, 'id' | 'date' | 'type'>) => {
        const newEntry: CognitiveJournalEntry = { id: `cbt-${Date.now()}`, date: Date.now(), type: 'cbt', ...entryData };
        setJournalEntries(prev => [newEntry, ...prev].sort((a,b) => b.date - a.date));
        
        if(window.confirm(`「${entryData.effectiveNewBelief}」\n\nこの新しい行動を習慣として追加しますか？`)) {
            const newRoutine: Routine = { id: `r-cbt-${Date.now()}`, name: `思考改善ルール: ${entryData.activatingEvent.text.substring(0, 10)}...`, blocks: [{ id: `b-cbt-${Date.now()}`, title: entryData.effectiveNewBelief, duration: 5 }], };
            setRoutines(prev => [...prev, newRoutine]);
            alert("新しい習慣が習慣モジュールに追加されました！");
        }
    };
    
    const handleSaveFree = (entryData: Omit<FreeJournalEntry, 'id' | 'date' | 'type'>) => {
        const newEntry: FreeJournalEntry = { id: `free-${Date.now()}`, date: Date.now(), type: 'free', ...entryData };
        setJournalEntries(prev => [newEntry, ...prev].sort((a,b) => b.date - a.date));
    };
    
    const handleSaveImpact = (entryData: Omit<ImpactLogEntry, 'id' | 'date' | 'type'>) => {
        const newEntry: ImpactLogEntry = { id: `impact-${Date.now()}`, date: Date.now(), type: 'impact', ...entryData };
        setJournalEntries(prev => [newEntry, ...prev].sort((a,b) => b.date - a.date));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <div className="p-4"><GoalModule bigRocks={bigRocks} setBigRocks={setBigRocks} motivationType={profile.motivationType} profile={profile} setProfile={setProfile} /></div>;
            case 'habits':
                return <HabitModule
                    routines={routines}
                    setRoutines={setRoutines}
                    badHabits={badHabits}
                    setBadHabits={setBadHabits}
                    profile={profile}
                    setProfile={setProfile}
                    journalEntries={journalEntries}
                    setJournalModal={setJournalModal}
                />;
            case 'action':
                return <ActionModule
                    impulseLogs={impulseLogs}
                    setImpulseLogs={setImpulseLogs}
                    trustScore={trustScore}
                    setTrustScore={setTrustScore}
                    impulseTimerDuration={impulseTimerDuration}
                    setImpulseTimerDuration={setImpulseTimerDuration}
                    bigRocks={bigRocks}
                    challenges={challenges}
                    setChallenges={setChallenges}
                    completedChallenges={completedChallenges}
                    setCompletedChallenges={setCompletedChallenges}
                />;
            case 'reflection':
                 return <ReflectionModule
                    journalEntries={journalEntries}
                    routines={routines}
                    shadowJournal={shadowJournal}
                    setShadowJournal={setShadowJournal}
                    beliefs={beliefLibrary}
                    setBeliefs={setBeliefLibrary}
                    profile={profile}
                    setProfile={setProfile}
                    completedChallenges={completedChallenges}
                    impulseLogs={impulseLogs}
                    badHabits={badHabits}
                    setJournalModal={setJournalModal}
                 />;
            default:
                return null;
        }
    };
    
    const TabButton: React.FC<{ tabName: Tab }> = ({ tabName }) => {
        const isActive = activeTab === tabName;
        const config = TAB_CONFIG[tabName];
        const Icon = config.icon;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`flex-1 py-2 text-center transition-colors duration-200 relative ${
                    isActive ? 'text-blue-600' : 'text-slate-500 hover:text-blue-500'
                }`}
            >
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full"></div>}
                <Icon className={`w-6 h-6 mx-auto ${isActive ? '' : ''}`} />
                <span className="text-xs font-bold">{config.label}</span>
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            {profile.motivationType === 'unknown' && 
                <MotivationQuizModal onComplete={type => setProfile(p => ({...p, motivationType: type}))} />
            }
            
            {/* Render Journal Modals Here */}
            {journalModal.isOpen && journalModal.type === 'selecting' && <JournalTypeSelectionModal onClose={closeModal} onSelect={(type) => setJournalModal(prev => ({ ...prev, type }))} />}
            {journalModal.isOpen && journalModal.type === 'cbt' && <ABCDEWizard onSave={handleSaveCBT} onClose={closeModal} />}
            {journalModal.isOpen && journalModal.type === 'free' && <FreeJournalModal onSave={handleSaveFree} onClose={closeModal} />}
            {journalModal.isOpen && journalModal.type === 'impact' && <ImpactLogModal onSave={handleSaveImpact} onClose={closeModal} prefill={journalModal.prefill} />}


            <header className="bg-white shadow-sm sticky top-0 z-10 px-4">
                <h1 className="text-xl font-bold text-center py-4 text-slate-800">{TAB_CONFIG[activeTab].label}</h1>
            </header>
            
            <main className="pb-20">
                {renderContent()}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10 flex justify-around">
                {(Object.keys(TAB_CONFIG) as Tab[]).map(tab => <TabButton key={tab} tabName={tab} />)}
            </nav>
        </div>
    );
};

export default App;