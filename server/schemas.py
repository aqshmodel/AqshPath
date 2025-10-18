from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime
import enum

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    motivation_type: str = "unknown"
    shadow_work_passcode: Optional[str] = None
    values: Optional[str] = None
    habit7_assessments: Optional[dict] = None
    daily_focuses: Optional[List[dict]] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    class Config:
        orm_mode = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# BigRock Schemas
class BigRockStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class VisionBoardBase(BaseModel):
    title: str
    images: List[str]
    affirmations: str

class CommitmentContractBase(BaseModel):
    reward: str
    penalty: str

class BigRockBase(BaseModel):
    vision_board: VisionBoardBase
    commitment_contract: Optional[CommitmentContractBase] = None
    status: BigRockStatus = BigRockStatus.todo

class BigRockCreate(BigRockBase):
    pass

class BigRockUpdate(BigRockBase):
    pass

class BigRock(BigRockBase):
    id: str
    user_id: int

    class Config:
        orm_mode = True
    
# ImpulseLog Schemas
class ImpulseLogBase(BaseModel):
    resisted: bool
    journal: Optional[str] = None

class ImpulseLogCreate(ImpulseLogBase):
    pass

class ImpulseLog(ImpulseLogBase):
    id: str
    user_id: int
    timestamp: datetime.datetime

    class Config:
        orm_mode = True
    
# Challenge Schemas
class ChallengeBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    discomfort_level: int # TINYINT in DB, Pydantic uses int
    is_template: bool = False

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeUpdate(ChallengeBase):
    pass

class Challenge(ChallengeBase):
    id: str
    user_id: int

    class Config:
        orm_mode = True
    
# CompletedChallenge Schemas
class CompletedChallengeBase(BaseModel):
    challenge_id: str
    user_discomfort_level: int
    accomplishment: int
    takeaway: Optional[str] = None

class CompletedChallengeCreate(CompletedChallengeBase):
    pass

class CompletedChallenge(CompletedChallengeBase):
    id: int
    user_id: int
    completed_at: datetime.datetime

    class Config:
        orm_mode = True

# Routine Schemas
class RoutineBlockBase(BaseModel):
    title: str
    duration: int # in minutes
    order: int

class RoutineBlockCreate(RoutineBlockBase):
    pass

class RoutineBlock(RoutineBlockBase):
    id: str
    routine_id: str

    class Config:
        orm_mode = True

class DisciplineMode(BaseModel):
    enabled: bool
    time: str # "HH:MM"
    window: int # in minutes

class VictorLogEntry(BaseModel):
    date: datetime.datetime
    entry: str

class RoutineBase(BaseModel):
    name: str
    blocks: List[RoutineBlockCreate]
    discipline_mode: Optional[DisciplineMode] = None
    victors_log: Optional[List[VictorLogEntry]] = None

class RoutineCreate(RoutineBase):
    pass

class RoutineUpdate(RoutineBase):
    pass

class Routine(RoutineBase):
    id: str
    user_id: int

    class Config:
        orm_mode = True

# BadHabit Schemas
class BadHabitLogBase(BaseModel):
    resisted: bool

class BadHabitLogCreate(BadHabitLogBase):
    pass

class BadHabitLog(BadHabitLogBase):
    id: int
    bad_habit_id: str
    timestamp: datetime.datetime

    class Config:
        orm_mode = True

class BadHabitBase(BaseModel):
    name: str
    trigger_text: Optional[str] = None
    replacement_action: Optional[str] = None
    logs: Optional[List[BadHabitLogCreate]] = None # For creating with logs

class BadHabitCreate(BadHabitBase):
    pass

class BadHabitUpdate(BadHabitBase):
    pass

class BadHabit(BadHabitBase):
    id: str
    user_id: int

    class Config:
        orm_mode = True

# JournalEntry Schemas
class JournalEntryType(str, enum.Enum):
    cbt = "cbt"
    free = "free"
    impact = "impact"

class CognitiveJournalEntryBase(BaseModel):
    activating_event: dict # {text: str, tags: List[str]}
    belief: str
    consequence: dict # {text: str, tags: List[str]}
    disputation: str
    effective_new_belief: str

class FreeJournalEntryBase(BaseModel):
    title: str
    content: str
    impactful_event: Optional[str] = None
    emotions_felt: Optional[str] = None
    reasoning: Optional[str] = None

class ImpactLogEntryBase(BaseModel):
    my_action: str
    impact: str
    feeling: str
    related_habits: List[str]

class JournalEntryCreate(BaseModel):
    entry_type: JournalEntryType
    content: dict # This will hold the specific content for each type

class JournalEntry(JournalEntryCreate):
    id: str
    user_id: int
    created_at: datetime.datetime

    class Config:
        orm_mode = True

# ShadowJournalEntry Schemas
class ShadowJournalEntryType(str, enum.Enum):
    daily_journey = "daily_journey"
    reframing_failure = "reframing_failure"

class ShadowJournalEntryBase(BaseModel):
    entry_type: ShadowJournalEntryType
    content: dict # This will hold the specific content for each type

class ShadowJournalEntryCreate(ShadowJournalEntryBase):
    pass

class ShadowJournalEntry(ShadowJournalEntryBase):
    id: str
    user_id: int
    created_at: datetime.datetime

    class Config:
        orm_mode = True

# Belief Schemas
class BeliefStatus(str, enum.Enum):
    uncovered = "uncovered"
    rewritten = "rewritten"
    accepted = "accepted"

class BeliefBase(BaseModel):
    original_text: str
    rewritten_text: Optional[str] = None
    status: BeliefStatus = BeliefStatus.uncovered
    source_journal_day: Optional[int] = None

class BeliefCreate(BeliefBase):
    pass

class BeliefUpdate(BeliefBase):
    pass

class Belief(BeliefBase):
    id: str
    user_id: int
    created_at: datetime.datetime

    class Config:
        orm_mode = True
