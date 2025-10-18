import React, { useState, useEffect } from 'react';
// FIX: Add .ts/.tsx extensions to imports to resolve modules.
import { BigRock, VisionBoard, CommitmentContract, MotivationType, AlbertLesson, UserProfile } from '../types.ts';
// FIX: Import 'XCircleIcon' to resolve 'Cannot find name' error.
import { PlusIcon, EditIcon, TrashIcon, PhotoIcon, AwardIcon, AlertTriangleIcon, SparklesIcon, XCircleIcon, BookOpenIcon } from './Icons.tsx';
import { ALBERT_LESSONS } from '../philosophy.ts';

interface GoalModuleProps {
    bigRocks: BigRock[];
    setBigRocks: React.Dispatch<React.SetStateAction<BigRock[]>>;
    motivationType: MotivationType;
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const TodaysFocus: React.FC = () => {
    const [lesson, setLesson] = useState<AlbertLesson | null>(null);

    useEffect(() => {
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem('lesson_date');
        let dailyLesson;

        if (lastDate === today) {
            dailyLesson = JSON.parse(localStorage.getItem('daily_lesson') || '{}');
        } else {
            dailyLesson = ALBERT_LESSONS[Math.floor(Math.random() * ALBERT_LESSONS.length)];
            localStorage.setItem('daily_lesson', JSON.stringify(dailyLesson));
            localStorage.setItem('lesson_date', today);
        }
        setLesson(dailyLesson);
    }, []);

    if (!lesson) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-5 rounded-xl shadow-lg mb-6 animate-fade-in">
            <h3 className="font-bold text-sm opacity-80 mb-2 flex items-center gap-2"><BookOpenIcon className="w-5 h-5"/> 今日の教訓</h3>
            <p className="font-bold text-lg mb-2">#{lesson.id}: {lesson.title}</p>
            <p className="text-sm opacity-90">{lesson.prompt}</p>
        </div>
    );
};

const ValuesEditor: React.FC<{ profile: UserProfile; setProfile: React.Dispatch<React.SetStateAction<UserProfile>> }> = ({ profile, setProfile }) => {
    const [values, setValues] = useState(profile.values || '');
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        setProfile(p => ({ ...p, values }));
        setIsEditing(false);
    };

    return (
        <details className="bg-white p-4 rounded-xl shadow-md" open={!profile.values}>
            <summary className="font-bold text-lg text-slate-800 cursor-pointer">私の価値観</summary>
            <div className="mt-4">
                {isEditing ? (
                    <>
                        <textarea
                            value={values}
                            onChange={(e) => setValues(e.target.value)}
                            className="w-full h-24 p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="あなたが人生で最も大切にしていることは何ですか？（例：成長、貢献、自由、誠実さなど）"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => { setIsEditing(false); setValues(profile.values || ''); }} className="px-3 py-1 bg-slate-200 rounded-md text-sm">キャンセル</button>
                            <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">保存</button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-slate-600 whitespace-pre-wrap min-h-[4rem]">{profile.values || '価値観を定義して、行動の指針としましょう。'}</p>
                        <div className="text-right mt-2">
                            <button onClick={() => setIsEditing(true)} className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1 ml-auto">
                                <EditIcon className="w-4 h-4"/>
                                編集
                            </button>
                        </div>
                    </>
                )}
            </div>
        </details>
    );
};


const GoalWizard: React.FC<{
    onSave: (rock: Omit<BigRock, 'id' | 'status'>) => void;
    onClose: () => void;
    rockToEdit?: BigRock | null;
}> = ({ onSave, onClose, rockToEdit }) => {
    const [visionBoard, setVisionBoard] = useState<VisionBoard>(rockToEdit?.visionBoard || { title: '', images: [], affirmations: '' });
    const [commitmentContract, setCommitmentContract] = useState<CommitmentContract>(rockToEdit?.commitmentContract || { reward: '', penalty: '' });
    const [useContract, setUseContract] = useState(!!rockToEdit?.commitmentContract);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && visionBoard.images.length < 3) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setVisionBoard(vb => ({ ...vb, images: [...vb.images, base64] }));
        }
    };

    const handleSave = () => {
        if (!visionBoard.title.trim()) return;
        onSave({
            visionBoard,
            commitmentContract: useContract && (commitmentContract.reward || commitmentContract.penalty) ? commitmentContract : undefined,
        });
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg animate-slide-in-up space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">{rockToEdit ? 'ビジョンを編集する' : '新しいビジョンを作成'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <XCircleIcon className="w-7 h-7"/>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="font-semibold text-slate-700 mb-2 block">ビジョンのタイトル</label>
                        <input type="text" value={visionBoard.title} onChange={e => setVisionBoard(vb => ({...vb, title: e.target.value}))} placeholder="例：健康的な身体を手に入れる" className="w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="font-semibold text-slate-700 mb-2 block">アファメーション</label>
                        <textarea value={visionBoard.affirmations} onChange={e => setVisionBoard(vb => ({...vb, affirmations: e.target.value}))} placeholder="達成した時の自分を肯定する言葉" className="w-full p-2 border bg-white border-slate-300 rounded-lg h-20 focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div>
                        <label className="font-semibold text-slate-700 mb-2 block">インスピレーション画像 (3枚まで)</label>
                        <div className="flex gap-2 items-center">
                            {visionBoard.images.map((img, i) => <img key={i} src={img} className="w-20 h-20 rounded-md object-cover shadow-sm"/>)}
                            {visionBoard.images.length < 3 && (
                                <label className="w-20 h-20 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-slate-50">
                                    <PhotoIcon className="w-8 h-8 text-slate-400"/>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
                                </label>
                            )}
                        </div>
                    </div>

                    <details className="bg-slate-50 p-3 rounded-lg" open={useContract}>
                        <summary className="font-semibold text-slate-700 cursor-pointer" onClick={(e) => { e.preventDefault(); setUseContract(!useContract); }}>
                            自分との約束（コミットメント契約）
                        </summary>
                        <div className="mt-4 space-y-4 animate-fade-in">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-green-700"><AwardIcon className="w-5 h-5"/>ご褒美</label>
                                <input type="text" value={commitmentContract.reward} onChange={e => setCommitmentContract(cc => ({...cc, reward: e.target.value}))} placeholder="達成したら、自分に何を許可しますか？" className="mt-1 w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"/>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-red-700"><AlertTriangleIcon className="w-5 h-5"/>罰</label>
                                <input type="text" value={commitmentContract.penalty} onChange={e => setCommitmentContract(cc => ({...cc, penalty: e.target.value}))} placeholder="もし達成できなかったら、何をしますか？" className="mt-1 w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"/>
                            </div>
                        </div>
                    </details>
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} disabled={!visionBoard.title.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md disabled:bg-blue-300">保存する</button>
                </div>
            </div>
        </div>
    );
};


const GoalModule: React.FC<GoalModuleProps> = ({ bigRocks, setBigRocks, motivationType, profile, setProfile }) => {
    const [editingState, setEditingState] = useState<{rock: BigRock | null, isAdding: boolean}>({rock: null, isAdding: false});

    const handleSave = (rockData: Omit<BigRock, 'id' | 'status'>) => {
        if (editingState.rock) {
            setBigRocks(bigRocks.map(r => r.id === editingState.rock!.id ? { ...editingState.rock!, ...rockData } : r));
        } else {
            const newRock: BigRock = {
                id: `br-${Date.now()}`,
                status: 'todo',
                ...rockData,
            };
            setBigRocks([...bigRocks, newRock]);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('このビジョンを本当に削除しますか？')) {
            setBigRocks(bigRocks.filter(r => r.id !== id));
        }
    };

    const toggleStatus = (id: string) => {
        setBigRocks(bigRocks.map(r => {
            if (r.id === id) {
                if (r.status === 'done') return { ...r, status: 'todo' };
                if (r.status === 'todo') return { ...r, status: 'in_progress' };
                if (r.status === 'in_progress') {
                    if(r.commitmentContract?.reward) {
                       alert(`素晴らしい！目標達成です！\n\n自分へのご褒美を忘れずに: 「${r.commitmentContract.reward}」`);
                    }
                    return { ...r, status: 'done' };
                }
            }
            return r;
        }));
    };
    
    const getStatusStyles = (status: BigRock['status']) => {
        switch(status) {
            case 'todo': return 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300';
            case 'in_progress': return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500';
            case 'done': return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 opacity-80';
        }
    }
    
    const getStatusText = (status: BigRock['status']) => {
        switch(status) {
            case 'todo': return '未着手';
            case 'in_progress': return '進行中';
            case 'done': return '完了';
        }
    }
    
    const getProgress = (status: BigRock['status']) => {
        switch(status) {
            case 'todo': return 5;
            case 'in_progress': return 50;
            case 'done': return 100;
        }
    };

    const getMotivationMessage = () => {
        if (motivationType === 'approach') {
            return "このビジョンを達成すれば、理想の自分にまた一歩近づきます！";
        }
        if (motivationType === 'avoidance') {
            return "今日これを進めておけば、将来の不安を一つ減らせますよ。";
        }
        return "あなたの人生で最も重要なビジョン（Big Rocks）を追加しましょう。";
    }

    return (
        <div className="space-y-6">
            <TodaysFocus />
            <ValuesEditor profile={profile} setProfile={setProfile} />

            {(editingState.isAdding || editingState.rock) && (
                <GoalWizard
                    onSave={handleSave}
                    onClose={() => setEditingState({rock: null, isAdding: false})}
                    rockToEdit={editingState.rock}
                />
            )}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4 text-center flex items-center justify-center gap-2"><SparklesIcon className="w-6 h-6 text-yellow-500" /> Big Rocks - 人生のビジョン</h2>
                <div className="space-y-4">
                    {bigRocks.map(rock => (
                        <div key={rock.id} className={`p-4 rounded-lg border-l-4 transition-all ${getStatusStyles(rock.status)}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-grow">
                                    <p className="font-bold text-slate-800 text-lg">{rock.visionBoard.title}</p>
                                    <p className="text-sm text-slate-600 mt-1 italic">"{rock.visionBoard.affirmations}"</p>
                                    {rock.visionBoard.images.length > 0 && (
                                        <div className="flex gap-2 mt-3">
                                            {rock.visionBoard.images.map((img, i) => <img key={i} src={img} className="w-16 h-16 rounded-md object-cover shadow-sm"/>)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-1 items-center flex-shrink-0">
                                    <button onClick={() => setEditingState({rock, isAdding: false})} className="text-slate-400 hover:text-blue-600 p-1"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(rock.id)} className="text-slate-400 hover:text-red-600 p-1"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <button onClick={() => toggleStatus(rock.id)} className={`text-sm font-semibold px-3 py-1 rounded-full ${rock.status === 'in_progress' ? 'animate-pulse' : ''} bg-slate-200 text-slate-700 hover:bg-slate-300`}>
                                        ステータス: {getStatusText(rock.status)}
                                    </button>
                                    {rock.commitmentContract && (
                                        <div className="text-xs text-right">
                                            {rock.commitmentContract.reward && <p className="text-green-600">🏆 {rock.commitmentContract.reward}</p>}
                                            {rock.commitmentContract.penalty && <p className="text-red-600">⚠️ {rock.commitmentContract.penalty}</p>}
                                        </div>
                                    )}
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div className={`h-2 rounded-full transition-all duration-500 ${rock.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`} style={{width: `${getProgress(rock.status)}%`}}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                     {bigRocks.length === 0 && <p className="text-center text-slate-500 p-4">{getMotivationMessage()}</p>}
                </div>
            </div>
            <button onClick={() => setEditingState({rock: null, isAdding: true})} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md flex items-center justify-center gap-2">
                <PlusIcon className="w-5 h-5" />
                新しいビジョンを作成
            </button>
        </div>
    );
};

export default GoalModule;