import enum
from sqlalchemy import Column, String, Date, Enum, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class AttendanceStatus(str, enum.Enum):
    present = "Present"
    absent = "Absent"


class Employee(Base):
    __tablename__ = "employees"

    id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    department = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String, primary_key=True, index=True)
    employee_id = Column(
        String, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
