from datetime import UTC, date, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.enums import CategoryKind, EntryType, RecordStatus, UserRole, UserStatus
from app.core.security import get_password_hash
from app.models.category import Category
from app.models.financial_record import FinancialRecord
from app.models.secret_insight import SecretInsight
from app.models.user import User
from app.services.audit import log_action


def seed_default_data(db: Session) -> None:
    if db.query(User).first():
        return

    users = [
        User(
            full_name="Vera View",
            email="viewer@finsightcrm.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.VIEWER,
            status=UserStatus.ACTIVE,
            department="Finance",
        ),
        User(
            full_name="Ari Analyst",
            email="analyst@finsightcrm.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.ANALYST,
            status=UserStatus.ACTIVE,
            department="Insights",
        ),
        User(
            full_name="Olive Operator",
            email="operator@finsightcrm.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.OPERATOR,
            status=UserStatus.ACTIVE,
            department="Operations",
        ),
        User(
            full_name="Ada Admin",
            email="admin@finsightcrm.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            department="Leadership",
        ),
    ]
    db.add_all(users)
    db.commit()

    categories = [
        Category(name="Sales", kind=CategoryKind.INCOME, color="#16a34a"),
        Category(name="Services", kind=CategoryKind.INCOME, color="#22c55e"),
        Category(name="Infrastructure", kind=CategoryKind.EXPENSE, color="#ef4444"),
        Category(name="Payroll", kind=CategoryKind.EXPENSE, color="#f97316"),
    ]
    db.add_all(categories)
    db.commit()

    category_map = {category.name: category.id for category in db.query(Category).all()}
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    operator = db.query(User).filter(User.role == UserRole.OPERATOR).first()

    records = [
        FinancialRecord(
            title="Q2 Retainer",
            amount=Decimal("5000.00"),
            currency="USD",
            entry_type=EntryType.INCOME,
            category_id=category_map["Sales"],
            subcategory="Enterprise",
            occurred_on=date(2026, 4, 1),
            description="Quarterly retainer payment",
            notes="Paid on time",
            payment_method="bank_transfer",
            reference_code="RET-2026-Q2",
            status=RecordStatus.POSTED,
            created_by=admin.id,
            updated_by=admin.id,
        ),
        FinancialRecord(
            title="AWS Invoice",
            amount=Decimal("700.00"),
            currency="USD",
            entry_type=EntryType.EXPENSE,
            category_id=category_map["Infrastructure"],
            subcategory="Cloud",
            occurred_on=date(2026, 4, 2),
            description="Monthly cloud hosting bill",
            notes="Reserved instance savings applied",
            payment_method="card",
            reference_code="AWS-APR-2026",
            status=RecordStatus.POSTED,
            created_by=operator.id,
            updated_by=operator.id,
        ),
        FinancialRecord(
            title="Payroll Run",
            amount=Decimal("2200.00"),
            currency="USD",
            entry_type=EntryType.EXPENSE,
            category_id=category_map["Payroll"],
            subcategory="Operations",
            occurred_on=date(2026, 4, 3),
            description="Biweekly payroll batch",
            notes="Includes overtime adjustments",
            payment_method="bank_transfer",
            reference_code="PAY-APR-1",
            status=RecordStatus.DRAFT,
            created_by=operator.id,
            updated_by=operator.id,
        ),
    ]
    db.add_all(records)

    insights = [
        SecretInsight(
            headline="Fraud Risk Index",
            value="2.1 / 10",
            rationale="Low anomaly score across current quarter transactions.",
        ),
        SecretInsight(
            headline="Margin Efficiency Score",
            value="88%",
            rationale="Service revenue is outpacing infrastructure growth.",
        ),
        SecretInsight(
            headline="Top Client Concentration",
            value="41%",
            rationale="One client contributes a sizable share of income.",
        ),
    ]
    db.add_all(insights)
    db.commit()

    log_action(
        db,
        actor_user_id=admin.id,
        action="seed",
        resource_type="system",
        resource_id="bootstrap",
        message="Seeded default users, categories, records, and insights",
        details={"seeded_at": datetime.now(UTC).isoformat()},
    )
