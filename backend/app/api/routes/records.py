from datetime import UTC, datetime, date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.enums import EntryType, RecordStatus, UserRole
from app.core.permissions import require_roles
from app.db.session import get_db
from app.models.category import Category
from app.models.financial_record import FinancialRecord
from app.models.user import User
from app.schemas.record import (
    FinancialRecordCreate,
    FinancialRecordResponse,
    FinancialRecordUpdate,
)
from app.services.audit import log_action

router = APIRouter(prefix="/records", tags=["records"])


@router.get("", response_model=list[FinancialRecordResponse])
def list_records(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
    entry_type: EntryType | None = None,
    status_filter: RecordStatus | None = Query(default=None, alias="status"),
    category_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    search: str | None = None,
) -> list[FinancialRecord]:
    query = (
        db.query(FinancialRecord)
        .options(joinedload(FinancialRecord.category))
        .filter(FinancialRecord.is_deleted.is_(False))
    )

    if entry_type:
        query = query.filter(FinancialRecord.entry_type == entry_type)
    if status_filter:
        query = query.filter(FinancialRecord.status == status_filter)
    if category_id:
        query = query.filter(FinancialRecord.category_id == category_id)
    if start_date:
        query = query.filter(FinancialRecord.occurred_on >= start_date)
    if end_date:
        query = query.filter(FinancialRecord.occurred_on <= end_date)
    if search:
        query = query.filter(FinancialRecord.title.ilike(f"%{search}%"))

    return query.order_by(FinancialRecord.occurred_on.desc(), FinancialRecord.id.desc()).all()


@router.get("/{record_id}", response_model=FinancialRecordResponse)
def get_record(
    record_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> FinancialRecord:
    record = (
        db.query(FinancialRecord)
        .options(joinedload(FinancialRecord.category))
        .filter(FinancialRecord.id == record_id, FinancialRecord.is_deleted.is_(False))
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.post("", response_model=FinancialRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(
    payload: FinancialRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.OPERATOR, UserRole.ADMIN)),
) -> FinancialRecord:
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    record = FinancialRecord(**payload.model_dump(), created_by=current_user.id, updated_by=current_user.id)
    db.add(record)
    db.commit()
    record = (
        db.query(FinancialRecord)
        .options(joinedload(FinancialRecord.category))
        .filter(FinancialRecord.id == record.id)
        .first()
    )
    log_action(
        db,
        actor_user_id=current_user.id,
        action="create",
        resource_type="financial_record",
        resource_id=str(record.id),
        message=f"Created record {record.title}",
    )
    return record


@router.patch("/{record_id}", response_model=FinancialRecordResponse)
def update_record(
    record_id: int,
    payload: FinancialRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.OPERATOR, UserRole.ADMIN)),
) -> FinancialRecord:
    record = db.query(FinancialRecord).filter(
        FinancialRecord.id == record_id,
        FinancialRecord.is_deleted.is_(False),
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    updates = payload.model_dump(exclude_unset=True)
    if "category_id" in updates:
        category = db.query(Category).filter(Category.id == updates["category_id"]).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    for key, value in updates.items():
        setattr(record, key, value)
    record.updated_by = current_user.id
    db.add(record)
    db.commit()
    record = (
        db.query(FinancialRecord)
        .options(joinedload(FinancialRecord.category))
        .filter(FinancialRecord.id == record.id)
        .first()
    )
    log_action(
        db,
        actor_user_id=current_user.id,
        action="update",
        resource_type="financial_record",
        resource_id=str(record.id),
        message=f"Updated record {record.title}",
    )
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
) -> None:
    record = db.query(FinancialRecord).filter(
        FinancialRecord.id == record_id,
        FinancialRecord.is_deleted.is_(False),
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    record.is_deleted = True
    record.deleted_at = datetime.now(UTC)
    record.updated_by = current_user.id
    db.add(record)
    db.commit()
    log_action(
        db,
        actor_user_id=current_user.id,
        action="delete",
        resource_type="financial_record",
        resource_id=str(record.id),
        message=f"Soft-deleted record {record.title}",
    )
    return None
