from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.enums import UserRole
from app.core.permissions import require_roles
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.audit import log_action

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> list[User]:
    return db.query(User).order_by(User.id.asc()).all()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
) -> User:
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        status=payload.status,
        department=payload.department,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    log_action(
        db,
        actor_user_id=current_user.id,
        action="create",
        resource_type="user",
        resource_id=str(user.id),
        message=f"Created user {user.email}",
    )
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = payload.model_dump(exclude_unset=True)
    password = updates.pop("password", None)
    for key, value in updates.items():
        setattr(user, key, value)
    if password:
        user.password_hash = get_password_hash(password)

    db.add(user)
    db.commit()
    db.refresh(user)
    log_action(
        db,
        actor_user_id=current_user.id,
        action="update",
        resource_type="user",
        resource_id=str(user.id),
        message=f"Updated user {user.email}",
    )
    return user
