import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
// FIX: Import SEVEN_HABITS_IDS from types.ts
import { JournalEntry, Routine, CompletedChallenge, ImpulseLog, UserProfile, BadHabit, SEVEN_HABITS_IDS } from '../types.ts';
import { SparklesIcon, CalendarIcon } from './Icons.tsx';
import { SEVEN_HABITS_DETAILS } from '../constants.ts';

interface WeeklyReviewModuleProps {
    journalEntries: JournalEntry[];
    routines: Routine[];
    completedChallenges: CompletedChallenge[];
    impulseLogs: ImpulseLog[];
    profile: UserProfile;
    badHabits: BadHabit[];
}

const WeeklyReviewModule: React.FC<WeeklyReviewModuleProps> = ({ journalEntries, routines, completedChallenges, impulseLogs, profile, badHabits }) => {
    const [review, setReview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generateReview = async () => {
        setIsLoading(true);
        setError('');
        setReview('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            
            const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            const recentData = {
                journals: journalEntries.filter(e => e.date >= oneWeekAgo),
                challenges: completedChallenges.filter(c => c.date >= oneWeekAgo),
                impulses: impulseLogs.filter(l => l.timestamp >= oneWeekAgo),
                victories: routines.flatMap(r => r.victorsLog || []).filter(v => v.date >= oneWeekAgo),
                badHabits: badHabits.map(h => ({
                    name: h.name,
                    logs: h.logs.filter(l => l.timestamp >= oneWeekAgo)
                }))
            };
            
            const journalsSummary = recentData.journals.map(e => {
                if (e.type === 'free' && e.impactfulEvent) {
                    return `フリージャーナル(インパクト有): ${e.title} - ${e.impactfulEvent}`;
                }
                if (e.type === 'impact') {
                    return `インパクトログ: ${e.myAction}`;
                }
                return `ジャーナル: ${e.type}`;
            }).slice(0, 5);
            
            const badHabitsSummary = recentData.badHabits.map(h => {
                 const total = h.logs.length;
                 const resisted = h.logs.filter(l => l.resisted).length;
                 const successRate = total > 0 ? Math.round((resisted/total) * 100) : 'N/A';
                 return `${h.name} (成功率: ${successRate}%)`;
            }).join(', ');
            
            const assessmentsSummary = profile.habit7Assessments 
                ? SEVEN_HABITS_IDS.map(id => `${SEVEN_HABITS_DETAILS.find(h=>h.id===id)?.title}: ${profile.habit7Assessments?.[id] || 'N/A'}`).join(' | ')
                : '未評価';
            const recentFocuses = (profile.dailyFocuses || []).filter(f => new Date(f.date).getTime() >= oneWeekAgo);
            const focusSummary = recentFocuses.length > 0
                ? `${recentFocuses.length}回設定し、そのうち${recentFocuses.filter(f=>f.isCompleted).length}回達成しました。`
                : '未設定';


            const prompt = `
あなたは、ポジティブで洞察力に優れたライフコーチです。クライアントの過去1週間の活動記録を分析し、建設的な週次レビューを作成してください。

### クライアント情報:
- **価値観:** "${profile.values || '未設定'}"
- **成長習慣の自己評価:** ${assessmentsSummary}

### 過去1週間の活動記録:
1.  **達成したチャレンジ:** ${recentData.challenges.length}件
2.  **衝動制御の成功率:** ${recentData.impulses.length > 0 ? Math.round(recentData.impulses.filter(l => l.resisted).length / recentData.impulses.length * 100) : 0}%
3.  **ジャーナルの記録:** ${recentData.journals.length}件 (抜粋: ${journalsSummary.join(', ')})
4.  **小さな勝利の記録:** ${recentData.victories.length}件
5.  **悪習慣の克服:** ${badHabitsSummary || 'なし'}
6.  **今週のフォーカス達成状況:** ${focusSummary}

### あなたのタスク:
以下の構成で、クライアントを励まし、次の1週間へのモチベーションを高めるレビューを作成してください。必ずクライアントの価値観や自己評価を考慮に入れ、悪習慣の克服や、ジャーナル（特にインパクト・ログ）から読み取れる感情や出来事にも触れてください。出力はMarkdown形式で、読みやすくしてください。

1.  **🎉 今週のハイライト:**
    - 最も称賛すべき点を具体的に挙げてください。
    - 価値観と行動が一致している点を指摘してください。

2.  **💡 成長の機会:**
    - データに基づき、改善できる点を優しく指摘してください。（例：自己評価が高いのに活動が伴っていない習慣、悪習慣の成功率が低い点など）
    - 成長のための具体的なヒントを1つか2つ提案してください。

3.  **🚀 来週へのアクションプラン:**
    - 次の1週間で集中すべきことを、具体的で実行可能なステップとして2〜3個提案してください。
    - クライアントがワクワクするような、ポジティブな言葉で締めくくってください。
`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setReview(response.text);

        } catch (e) {
            console.error("Error generating weekly review:", e);
            setError('レビューの生成中にエラーが発生しました。もう一度お試しください。');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderFormattedText = (text: string) => {
        // Simple markdown to HTML conversion
        let html = text
            .replace(/### (.*)/g, '<h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^- (.*)/gm, '<li class="ml-5 list-disc">$1</li>')
            .replace(/^1\. (.*)/gm, '<li class="ml-5 list-decimal">$1</li>')
            .replace(/^2\. (.*)/gm, '<li class="ml-5 list-decimal">$1</li>')
            .replace(/^3\. (.*)/gm, '<li class="ml-5 list-decimal">$1</li>')
            .replace(/\n/g, '<br />');

        // Clean up list formatting
        html = html.replace(/<br \s*\/?>\s*<li/g, '<li');
        
        return html;
    };


    return (
        <div className="p-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-center">
                    <CalendarIcon className="w-12 h-12 mx-auto text-blue-500" />
                    <h2 className="text-xl font-bold text-slate-800 mt-2">週次レビュー</h2>
                    <p className="text-slate-500 text-sm mt-1">AIコーチがあなたの1週間を振り返り、次へのステップを提案します。</p>
                </div>

                <div className="mt-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48 bg-slate-50 rounded-lg">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="ml-4 text-slate-600">あなたの1週間を分析中...</p>
                        </div>
                    ) : review ? (
                        <div className="p-4 bg-blue-50 rounded-lg space-y-2 text-slate-700" dangerouslySetInnerHTML={{ __html: renderFormattedText(review) }}></div>
                    ) : (
                        <div className="text-center p-8 bg-slate-50 rounded-lg">
                            <p className="text-slate-600">準備ができたら、下のボタンを押してレビューを生成しましょう。</p>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                </div>

                <button 
                    onClick={generateReview} 
                    disabled={isLoading}
                    className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md flex items-center justify-center gap-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {isLoading ? '生成中...' : '週次レビューを生成する'}
                </button>
            </div>
        </div>
    );
};

export default WeeklyReviewModule;