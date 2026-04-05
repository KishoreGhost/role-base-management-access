from enum import Enum


class UserRole(str, Enum):
    VIEWER = "viewer"
    ANALYST = "analyst"
    OPERATOR = "operator"
    ADMIN = "admin"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class EntryType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class RecordStatus(str, Enum):
    DRAFT = "draft"
    POSTED = "posted"
    ARCHIVED = "archived"


class CategoryKind(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
