// FIX: Define AlbertLesson here to resolve circular dependency.
export interface AlbertLesson {
    id: number;
    title: string;
    prompt: string;
}

export interface VisionBoard {
    title: string;
    images: string[]; // base64 encoded strings
    affirmations: string;
}

export interface CommitmentContract {
    reward: string;
    penalty: string;
}

export interface BigRock {
  id: string;
  visionBoard: VisionBoard;
  commitmentContract?: CommitmentContract;
  status: 'todo' | 'in_progress' | 'done';
}

export interface ImpulseLog {
  id: string;
  timestamp: number;
  resisted: boolean;
  journal: string;
}

export interface Challenge {
  id:string;
  title: string;
  description: string;
  category: string;
  discomfortLevel: 1 | 2 | 3 | 4 | 5;
}

export interface CompletedChallenge {
  challengeId: string;
  date: number;
  userDiscomfortLevel: number;
  accomplishment: number;
  takeaway: string;
}

export interface RoutineBlock {
    id: string;
    title: string;
    duration: number; // in minutes
}

export interface Routine {
    id: string;
    name: string;
    blocks: RoutineBlock[];
    disciplineMode?: {
        enabled: boolean;
        time: string; // "HH:MM"
        window: number; // in minutes
    };
    victorsLog?: {
        date: number;
        entry: string;
    }[];
}

export type BeliefStatus = 'uncovered' | 'rewritten' | 'accepted';

export interface Belief {
    id: string;
    originalText: string;
    rewrittenText?: string;
    status: BeliefStatus;
    dateUncovered: number;
    sourceJournalDay: number;
}

export interface ShadowJournalEntry {
    // Common fields
    id: string;
    date: number;
    type: 'daily_journey' | 'reframing_failure';
    
    // For 'daily_journey'
    day?: number;
    answers?: { question: string; answer: string }[];
    triggeringEvent?: string;
    emotionTags?: string[];
    fiveWhys?: string[];
    resultingBeliefId?: string;

    // For 'reframing_failure'
    failureDescription?: string;
    lessonLearned?: string;
}


export type MotivationType = 'approach' | 'avoidance' | 'unknown';

// Types for Growth Habits (formerly Value Compass)
export const SEVEN_HABITS_IDS = ['exceed_expectations', 'master_reliability', 'growth_mindset', 'master_communication', 'commit_to_growth', 'build_relationships', 'master_adaptability'] as const;
export type Habit7Id = typeof SEVEN_HABITS_IDS[number];

export interface DailyFocus {
    date: string; // YYYY-MM-DD
    habitIds: Habit7Id[];
    action: string;
    isCompleted: boolean;
}

// New types for Bad Habits
export interface BadHabitLog {
    timestamp: number;
    resisted: boolean;
}

export interface BadHabit {
    id: string;
    name: string;
    trigger: string;
    replacementAction: string;
    logs: BadHabitLog[];
}

export interface UserProfile {
    motivationType: MotivationType;
    shadowWorkPasscode: string | null;
    values?: string;
    habit7Assessments?: Record<Habit7Id, number>; // self-assessment 1-5
    dailyFocuses?: DailyFocus[];
}

// New types for Phase 3
export interface CognitiveJournalEntry {
    type: 'cbt';
    id: string;
    date: number;
    // A: Activating Event
    activatingEvent: { text: string; tags: string[] };
    // B: Belief
    belief: string;
    // C: Consequence
    consequence: { text: string; tags:string[] };
    // D: Disputation
    disputation: string;
    // E: Effective New Belief
    effectiveNewBelief: string;
}

export interface FreeJournalEntry {
    type: 'free';
    id: string;
    date: number;
    title: string;
    content: string;
    impactfulEvent?: string;
    emotionsFelt?: string;
    reasoning?: string;
}

export interface ImpactLogEntry {
    type: 'impact';
    id:string;
    date: number;
    myAction: string;
    impact: string;
    feeling: string;
    relatedHabits: Habit7Id[];
}

export type JournalEntry = CognitiveJournalEntry | FreeJournalEntry | ImpactLogEntry;