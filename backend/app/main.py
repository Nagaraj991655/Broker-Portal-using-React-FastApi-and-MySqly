# main.py — Entry point of the FastAPI application
#
# WHAT IS THIS FILE?
# This is where the FastAPI server starts.
# When you run: uvicorn app.main:app --reload
# Python loads THIS file and creates the "app" object.
#
# WHAT DOES IT DO?
# 1. Creates the FastAPI app
# 2. Imports all the database models (so SQLAlchemy knows about them)
# 3. Automatically creates all database tables if they don't exist yet
# 4. Adds CORS middleware (so React can talk to this server)
# 5. Registers all the routers (groups of endpoints)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# ── Import all models ─────────────────────────────────────────────
# We must import the models here even though we don't use them directly.
# WHY? Because SQLAlchemy only knows about tables that have been imported.
# Without this import, Base.metadata.create_all() wouldn't create the tables!
from app.models import submission as submission_models

# Import the routers (groups of API endpoints)
from app.routers import submissions


# ── Create database tables ────────────────────────────────────────
# This checks if each table exists in MySQL.
# If a table is missing, it creates it automatically.
# If the table already exists, it safely skips it.
# NOTE: This does NOT update existing tables if you change columns.
#       For that you'd need a migration tool like Alembic.
Base.metadata.create_all(bind=engine)


# ── Create the FastAPI app ────────────────────────────────────────
app = FastAPI(title="Motor Underwriting API", version="1.0.0")


# ── Add CORS middleware ───────────────────────────────────────────
# CORS = Cross-Origin Resource Sharing
#
# PROBLEM WITHOUT CORS:
# React runs on http://localhost:5173
# FastAPI runs on http://localhost:8000
# Browsers block requests between different ports by default (security feature).
#
# SOLUTION:
# This middleware tells the browser: "It's OK, let React talk to me"
#
# allow_origins=["*"] means "allow requests from ANY website"
# In production, you'd replace "*" with your actual domain for security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # which websites can call this API
    allow_credentials=False,       # we're not using cookies/auth yet
    allow_methods=["*"],           # allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],           # allow any HTTP headers
)


# ── Register routers ─────────────────────────────────────────────
# This connects our endpoint functions to the app.
# After this, FastAPI knows about:
#   /submissions/       (from submissions router)
#   /submissions/{id}   (from submissions router)
#   /status/            (from status router)
app.include_router(submissions.router)
# app.include_router(status.router)


# ── Health check endpoint ─────────────────────────────────────────
# A simple endpoint to test if the server is running.
# Visit http://localhost:8000/ in your browser to check.
@app.get("/")
def health_check():
    return {"status": "Motor Underwriting API is running"}
