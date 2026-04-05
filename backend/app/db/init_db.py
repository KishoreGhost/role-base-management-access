from sqlalchemy.orm import Session

from app.db.seed import seed_default_data


def init_db(db: Session) -> None:
    seed_default_data(db)
