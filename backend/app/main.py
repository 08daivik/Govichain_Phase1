from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import sys

from .database import engine, Base

# Import routers
from .routers import auth
from .routers import projects
from .routers import milestones
from .routers import users
from .routers import dashboard


app = FastAPI(
    title="Govichain API",
    description="Government Project Monitoring System",
    version="1.0.0"
)


# =========================================================
# DATABASE STARTUP CHECK
# =========================================================
@app.on_event("startup")
def startup_event():
    try:
        # Check DB connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        print("✅ Database connected successfully")

        # Create tables AFTER successful connection
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables verified/created")

    except Exception as e:
        print("\n❌ ERROR: Cannot connect to PostgreSQL database.")
        print("Please ensure PostgreSQL server is running.")
        print(f"Details: {str(e)}\n")
        sys.exit(1)


# =========================================================
# CORS CONFIG
# =========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(milestones.router)
app.include_router(users.router)
app.include_router(dashboard.router)


# =========================================================
# ROOT
# =========================================================
@app.get("/")
def root():
    return {"message": "Welcome to Govichain API"}


# =========================================================
# HEALTH CHECK
# =========================================================
@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        return {"status": "unhealthy", "database": "disconnected"}
