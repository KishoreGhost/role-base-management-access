from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.enums import UserRole
from app.core.permissions import require_roles
from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardResponse, SecretInsightResponse
from app.services.dashboard import build_dashboard, get_secret_insights

router = APIRouter(prefix="/dashboard", tags=["dashboard"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/summary", response_model=DashboardResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    return build_dashboard(db)


@admin_router.get(
    "/insights",
    response_model=list[SecretInsightResponse],
)
def get_admin_insights(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> list[SecretInsightResponse]:
    return [SecretInsightResponse.model_validate(item, from_attributes=True) for item in get_secret_insights(db)]
