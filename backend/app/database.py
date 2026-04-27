# database.py — Connects Python to your MySQL database
#
# WHAT IS THIS FILE?
# Think of this file as the "phone line" between your Python code and MySQL.
# Without it, your app can't read or write any data.
#
# HOW DOES IT WORK?
# 1. We read the database address (URL) from a secret .env file
# 2. We create an "engine" — this is the actual connection to MySQL
# 3. We create a "session factory" — this gives us short-lived connections
#    that open when needed and close when done (like phone calls)
# 4. We define a get_db() helper that FastAPI calls automatically
#    every time an endpoint needs to talk to the database

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# ── Step 1: Load the .env file ─────────────────────────────────────
# The .env file contains your database password and address.
# We keep it separate so passwords never end up in your code.
#
# Example .env file contents:
#   DATABASE_URL=mysql+pymysql://root:mypassword@localhost:3306/motor_underwriting
#
# os.path.dirname(__file__) = the folder where THIS file lives
# This makes sure it finds the .env no matter where you run the server from
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Read the DATABASE_URL value from the .env file
DATABASE_URL = os.getenv("DATABASE_URL")

# If the .env is missing or doesn't have DATABASE_URL, crash early with a helpful message
# (Much better than a confusing error later!)
if not DATABASE_URL:
    raise ValueError(
        "DB is not set"
    )


# ── Step 2: Create the engine (the actual connection to MySQL) ──────
# pool_pre_ping=True  → checks if the connection is still alive before using it
# pool_recycle=3600    → refreshes connections every hour (prevents timeouts)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600
)


# ── Step 3: Create the session factory ──────────────────────────────
# A "session" is like one phone call to the database.
# autocommit=False → we control when data is saved (not automatic)
# autoflush=False  → we control when data is sent to MySQL (not automatic)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Step 4: Create the Base class ──────────────────────────────────
# Every database table we define will inherit from this Base class.
# It's what connects our Python classes to actual MySQL tables.
Base = declarative_base()


# ── Step 5: The get_db() helper ─────────────────────────────────────
# FastAPI calls this function automatically whenever an endpoint needs
# a database connection. The "yield" keyword means:
#   1. Open a connection → give it to the endpoint
#   2. Wait for the endpoint to finish
#   3. Close the connection (even if there was an error)
#
# This is called a "dependency" in FastAPI.
# You'll see it used like this in endpoints:
#   def my_endpoint(db: Session = Depends(get_db)):
def get_db():
    db = SessionLocal()
    try:
        yield db        # give the connection to the endpoint
    finally:
        db.close()      # always close when done
