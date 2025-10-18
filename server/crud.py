
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_big_rock(db: Session, big_rock_id: str):
    return db.query(models.BigRock).filter(models.BigRock.id == big_rock_id).first()

def get_big_rocks(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.BigRock).filter(models.BigRock.user_id == user_id).offset(skip).limit(limit).all()

def create_user_big_rock(db: Session, big_rock: schemas.BigRockCreate, user_id: int):
    db_big_rock = models.BigRock(id=str(uuid.uuid4()), **big_rock.dict(), user_id=user_id)
    db.add(db_big_rock)
    db.commit()
    db.refresh(db_big_rock)
    return db_big_rock
    
def update_big_rock(db: Session, big_rock_id: str, big_rock: schemas.BigRockUpdate):
    db_big_rock = db.query(models.BigRock).filter(models.BigRock.id == big_rock_id).first()
    if db_big_rock:
        for key, value in big_rock.dict(exclude_unset=True).items():
            setattr(db_big_rock, key, value)
        db.commit()
        db.refresh(db_big_rock)
    return db_big_rock

def get_impulse_log(db: Session, impulse_log_id: str):

    return db.query(models.ImpulseLog).filter(models.ImpulseLog.id == impulse_log_id).first()



def get_impulse_logs(db: Session, user_id: int, skip: int = 0, limit: int = 100):

    return db.query(models.ImpulseLog).filter(models.ImpulseLog.user_id == user_id).offset(skip).limit(limit).all()



def create_user_impulse_log(db: Session, impulse_log: schemas.ImpulseLogCreate, user_id: int):

    db_impulse_log = models.ImpulseLog(id=str(uuid.uuid4()), **impulse_log.dict(), user_id=user_id, timestamp=datetime.utcnow())

    db.add(db_impulse_log)

    db.commit()

    db.refresh(db_impulse_log)

    return db_impulse_log



def delete_impulse_log(db: Session, impulse_log_id: str):

    db_impulse_log = db.query(models.ImpulseLog).filter(models.ImpulseLog.id == impulse_log_id).first()

    if db_impulse_log:

        db.delete(db_impulse_log)

        db.commit()

    return db_impulse_log

def get_challenge(db: Session, challenge_id: str):
    return db.query(models.Challenge).filter(models.Challenge.id == challenge_id).first()

def get_challenges(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Challenge).filter(models.Challenge.user_id == user_id).offset(skip).limit(limit).all()

def create_user_challenge(db: Session, challenge: schemas.ChallengeCreate, user_id: int):
    db_challenge = models.Challenge(id=str(uuid.uuid4()), **challenge.dict(), user_id=user_id)
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge

def update_challenge(db: Session, challenge_id: str, challenge: schemas.ChallengeUpdate):
    db_challenge = db.query(models.Challenge).filter(models.Challenge.id == challenge_id).first()
    if db_challenge:
        for key, value in challenge.dict(exclude_unset=True).items():
            setattr(db_challenge, key, value)
        db.commit()
        db.refresh(db_challenge)
    return db_challenge

def delete_challenge(db: Session, challenge_id: str):
    db_challenge = db.query(models.Challenge).filter(models.Challenge.id == challenge_id).first()
    if db_challenge:
        db.delete(db_challenge)
        db.commit()
    return db_challenge

def get_completed_challenge(db: Session, completed_challenge_id: int):
    return db.query(models.CompletedChallenge).filter(models.CompletedChallenge.id == completed_challenge_id).first()

def get_completed_challenges(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.CompletedChallenge).filter(models.CompletedChallenge.user_id == user_id).offset(skip).limit(limit).all()

def create_user_completed_challenge(db: Session, completed_challenge: schemas.CompletedChallengeCreate, user_id: int):
    db_completed_challenge = models.CompletedChallenge(completed_at=datetime.utcnow(), **completed_challenge.dict(), user_id=user_id)
    db.add(db_completed_challenge)
    db.commit()
    db.refresh(db_completed_challenge)
    return db_completed_challenge

    return db_completed_challenge

import uuid
from datetime import datetime

def get_routine(db: Session, routine_id: str):
    return db.query(models.Routine).filter(models.Routine.id == routine_id).first()

def get_routines(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Routine).filter(models.Routine.user_id == user_id).offset(skip).limit(limit).all()

def create_user_routine(db: Session, routine: schemas.RoutineCreate, user_id: int):
    db_routine = models.Routine(id=str(uuid.uuid4()), name=routine.name, user_id=user_id,
                                discipline_mode=routine.discipline_mode.dict() if routine.discipline_mode else None,
                                victors_log=[log.dict() for log in routine.victors_log] if routine.victors_log else None)
    db.add(db_routine)
    db.commit()
    db.refresh(db_routine)

    for block_data in routine.blocks:
        db_block = models.RoutineBlock(id=str(uuid.uuid4()), routine_id=db_routine.id, **block_data.dict())
        db.add(db_block)
    db.commit()
    db.refresh(db_routine) # Refresh again to load blocks relationship
    return db_routine

def update_routine(db: Session, routine_id: str, routine: schemas.RoutineUpdate):
    db_routine = db.query(models.Routine).filter(models.Routine.id == routine_id).first()
    if db_routine:
        for key, value in routine.dict(exclude_unset=True).items():
            if key == "blocks":
                # Handle blocks update separately
                # Delete existing blocks
                db.query(models.RoutineBlock).filter(models.RoutineBlock.routine_id == routine_id).delete()
                # Add new blocks
                for block_data in value:
                    db_block = models.RoutineBlock(id=str(uuid.uuid4()), routine_id=routine_id, **block_data.dict())
                    db.add(db_block)
            elif key == "discipline_mode":
                setattr(db_routine, key, value.dict() if value else None)
            elif key == "victors_log":
                setattr(db_routine, key, [log.dict() for log in value] if value else None)
            else:
                setattr(db_routine, key, value)
        db.commit()
        db.refresh(db_routine)
    return db_routine

def delete_routine(db: Session, routine_id: str):
    db_routine = db.query(models.Routine).filter(models.Routine.id == routine_id).first()
    if db_routine:
        db.delete(db_routine)
        db.commit()
    return db_routine

def create_routine_block(db: Session, routine_block: schemas.RoutineBlockCreate, routine_id: str):
    db_routine_block = models.RoutineBlock(id=str(uuid.uuid4()), routine_id=routine_id, **routine_block.dict())
    db.add(db_routine_block)
    db.commit()
    db.refresh(db_routine_block)
    return db_routine_block

def delete_routine_block(db: Session, routine_block_id: str):
    db_routine_block = db.query(models.RoutineBlock).filter(models.RoutineBlock.id == routine_block_id).first()
    if db_routine_block:
        db.delete(db_routine_block)
        db.commit()
    return db_routine_block

def get_bad_habit(db: Session, bad_habit_id: str):
    return db.query(models.BadHabit).filter(models.BadHabit.id == bad_habit_id).first()

def get_bad_habits(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.BadHabit).filter(models.BadHabit.user_id == user_id).offset(skip).limit(limit).all()

def create_user_bad_habit(db: Session, bad_habit: schemas.BadHabitCreate, user_id: int):
    db_bad_habit = models.BadHabit(id=str(uuid.uuid4()), **bad_habit.dict(exclude={'logs'}), user_id=user_id)
    db.add(db_bad_habit)
    db.commit()
    db.refresh(db_bad_habit)

    if bad_habit.logs:
        for log_data in bad_habit.logs:
            db_log = models.BadHabitLog(bad_habit_id=db_bad_habit.id, resisted=log_data.resisted)
            db.add(db_log)
        db.commit()
        db.refresh(db_bad_habit)
    return db_bad_habit

def update_bad_habit(db: Session, bad_habit_id: str, bad_habit: schemas.BadHabitUpdate):
    db_bad_habit = db.query(models.BadHabit).filter(models.BadHabit.id == bad_habit_id).first()
    if db_bad_habit:
        for key, value in bad_habit.dict(exclude_unset=True, exclude={'logs'}).items():
            setattr(db_bad_habit, key, value)
        db.commit()
        db.refresh(db_bad_habit)
    return db_bad_habit

def delete_bad_habit(db: Session, bad_habit_id: str):
    db_bad_habit = db.query(models.BadHabit).filter(models.BadHabit.id == bad_habit_id).first()
    if db_bad_habit:
        db.delete(db_bad_habit)
        db.commit()
    return db_bad_habit

def create_bad_habit_log(db: Session, bad_habit_log: schemas.BadHabitLogCreate, bad_habit_id: str):
    db_log = models.BadHabitLog(bad_habit_id=bad_habit_id, resisted=bad_habit_log.resisted)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_journal_entry(db: Session, journal_entry_id: str):
    return db.query(models.JournalEntry).filter(models.JournalEntry.id == journal_entry_id).first()

def get_journal_entries(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.JournalEntry).filter(models.JournalEntry.user_id == user_id).offset(skip).limit(limit).all()

def create_user_journal_entry(db: Session, journal_entry: schemas.JournalEntryCreate, user_id: int):
    db_journal_entry = models.JournalEntry(id=str(uuid.uuid4()), **journal_entry.dict(), user_id=user_id, created_at=datetime.utcnow())
    db.add(db_journal_entry)
    db.commit()
    db.refresh(db_journal_entry)
    return db_journal_entry

def delete_journal_entry(db: Session, journal_entry_id: str):
    db_journal_entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == journal_entry_id).first()
    if db_journal_entry:
        db.delete(db_journal_entry)
        db.commit()
    return db_journal_entry

def get_shadow_journal_entry(db: Session, shadow_journal_entry_id: str):
    return db.query(models.ShadowJournalEntry).filter(models.ShadowJournalEntry.id == shadow_journal_entry_id).first()

def get_shadow_journal_entries(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.ShadowJournalEntry).filter(models.ShadowJournalEntry.user_id == user_id).offset(skip).limit(limit).all()

def create_user_shadow_journal_entry(db: Session, shadow_journal_entry: schemas.ShadowJournalEntryCreate, user_id: int):
    db_shadow_journal_entry = models.ShadowJournalEntry(
        id=str(uuid.uuid4()),
        entry_type=shadow_journal_entry.entry_type,
        content=shadow_journal_entry.content,
        user_id=user_id,
        created_at=datetime.utcnow()
    )
    db.add(db_shadow_journal_entry)
    db.commit()
    db.refresh(db_shadow_journal_entry)
    return db_shadow_journal_entry

def delete_shadow_journal_entry(db: Session, shadow_journal_entry_id: str):
    db_shadow_journal_entry = db.query(models.ShadowJournalEntry).filter(models.ShadowJournalEntry.id == shadow_journal_entry_id).first()
    if db_shadow_journal_entry:
        db.delete(db_shadow_journal_entry)
        db.commit()
    return db_shadow_journal_entry

def get_belief(db: Session, belief_id: str):
    return db.query(models.Belief).filter(models.Belief.id == belief_id).first()

def get_beliefs(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Belief).filter(models.Belief.user_id == user_id).offset(skip).limit(limit).all()

def create_user_belief(db: Session, belief: schemas.BeliefCreate, user_id: int):
    db_belief = models.Belief(id=str(uuid.uuid4()), **belief.dict(), user_id=user_id, created_at=datetime.utcnow())
    db.add(db_belief)
    db.commit()
    db.refresh(db_belief)
    return db_belief

def update_belief(db: Session, belief_id: str, belief: schemas.BeliefUpdate):
    db_belief = db.query(models.Belief).filter(models.Belief.id == belief_id).first()
    if db_belief:
        for key, value in belief.dict(exclude_unset=True).items():
            setattr(db_belief, key, value)
        db.commit()
        db.refresh(db_belief)
    return db_belief

def delete_belief(db: Session, belief_id: str):
    db_belief = db.query(models.Belief).filter(models.Belief.id == belief_id).first()
    if db_belief:
        db.delete(db_belief)
        db.commit()
    return db_belief

def get_bad_habit_logs(db: Session, bad_habit_id: str, skip: int = 0, limit: int = 100):
    return db.query(models.BadHabitLog).filter(models.BadHabitLog.bad_habit_id == bad_habit_id).offset(skip).limit(limit).all()


