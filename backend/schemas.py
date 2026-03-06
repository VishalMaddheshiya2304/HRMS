import enum
import re
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


class AttendanceStatus(str, enum.Enum):
    present = "Present"
    absent = "Absent"


# ── Employee ──────────────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator("id", "full_name", "department")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

    @field_validator("id")
    @classmethod
    def valid_id(cls, v: str) -> str:
        if not re.match(r"^[A-Za-z0-9_\-]+$", v):
            raise ValueError("Employee ID can only contain letters, digits, hyphens, and underscores")
        return v


class EmployeeOut(BaseModel):
    id: str
    full_name: str
    email: str
    department: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Attendance ────────────────────────────────────────────────────────────────

class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: AttendanceStatus


class AttendanceOut(BaseModel):
    id: str
    employee_id: str
    date: date
    status: str
    created_at: datetime
    employee_name: Optional[str] = None

    model_config = {"from_attributes": True}
