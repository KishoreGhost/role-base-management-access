from pydantic import BaseModel, EmailStr

from app.core.enums import UserRole, UserStatus


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "CurrentUserResponse"


class CurrentUserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    status: UserStatus
    department: str

    model_config = {"from_attributes": True}
