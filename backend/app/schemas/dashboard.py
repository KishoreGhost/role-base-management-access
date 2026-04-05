from decimal import Decimal

from pydantic import BaseModel


class SummaryTotals(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    net_balance: Decimal


class CategoryTotal(BaseModel):
    category: str
    entry_type: str
    total: Decimal


class MonthlyTrend(BaseModel):
    month: str
    income: Decimal
    expense: Decimal


class RecentActivityItem(BaseModel):
    action: str
    resource_type: str
    message: str | None
    created_at: str


class DashboardResponse(BaseModel):
    totals: SummaryTotals
    category_breakdown: list[CategoryTotal]
    monthly_trends: list[MonthlyTrend]
    recent_activity: list[RecentActivityItem]


class SecretInsightResponse(BaseModel):
    headline: str
    value: str
    rationale: str
