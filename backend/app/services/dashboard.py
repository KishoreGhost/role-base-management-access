from collections import defaultdict
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.enums import EntryType
from app.models.audit_log import AuditLog
from app.models.category import Category
from app.models.financial_record import FinancialRecord
from app.models.secret_insight import SecretInsight


def build_dashboard(db: Session) -> dict:
    records = (
        db.query(FinancialRecord, Category)
        .join(Category, Category.id == FinancialRecord.category_id)
        .filter(FinancialRecord.is_deleted.is_(False))
        .all()
    )

    total_income = Decimal("0")
    total_expenses = Decimal("0")
    category_totals: dict[tuple[str, str], Decimal] = defaultdict(lambda: Decimal("0"))
    monthly: dict[str, dict[str, Decimal]] = defaultdict(
        lambda: {"income": Decimal("0"), "expense": Decimal("0")}
    )

    for record, category in records:
        amount = Decimal(record.amount)
        if record.entry_type == EntryType.INCOME:
            total_income += amount
            monthly[record.occurred_on.strftime("%Y-%m")]["income"] += amount
        else:
            total_expenses += amount
            monthly[record.occurred_on.strftime("%Y-%m")]["expense"] += amount

        category_totals[(category.name, record.entry_type.value)] += amount

    recent_activity = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "totals": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_balance": total_income - total_expenses,
        },
        "category_breakdown": [
            {"category": name, "entry_type": entry_type, "total": total}
            for (name, entry_type), total in sorted(category_totals.items())
        ],
        "monthly_trends": [
            {"month": month, "income": values["income"], "expense": values["expense"]}
            for month, values in sorted(monthly.items())
        ],
        "recent_activity": [
            {
                "action": item.action,
                "resource_type": item.resource_type,
                "message": item.message,
                "created_at": item.created_at.isoformat(),
            }
            for item in recent_activity
        ],
    }


def get_secret_insights(db: Session) -> list[SecretInsight]:
    return db.query(SecretInsight).order_by(SecretInsight.id.asc()).all()
