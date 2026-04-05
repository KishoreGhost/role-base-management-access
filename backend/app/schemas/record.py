from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

from app.core.enums import EntryType, RecordStatus


class RecordCategorySummary(BaseModel):
    id: int
    name: str
    kind: str
    color: str


class FinancialRecordBase(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    amount: Decimal = Field(gt=0, decimal_places=2, max_digits=12)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    entry_type: EntryType
    category_id: int = Field(gt=0)
    subcategory: str | None = Field(default=None, max_length=120)
    occurred_on: date
    description: str | None = None
    notes: str | None = None
    payment_method: str | None = Field(default=None, max_length=60)
    reference_code: str | None = Field(default=None, max_length=80)
    status: RecordStatus = RecordStatus.DRAFT

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class FinancialRecordCreate(FinancialRecordBase):
    pass


class FinancialRecordUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=150)
    amount: Decimal | None = Field(default=None, gt=0, decimal_places=2, max_digits=12)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    entry_type: EntryType | None = None
    category_id: int | None = Field(default=None, gt=0)
    subcategory: str | None = Field(default=None, max_length=120)
    occurred_on: date | None = None
    description: str | None = None
    notes: str | None = None
    payment_method: str | None = Field(default=None, max_length=60)
    reference_code: str | None = Field(default=None, max_length=80)
    status: RecordStatus | None = None

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str | None) -> str | None:
        return value.upper() if value else value


class FinancialRecordResponse(FinancialRecordBase):
    id: int
    created_by: int
    updated_by: int | None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    category: RecordCategorySummary

    model_config = {"from_attributes": True}
