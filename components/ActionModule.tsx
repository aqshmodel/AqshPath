import React, { useState } from 'react';
import { BigRock, Challenge, CompletedChallenge, ImpulseLog } from '../types.ts';
import ImpulseModule from './ImpulseModule.tsx';
import ComfortZoneModule from './ComfortZoneModule.tsx';
import PomodoroModule from './PomodoroModule.tsx';
import { ZapIcon, CheckCircleIcon, ClockIcon } from './Icons.tsx';

interface ActionModuleProps {
    impulseLogs: ImpulseLog[];
    setImpulseLogs: React.Dispatch<React.SetStateAction<ImpulseLog[]>>;
    trustScore: number;
    setTrustScore: React.Dispatch<React.SetStateAction<number>>;
    impulseTimerDuration: number;
    setImpulseTimerDuration: React.Dispatch<React.SetStateAction<number>>;
    bigRocks: BigRock[];
    challenges: Challenge[];
    setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
    completedChallenges: CompletedChallenge[];
    setCompletedChallenges: React.Dispatch<React.SetStateAction<CompletedChallenge[]>>;
}

const ActionModule: React.FC<ActionModuleProps> = (props) => {
    const [activeSubTab, setActiveSubTab] = useState<'impulse' | 'challenge' | 'pomodoro'>('impulse');

    const subTabStyle = (isActive: boolean) => 
        `flex-1 py-3 px-2 text-center text-sm transition-colors duration-200 flex items-center justify-center gap-2 ${
            isActive 
                ? 'font-bold text-blue-600 border-b-2 border-blue-500 bg-blue-100' 
                : 'font-medium text-slate-500 hover:bg-slate-100'
        }`;

    const renderContent = () => {
        switch (activeSubTab) {
            case 'impulse':
                return <ImpulseModule {...props} />;
            case 'challenge':
                return <ComfortZoneModule {...props} />;
            case 'pomodoro':
                return <PomodoroModule />;
            default:
                return null;
        }
    }

    return (
        <div>
            <div className="flex bg-white rounded-t-lg shadow-sm overflow-hidden border-b">
                <button 
                    onClick={() => setActiveSubTab('impulse')}
                    className={subTabStyle(activeSubTab === 'impulse')}
                >
                    <ZapIcon className="w-5 h-5" />
                    衝動制御
                </button>
                <button 
                    onClick={() => setActiveSubTab('challenge')}
                    className={subTabStyle(activeSubTab === 'challenge')}
                >
                    <CheckCircleIcon className="w-5 h-5" />
                    チャレンジ
                </button>
                <button 
                    onClick={() => setActiveSubTab('pomodoro')}
                    className={subTabStyle(activeSubTab === 'pomodoro')}
                >
                    <ClockIcon className="w-5 h-5" />
                    集中タイマー
                </button>
            </div>

            <div className="animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};

export default ActionModule;
