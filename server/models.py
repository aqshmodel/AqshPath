
from sqlalchemy import Column, Integer, String, Text, JSON, Enum, ForeignKey, Boolean, DateTime, func
from sqlalchemy.dialects.mysql import TINYINT
from sqlalchemy.orm import relationship
from database import Base
import enum

class MotivationType(str, enum.Enum):
    approach = "approach"
    avoidance = "avoidance"
    unknown = "unknown"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    motivation_type = Column(Enum(MotivationType), nullable=False, default=MotivationType.unknown)
    shadow_work_passcode = Column(String(255), nullable=True)
    values = Column(Text, nullable=True)
    habit7_assessments = Column(JSON, nullable=True)
    daily_focuses = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    big_rocks = relationship("BigRock", back_populates="owner")
    impulse_logs = relationship("ImpulseLog", back_populates="owner")
    challenges = relationship("Challenge", back_populates="owner")
    completed_challenges = relationship("CompletedChallenge", back_populates="owner")
    routines = relationship("Routine", back_populates="owner")
    bad_habits = relationship("BadHabit", back_populates="owner")
    journal_entries = relationship("JournalEntry", back_populates="owner")
    shadow_journal_entries = relationship("ShadowJournalEntry", back_populates="owner")
    beliefs = relationship("Belief", back_populates="owner")




class BigRockStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class BigRock(Base):
    __tablename__ = "big_rocks"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vision_board = Column(JSON, nullable=False)
    commitment_contract = Column(JSON, nullable=True)
    status = Column(Enum(BigRockStatus), nullable=False, default=BigRockStatus.todo)

    owner = relationship("User", back_populates="big_rocks")

class ImpulseLog(Base):
    __tablename__ = "impulse_logs"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resisted = Column(Boolean, nullable=False)
    journal = Column(Text, nullable=True)
    timestamp = Column(DateTime, server_default=func.now())

    owner = relationship("User", back_populates="impulse_logs")

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100))
    discomfort_level = Column(TINYINT, nullable=False)
    is_template = Column(Boolean, default=False)

    owner = relationship("User", back_populates="challenges")
    completions = relationship("CompletedChallenge", back_populates="challenge_info")

class CompletedChallenge(Base):
    __tablename__ = "completed_challenges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(String(36), ForeignKey("challenges.id"), nullable=False)
    user_discomfort_level = Column(TINYINT, nullable=False)
    accomplishment = Column(TINYINT, nullable=False)
    takeaway = Column(Text, nullable=True)
    completed_at = Column(DateTime, server_default=func.now())

    owner = relationship("User", back_populates="completed_challenges")
    challenge_info = relationship("Challenge", back_populates="completions")


class Routine(Base):
    __tablename__ = "routines"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    discipline_mode = Column(JSON, nullable=True)
    victors_log = Column(JSON, nullable=True)

    owner = relationship("User", back_populates="routines")
    blocks = relationship("RoutineBlock", back_populates="routine")


class RoutineBlock(Base):
    __tablename__ = "routine_blocks"

    id = Column(String(36), primary_key=True, index=True)
    routine_id = Column(String(36), ForeignKey("routines.id"), nullable=False)
    title = Column(String(255), nullable=False)
    duration = Column(Integer, nullable=False)
    order = Column(Integer, nullable=False)

    routine = relationship("Routine", back_populates="blocks")


class BadHabit(Base):
    __tablename__ = "bad_habits"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    trigger_text = Column(Text, nullable=True)
    replacement_action = Column(Text, nullable=True)

    owner = relationship("User", back_populates="bad_habits")
    logs = relationship("BadHabitLog", back_populates="bad_habit")


class BadHabitLog(Base):
    __tablename__ = "bad_habit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bad_habit_id = Column(String(36), ForeignKey("bad_habits.id"), nullable=False)
    resisted = Column(Boolean, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())

    bad_habit = relationship("BadHabit", back_populates="logs")


class JournalEntryType(str, enum.Enum):
    cbt = "cbt"
    free = "free"
    impact = "impact"

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    entry_type = Column(Enum(JournalEntryType), nullable=False)
    content = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    owner = relationship("User", back_populates="journal_entries")


class ShadowJournalEntryType(str, enum.Enum):
    daily_journey = "daily_journey"
    reframing_failure = "reframing_failure"

class ShadowJournalEntry(Base):
    __tablename__ = "shadow_journal_entries"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    entry_type = Column(Enum(ShadowJournalEntryType), nullable=False)
    content = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    owner = relationship("User", back_populates="shadow_journal_entries")


class BeliefStatus(str, enum.Enum):
    uncovered = "uncovered"
    rewritten = "rewritten"
    accepted = "accepted"

class Belief(Base):
    __tablename__ = "beliefs"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_text = Column(Text, nullable=False)
    rewritten_text = Column(Text, nullable=True)
    status = Column(Enum(BeliefStatus), nullable=False, default=BeliefStatus.uncovered)
    source_journal_day = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    owner = relationship("User", back_populates="beliefs")



