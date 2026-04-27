from pydantic import BaseModel, EmailStr, field_validator
from datetime import date, datetime
from typing import Optional



class CustomerCreate(BaseModel):
    first_name: str
    last_name:  str
    gender:     str
    dob:        date          # Format is (YYYY-MM-DD)
    email:      EmailStr      
    phone:      str
    addr1:      str
    addr2:      Optional[str] = None   # this field is optional
    city:       str
    state:      str
    postal:     str
    country:    str


    @field_validator('dob')
    @classmethod
    def validate_dob(cls, value):
        today = date.today()
        age = today.year - value.year
        if (today.month, today.day) < (value.month, value.day):
            age = age - 1

        if age < 18:
            raise ValueError('Customer must be at least 18 years old')
        if age > 79:
            raise ValueError('Customer must be under 80 years old')

        return value

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, value):
        if not value.isdigit():
            raise ValueError('Phone must contain only numbers')
        return value



class VehicleCreate(BaseModel):
    make:        str
    model:       str
    year:        int
    mileage:     float
    estimatedMarketValue: float      

    @field_validator('mileage')
    @classmethod
    def validate_mileage(cls, value):
        if value < 0:
            raise ValueError('Mileage cannot be negative')
        return value

    @field_validator('estimatedMarketValue')
    @classmethod
    def validate_market_value(cls, value):
        if value <= 0:
            raise ValueError('Market value must be greater than 0')
        return value
    
        
class PlanCreate(BaseModel):
    plan:          str
    premium:       float
    policy_start:  date

    @field_validator('plan')
    @classmethod
    def validate_plan(cls, value):
        allowed_plans = ['basic', 'plus', 'elite']
        if value not in allowed_plans:
            raise ValueError('Plan must be one of: basic, plus, elite')
        return value

    @field_validator('policy_start')
    @classmethod
    def validate_policy_start(cls, value):
        today = date.today()
        from datetime import timedelta
        max_future = today + timedelta(days=90)
        if value < today:
            raise ValueError('Policy start date cannot be in the past')
        if value > max_future:
            raise ValueError('Policy start date cannot be more than 90 days in the future')
        return value



class SubmissionCreate(BaseModel):
    customer: CustomerCreate


class SubmissionResponse(BaseModel):
    id:            int
    submission_no: str
    status:        str

    class Config:
        from_attributes = True
