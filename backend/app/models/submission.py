from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id            = Column(Integer, primary_key=True, index=True)
    submission_no = Column(String(20), unique=True, index=True)
    status        = Column(String(20), default="Inprogress")
    customer = relationship("Customer", back_populates="submission", uselist=False)
    vehicle  = relationship("Vehicle",  back_populates="submission", uselist=False)
    quote    = relationship("Quote",    back_populates="submission", uselist=False)


class Customer(Base):
    __tablename__ = "customers"

    id            = Column(Integer, primary_key=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), unique=True)
    first_name    = Column(String(100), nullable=False)
    last_name     = Column(String(100), nullable=False)
    gender        = Column(String(20))
    dob           = Column(Date, nullable=False)
    email         = Column(String(255), nullable=False)
    phone         = Column(String(20), nullable=False)
    addr1         = Column(String(255))
    addr2         = Column(String(255), nullable=True)     # optional field
    city          = Column(String(100))
    state         = Column(String(100))
    postal        = Column(String(20))
    country       = Column(String(10))

    submission = relationship("Submission", back_populates="customer")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id            = Column(Integer, primary_key=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), unique=True)
    make          = Column(String(100))       # e.g. "Toyota"
    model         = Column(String(100))       # e.g. "Camry"
    year          = Column(Integer)           # e.g. 2022
    mileage       = Column(Float, default=0)  # mileage in km
    estimatedMarketValue= Column(Integer,default=0)

    # Link back to the parent submission
    submission = relationship("Submission", back_populates="vehicle")



class Quote(Base):
    __tablename__ = "quotes"

    id            = Column(Integer, primary_key=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), unique=True)
    plan          = Column(String(50))          # "basic", "plus", or "elite"
    policy_start  = Column(Date)                # when the policy starts
    policy_end    = Column(Date)                # when the policy ends (start + 1 year)

    # Link back to the parent submission
    submission = relationship("Submission", back_populates="quote")



