from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class SecretInsight(TimestampMixin, Base):
    __tablename__ = "secret_insights"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    headline: Mapped[str] = mapped_column(String(120))
    value: Mapped[str] = mapped_column(String(120))
    rationale: Mapped[str] = mapped_column(Text)
    visibility: Mapped[str] = mapped_column(String(30), default="admin_only")
