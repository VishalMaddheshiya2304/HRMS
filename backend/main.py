import os
import uuid
from datetime import date
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API", version="1.0.0")

# ✅ Fixed: CORS origins loaded from environment variable — no hardcoded URLs
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "HRMS Lite API is running"}


# ── Employees ─────────────────────────────────────────────────────────────────

@app.get("/api/employees", response_model=List[schemas.EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return (
        db.query(models.Employee)
        .order_by(models.Employee.created_at.desc())
        .all()
    )


@app.post("/api/employees", response_model=schemas.EmployeeOut, status_code=201)
def create_employee(payload: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    if db.query(models.Employee).filter(models.Employee.id == payload.id).first():
        raise HTTPException(status_code=409, detail="Employee ID already exists.")

    if db.query(models.Employee).filter(models.Employee.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email address is already registered.")

    employee = models.Employee(**payload.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@app.delete("/api/employees/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = (
        db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found.")

    # Cascade deletes attendance records
    db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id
    ).delete()
    db.delete(employee)
    db.commit()
    return {"message": f"Employee '{employee.full_name}' deleted successfully."}


# ── Attendance ────────────────────────────────────────────────────────────────

@app.get("/api/attendance", response_model=List[schemas.AttendanceOut])
def list_attendance(
    employee_id: Optional[str] = Query(None),
    date_filter: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db),
):
    query = db.query(models.Attendance, models.Employee).join(
        models.Employee, models.Attendance.employee_id == models.Employee.id
    )
    if employee_id:
        query = query.filter(models.Attendance.employee_id == employee_id)
    if date_filter:
        query = query.filter(models.Attendance.date == date_filter)

    rows = query.order_by(models.Attendance.date.desc()).all()

    return [
        schemas.AttendanceOut(
            id=att.id,
            employee_id=att.employee_id,
            date=att.date,
            status=att.status,
            created_at=att.created_at,
            employee_name=emp.full_name,
        )
        for att, emp in rows
    ]


@app.post("/api/attendance", response_model=schemas.AttendanceOut, status_code=201)
def mark_attendance(payload: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    employee = (
        db.query(models.Employee)
        .filter(models.Employee.id == payload.employee_id)
        .first()
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found.")

    duplicate = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.employee_id == payload.employee_id,
            models.Attendance.date == payload.date,
        )
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Attendance already marked for this employee on that date.",
        )

    record = models.Attendance(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)

    return schemas.AttendanceOut(
        id=record.id,
        employee_id=record.employee_id,
        date=record.date,
        status=record.status,
        created_at=record.created_at,
        employee_name=employee.full_name,
    )


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/api/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    total_employees = db.query(func.count(models.Employee.id)).scalar() or 0

    present_today = (
        db.query(func.count(models.Attendance.id))
        .filter(
            models.Attendance.date == date.today(),
            models.Attendance.status == models.AttendanceStatus.present,
        )
        .scalar()
        or 0
    )

    absent_today = (
        db.query(func.count(models.Attendance.id))
        .filter(
            models.Attendance.date == date.today(),
            models.Attendance.status == models.AttendanceStatus.absent,
        )
        .scalar()
        or 0
    )

    total_records = db.query(func.count(models.Attendance.id)).scalar() or 0

    departments = (
        db.query(models.Employee.department, func.count(models.Employee.id))
        .group_by(models.Employee.department)
        .all()
    )

    top_attendance = (
        db.query(
            models.Employee.full_name,
            func.count(models.Attendance.id).label("present_days"),
        )
        .join(models.Attendance, models.Attendance.employee_id == models.Employee.id)
        .filter(models.Attendance.status == models.AttendanceStatus.present)
        .group_by(models.Employee.id)
        .order_by(func.count(models.Attendance.id).desc())
        .limit(5)
        .all()
    )

    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "total_records": total_records,
        "departments": [{"name": d, "count": c} for d, c in departments],
        "top_attendance": [
            {"name": name, "present_days": days} for name, days in top_attendance
        ],
    }