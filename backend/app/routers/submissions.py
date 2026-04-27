from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.submission import Submission, Customer, Vehicle, Quote
from app.schemas.submission import SubmissionCreate, SubmissionResponse, VehicleCreate, PlanCreate
from datetime import timedelta


router = APIRouter(prefix="/submissions", tags=["Submissions"])



def generate_submission_no(db: Session):
    count = db.query(Submission).count()
    next_number = count + 1
    return f"Q-{next_number:05d}"


#  Endpoint 1: Create submission
@router.post("/", response_model=SubmissionResponse)
def create_submission(data: SubmissionCreate, db: Session = Depends(get_db)):
    submission = Submission(
        submission_no=generate_submission_no(db),
        status="InProgress"
    )
    db.add(submission)
    db.flush()

    customer = Customer(
        submission_id=submission.id,
        **data.customer.model_dump()
    )
    db.add(customer)
    db.commit()
    db.refresh(submission)

    return submission


# Endpoint 2: Save vehicle
@router.post("/{submission_id}/vehicle")
def save_vehicle(
    submission_id: int,
    data: VehicleCreate,
    db: Session = Depends(get_db)
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    vehicle = Vehicle(
        submission_id=submission_id,
        make=data.make,
        model=data.model,
        year=data.year,
        mileage=data.mileage,
        estimatedMarketValue=data.estimatedMarketValue
    )
    db.add(vehicle)
    db.commit()

    return {"message": "Vehicle saved successfully"}


#  Endpoint 3: Save plan
@router.post("/{submission_id}/plan")
def save_plan(
    submission_id: int,
    data: PlanCreate,
    db: Session = Depends(get_db)
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    existing_quote = db.query(Quote).filter(Quote.submission_id == submission_id).first()
    policy_end = data.policy_start + timedelta(days=365)

    if existing_quote:
        existing_quote.plan = data.plan
        existing_quote.policy_start = data.policy_start
        existing_quote.policy_end = policy_end
    else:
        quote = Quote(
            submission_id=submission_id,
            plan=data.plan,
            policy_start=data.policy_start,
            policy_end=policy_end,
        )
        db.add(quote)

    db.commit()
    return {"message": "Plan saved successfully"}


# Endpoint 4: Send quote
@router.post("/{submission_id}/send-quote")
def send_quote(submission_id: int, db: Session = Depends(get_db)):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.status = "QuoteSent"
    db.commit()

    return {"message": "Quote sent successfully", "status": "QuoteSent"}


#  Endpoint 5: Get full submission 
@router.get("/{submission_id}/full")
def get_full_submission(submission_id: int, db: Session = Depends(get_db)):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    result = {
        "id":            submission.id,
        "submission_no": submission.submission_no,
        "status":        submission.status,
        "customer":      None,
        "vehicle":       None,
        "quote":         None,
    }

    if submission.customer:
        c = submission.customer
        result["customer"] = {
            "first_name": c.first_name,
            "last_name":  c.last_name,
            "gender":     c.gender,
            "dob":        str(c.dob),
            "email":      c.email,
            "phone":      c.phone,
            "addr1":      c.addr1,
            "addr2":      c.addr2,
            "city":       c.city,
            "state":      c.state,
            "postal":     c.postal,
            "country":    c.country,
        }

    if submission.vehicle:
        v = submission.vehicle
        result["vehicle"] = {
            "make":                 v.make,
            "model":                v.model,
            "year":                 v.year,
            "mileage":              v.mileage,
            "estimatedMarketValue": v.estimatedMarketValue,
        }

    if submission.quote:
        q = submission.quote
        result["quote"] = {
            "plan":         q.plan,
            "policy_start": str(q.policy_start),
            "policy_end":   str(q.policy_end),
        }

    return result


# Endpoint 6: Check for submission no 
@router.get("/{submission_id}")
def get_submission(submission_id: int, db: Session = Depends(get_db)):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


#  Endpoint 7: List all submissions 
@router.get("/")
def list_submissions(db: Session = Depends(get_db)):
    return db.query(Submission).all()