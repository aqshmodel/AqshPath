import React, { useState } from 'react';
import { JournalEntry, Routine, ShadowJournalEntry, Belief, UserProfile, CompletedChallenge, ImpulseLog, ImpactLogEntry, BadHabit } from '../types.ts';
import CognitiveJournalModule from './CognitiveJournalModule.tsx';
import ShadowWorkModule from './ShadowWorkModule.tsx';
import WeeklyReviewModule from './WeeklyReviewModule.tsx';
import { BookOpenIcon, MoonIcon, CalendarIcon } from './Icons.tsx';

interface ReflectionModuleProps {
    journalEntries: JournalEntry[];
    routines: Routine[];
    shadowJournal: ShadowJournalEntry[];
    setShadowJournal: React.Dispatch<React.SetStateAction<ShadowJournalEntry[]>>;
    beliefs: Belief[];
    setBeliefs: React.Dispatch<React.SetStateAction<Belief[]>>;
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    completedChallenges: CompletedChallenge[];
    impulseLogs: ImpulseLog[];
    badHabits: BadHabit[];
    setJournalModal: React.Dispatch<React.SetStateAction<{ isOpen: boolean; type: 'cbt' | 'free' | 'impact' | 'selecting' | null; prefill?: Partial<ImpactLogEntry>}>>;
}

const ReflectionModule: React.FC<ReflectionModuleProps> = (props) => {
    const [activeSubTab, setActiveSubTab] = useState<'journal' | 'shadow' | 'review'>('journal');
    
    const { journalEntries, routines, shadowJournal, setShadowJournal, beliefs, setBeliefs, profile, setProfile, completedChallenges, impulseLogs, badHabits, setJournalModal } = props;

    const subTabStyle = (isActive: boolean) => 
        `flex-1 py-3 px-2 text-center text-sm transition-colors duration-200 flex items-center justify-center gap-2 ${
            isActive 
                ? 'font-bold text-blue-600 border-b-2 border-blue-500 bg-blue-100' 
                : 'font-medium text-slate-500 hover:bg-slate-100'
        }`;
        
    const renderContent = () => {
        switch(activeSubTab) {
            case 'journal':
                return <CognitiveJournalModule 
                    entries={journalEntries}
                    routines={routines}
                    badHabits={badHabits}
                    profile={profile}
                    setJournalModal={setJournalModal}
                  />;
            case 'shadow':
                 return <ShadowWorkModule 
                    journal={shadowJournal} 
                    setJournal={setShadowJournal} 
                    beliefs={beliefs}
                    setBeliefs={setBeliefs}
                    profile={profile}
                    setProfile={setProfile}
                  />;
            case 'review':
                return <WeeklyReviewModule 
                    journalEntries={journalEntries}
                    routines={routines}
                    completedChallenges={completedChallenges}
                    impulseLogs={impulseLogs}
                    profile={profile}
                    badHabits={badHabits}
                />;
            default:
                return null;
        }
    };
        
    return (
        <div>
            <div className="flex bg-white rounded-t-lg shadow-sm overflow-hidden border-b">
                <button 
                    onClick={() => setActiveSubTab('journal')}
                    className={subTabStyle(activeSubTab === 'journal')}
                >
                    <BookOpenIcon className="w-5 h-5" />
                    ジャーナル
                </button>
                <button 
                    onClick={() => setActiveSubTab('shadow')}
                    className={subTabStyle(activeSubTab === 'shadow')}
                >
                     <MoonIcon className="w-5 h-5" />
                    シャドウワーク
                </button>
                <button 
                    onClick={() => setActiveSubTab('review')}
                    className={subTabStyle(activeSubTab === 'review')}
                >
                     <CalendarIcon className="w-5 h-5" />
                    週次レビュー
                </button>
            </div>
            
            <div className="animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};

export default ReflectionModule;