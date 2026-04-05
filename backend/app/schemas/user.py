from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.core.enums import UserRole, UserStatus


class UserBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    role: UserRole
    status: UserStatus = UserStatus.ACTIVE
    department: str = Field(default="Finance", min_length=2, max_length=120)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    role: UserRole | None = None
    status: UserStatus | None = None
    department: str | None = Field(default=None, min_length=2, max_length=120)
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserResponse(UserBase):
    id: int
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
