from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import CategoryKind


class CategoryBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    kind: CategoryKind
    color: str = Field(default="#2563eb", min_length=4, max_length=20)
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    kind: CategoryKind | None = None
    color: str | None = Field(default=None, min_length=4, max_length=20)
    is_active: bool | None = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
