"""initial schema

Revision ID: a2000d3b0768
Revises:
Create Date: 2026-04-04 16:43:28.184750

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a2000d3b0768"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


user_role_enum = sa.Enum("viewer", "analyst", "operator", "admin", name="userrole", native_enum=False)
user_status_enum = sa.Enum("active", "inactive", name="userstatus", native_enum=False)
category_kind_enum = sa.Enum("income", "expense", name="categorykind", native_enum=False)
entry_type_enum = sa.Enum("income", "expense", name="entrytype", native_enum=False)
record_status_enum = sa.Enum("draft", "posted", "archived", name="recordstatus", native_enum=False)


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("kind", category_kind_enum, nullable=False),
        sa.Column("color", sa.String(length=20), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_categories_id"), "categories", ["id"], unique=False)
    op.create_index(op.f("ix_categories_kind"), "categories", ["kind"], unique=False)
    op.create_index(op.f("ix_categories_name"), "categories", ["name"], unique=False)

    op.create_table(
        "secret_insights",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("headline", sa.String(length=120), nullable=False),
        sa.Column("value", sa.String(length=120), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.Column("visibility", sa.String(length=30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_secret_insights_id"), "secret_insights", ["id"], unique=False)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", user_role_enum, nullable=False),
        sa.Column("status", user_status_enum, nullable=False),
        sa.Column("department", sa.String(length=120), nullable=False),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_role"), "users", ["role"], unique=False)
    op.create_index(op.f("ix_users_status"), "users", ["status"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("actor_user_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(length=80), nullable=False),
        sa.Column("resource_type", sa.String(length=80), nullable=False),
        sa.Column("resource_id", sa.String(length=80), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_logs_action"), "audit_logs", ["action"], unique=False)
    op.create_index(op.f("ix_audit_logs_actor_user_id"), "audit_logs", ["actor_user_id"], unique=False)
    op.create_index(op.f("ix_audit_logs_id"), "audit_logs", ["id"], unique=False)
    op.create_index(op.f("ix_audit_logs_resource_type"), "audit_logs", ["resource_type"], unique=False)

    op.create_table(
        "financial_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("entry_type", entry_type_enum, nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("subcategory", sa.String(length=120), nullable=True),
        sa.Column("occurred_on", sa.Date(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("payment_method", sa.String(length=60), nullable=True),
        sa.Column("reference_code", sa.String(length=80), nullable=True),
        sa.Column("status", record_status_enum, nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_financial_records_category_id"), "financial_records", ["category_id"], unique=False)
    op.create_index(op.f("ix_financial_records_created_by"), "financial_records", ["created_by"], unique=False)
    op.create_index(op.f("ix_financial_records_entry_type"), "financial_records", ["entry_type"], unique=False)
    op.create_index(op.f("ix_financial_records_id"), "financial_records", ["id"], unique=False)
    op.create_index(op.f("ix_financial_records_is_deleted"), "financial_records", ["is_deleted"], unique=False)
    op.create_index(op.f("ix_financial_records_occurred_on"), "financial_records", ["occurred_on"], unique=False)
    op.create_index(op.f("ix_financial_records_reference_code"), "financial_records", ["reference_code"], unique=False)
    op.create_index(op.f("ix_financial_records_status"), "financial_records", ["status"], unique=False)
    op.create_index(op.f("ix_financial_records_title"), "financial_records", ["title"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_financial_records_title"), table_name="financial_records")
    op.drop_index(op.f("ix_financial_records_status"), table_name="financial_records")
    op.drop_index(op.f("ix_financial_records_reference_code"), table_name="financial_records")
    op.drop_index(op.f("ix_financial_records_occurred_on"), table_name="financial_records")
    op.drop_index(op.f("ix_financial_records_is_deleted"), table_name="financial_records")
    op.drop_index(op.f("ix_financial_records_id"), table_name="financial_records")
    op.drop_index(op.f("ix_financial_records_entry_type"), table_name="financial_records")
    op.drop_index(op.f("ix_financial_records_created_by"), table_name="financial_records")
    op.drop_index(op.f("ix_financial_records_category_id"), table_name="financial_records")
    op.drop_table("financial_records")

    op.drop_index(op.f("ix_audit_logs_resource_type"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_id"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_actor_user_id"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_action"), table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index(op.f("ix_users_status"), table_name="users")
    op.drop_index(op.f("ix_users_role"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    op.drop_index(op.f("ix_secret_insights_id"), table_name="secret_insights")
    op.drop_table("secret_insights")

    op.drop_index(op.f("ix_categories_name"), table_name="categories")
    op.drop_index(op.f("ix_categories_kind"), table_name="categories")
    op.drop_index(op.f("ix_categories_id"), table_name="categories")
    op.drop_table("categories")
