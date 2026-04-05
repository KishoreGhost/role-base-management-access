from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import CategoryKind
from app.models.base import Base, TimestampMixin


class Category(TimestampMixin, Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    kind: Mapped[CategoryKind] = mapped_column(Enum(CategoryKind, native_enum=False), index=True)
    color: Mapped[str] = mapped_column(String(20), default="#2563eb")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
