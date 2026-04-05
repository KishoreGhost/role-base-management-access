from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import EntryType, RecordStatus
from app.models.base import Base, TimestampMixin


class FinancialRecord(TimestampMixin, Base):
    __tablename__ = "financial_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    entry_type: Mapped[EntryType] = mapped_column(Enum(EntryType, native_enum=False), index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    subcategory: Mapped[str | None] = mapped_column(String(120), nullable=True)
    occurred_on: Mapped[date] = mapped_column(Date, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    payment_method: Mapped[str | None] = mapped_column(String(60), nullable=True)
    reference_code: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    status: Mapped[RecordStatus] = mapped_column(
        Enum(RecordStatus, native_enum=False),
        default=RecordStatus.DRAFT,
        index=True,
    )
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    updated_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    category = relationship("Category")
