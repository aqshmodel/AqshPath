import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
// FIX: Import SEVEN_HABITS_IDS from types.ts
import { JournalEntry, Routine, Habit7Id, BadHabit, UserProfile, SEVEN_HABITS_IDS } from '../types.ts';
// FIX: Import 'XCircleIcon' to resolve 'Cannot find name' error.
import { PlusIcon, BrainIcon, ChevronRightIcon, XCircleIcon, SparklesIcon, BookOpenIcon, AwardIcon } from './Icons.tsx';
import { SEVEN_HABITS_DETAILS } from '../constants.ts';

interface CognitiveJournalModuleProps {
    entries: JournalEntry[];
    routines: Routine[];
    badHabits?: BadHabit[]; // Made optional for ReflectionModule
    profile: UserProfile;
    setJournalModal: React.Dispatch<React.SetStateAction<{ isOpen: boolean; type: 'cbt' | 'free' | 'impact' | 'selecting' | null; prefill?: Partial<any>}>>;
}

interface AICoachProps {
    entries: JournalEntry[];
    badHabits: BadHabit[];
    routines: Routine[];
    profile: UserProfile;
}

const AICoach: React.FC<AICoachProps> = ({ entries, badHabits, routines, profile }) => {
    const [aiAdvice, setAiAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getAIAdvice = async () => {
        setIsLoading(true);
        setAiAdvice('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const latestEntries = entries.sort((a, b) => b.date - a.date).slice(0, 5);
            
            // FIX: Refactor mapping to correctly handle the discriminated union type `JournalEntry`.
            // After checking for 'cbt' and 'impact', the type is narrowed to 'free', removing the unreachable code path.
            const entriesForPrompt = latestEntries.map(e => {
                if (e.type === 'cbt') return { type: '思考改善ジャーナル', date: new Date(e.date).toLocaleDateString(), 引き金: e.activatingEvent.text, 自動思考: e.belief, 結果: e.consequence.text, 新しい考え: e.effectiveNewBelief };
                if (e.type === 'impact') return { type: 'インパクトログ', date: new Date(e.date).toLocaleDateString(), 私の行動: e.myAction, 生まれた影響: e.impact };
                
                // After the checks above, `e` is narrowed to `FreeJournalEntry`.
                const freeEntry: any = { type: 'フリージャーナル', date: new Date(e.date).toLocaleDateString(), title: e.title, content: e.content.substring(0, 100) + '...' };
                if (e.impactfulEvent) {
                    freeEntry['インパクト・ログ'] = {
                        出来事: e.impactfulEvent,
                        感情: e.emotionsFelt,
                        考察: e.reasoning
                    };
                }
                return freeEntry;
            });

            const badHabitsSummary = badHabits.map(h => {
                const total = h.logs.length;
                const resisted = h.logs.filter(l => l.resisted).length;
                const successRate = total > 0 ? Math.round((resisted/total) * 100) : 'N/A';
                return { 習慣: h.name, 成功率: `${successRate}% (${resisted}/${total})` };
            });

            const routinesSummary = routines.map(r => r.name).join(', ') || 'なし';
            const assessmentsSummary = profile.habit7Assessments 
                ? SEVEN_HABITS_IDS.map(id => `${SEVEN_HABITS_DETAILS.find(h=>h.id===id)?.title}: ${profile.habit7Assessments?.[id] || 'N/A'}`).join('\n')
                : '未評価';
            const todayStr = new Date().toISOString().split('T')[0];
            const todaysFocus = (profile.dailyFocuses || []).find(f => f.date === todayStr);
            const focusSummary = todaysFocus 
                ? `習慣: ${todaysFocus.habitIds.map(id => SEVEN_HABITS_DETAILS.find(h=>h.id===id)?.title).join(', ')}, アクション: "${todaysFocus.action}", 完了: ${todaysFocus.isCompleted ? 'はい' : 'いいえ'}`
                : '未設定';

            const prompt = `あなたは優秀なセラピスト兼ライフコーチです。以下は、ユーザーの活動記録です。
これらを総合的に分析し、ユーザーが直面している課題や感情を特定してください。そして、建設的で共感的なフィードバックと、次の一歩につながる具体的なアドバイスを提案してください。
特に悪習慣の克服、設定した習慣（マイ習慣）の実践、成長習慣の自己評価と実際の行動のギャップなどにも触れてください。
フリージャーナルに「インパクト・ログ」が記録されている場合は、その内容を深く分析し、ユーザーの感情の機微や重要な出来事も考慮に入れてください。
ユーザーを励ますような、ポジティブで優しい口調でお願いします。出力は、改行や太字（**テキスト**）などを使って読みやすくしてください。

### マイ習慣:
${routinesSummary}

### 成長習慣の自己評価 (5段階):
${assessmentsSummary}

### 今日のフォーカス:
${focusSummary}

### 最新のジャーナル履歴 (最大5件):
${JSON.stringify(entriesForPrompt, null, 2)}

### 悪習慣の克服状況:
${JSON.stringify(badHabitsSummary, null, 2)}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setAiAdvice(response.text);

        } catch (error) {
            console.error("Error getting AI advice:", error);
            setAiAdvice('申し訳ありません、アドバイスの生成中にエラーが発生しました。');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderFormattedText = (text: string) => {
        return text.split('\n').map((paragraph, index) => {
            if (!paragraph.trim()) return <br key={index} />;
            const parts = paragraph.split(/\*\*(.*?)\*\*/g);
            return ( <p key={index} className="mb-2"> {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part )} </p> );
        });
    };


    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-bold text-slate-800 mb-4">AIコーチからのフィードバック</h2>
            <div className="mt-6">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="w-6 h-6 text-white"/>
                    </div>
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex-grow min-h-[60px]">
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>AIコーチが分析中です...</span>
                            </div>
                        ) : aiAdvice ? (
                            <div>{renderFormattedText(aiAdvice)}</div>
                        ) : (
                            <p>ジャーナルを書くか、下のボタンを押すと、AIコーチからのパーソナライズされたアドバイスが表示されます。</p>
                        )}
                    </div>
                 </div>
                 <button onClick={getAIAdvice} disabled={isLoading} className="mt-3 w-full text-sm font-semibold text-blue-600 p-2 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed">
                     {isLoading ? '分析中...' : '最新のアドバイスをもらう'}
                 </button>
             </div>
        </div>
    );
};

const CognitiveJournalModule: React.FC<CognitiveJournalModuleProps> = ({ entries, routines, badHabits = [], profile, setJournalModal }) => {
    
    return (
        <div className="space-y-6">
            <AICoach entries={entries} badHabits={badHabits} routines={routines} profile={profile} />

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-bold text-slate-800 mb-4">ジャーナル履歴</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {entries.map(entry => (
                        <details key={entry.id} className="p-3 rounded-lg bg-slate-50 border group">
                            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2 flex-grow min-w-0">
                                  {entry.type === 'cbt' ? <BrainIcon className="w-5 h-5 text-blue-500 flex-shrink-0"/> : entry.type === 'impact' ? <AwardIcon className="w-5 h-5 text-yellow-500 flex-shrink-0"/> : <BookOpenIcon className="w-5 h-5 text-green-500 flex-shrink-0"/>}
                                  <span className="truncate">{entry.type === 'cbt' ? entry.activatingEvent.text : entry.type === 'impact' ? entry.myAction : entry.title}</span>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 group-open:rotate-90 transition-transform flex-shrink-0" />
                            </summary>
                             <div className="mt-2 border-t pt-2 space-y-1 text-sm text-slate-700">
                                <p><span className="font-bold">記録日:</span> {new Date(entry.date).toLocaleString()}</p>
                                {entry.type === 'cbt' ? (
                                    <>
                                        <p><span className="font-bold text-red-600">B (自動思考):</span> {entry.belief}</p>
                                        <p><span className="font-bold text-orange-600">C (結果):</span> {entry.consequence.text}</p>
                                        <p><span className="font-bold text-blue-600">D (反論):</span> {entry.disputation}</p>
                                        <p><span className="font-bold text-green-600">E (新しい考え):</span> {entry.effectiveNewBelief}</p>
                                    </>
                                ) : entry.type === 'impact' ? (
                                    <>
                                        <p><span className="font-bold text-blue-600">生まれた影響:</span> {entry.impact}</p>
                                        <p><span className="font-bold text-green-600">得られた感情:</span> {entry.feeling}</p>
                                        {entry.relatedHabits.length > 0 && <p><span className="font-bold">関連習慣:</span> {entry.relatedHabits.map(id => SEVEN_HABITS_DETAILS.find(h => h.id === id)?.title).join(', ')}</p>}
                                    </>
                                ) : (
                                    <>
                                     <p className="whitespace-pre-wrap mt-2">{entry.content}</p>
                                     {entry.impactfulEvent && (
                                         <div className="mt-3 pt-3 border-t border-slate-200">
                                             <h4 className="font-bold text-slate-600 mb-1">インパクト・ログ</h4>
                                             <p><span className="font-semibold">出来事:</span> {entry.impactfulEvent}</p>
                                             <p><span className="font-semibold">感情:</span> {entry.emotionsFelt}</p>
                                             <p><span className="font-semibold">考察:</span> {entry.reasoning}</p>
                                         </div>
                                     )}
                                    </>
                                )}
                             </div>
                        </details>
                    ))}
                    {entries.length === 0 && <p className="text-center text-slate-500 p-4">まだ記録がありません。</p>}
                </div>
            </div>
            
             <button onClick={() => setJournalModal({ isOpen: true, type: 'selecting', prefill: undefined })} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md flex items-center justify-center gap-2">
                <PlusIcon className="w-5 h-5" />
                ジャーナルを書く
            </button>
        </div>
    );
};

export default CognitiveJournalModule;