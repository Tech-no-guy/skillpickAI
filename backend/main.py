import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from config import get_cors_origins
from routes.process_routes import router as process_router
from routes.candidate_routes import router as candidate_router
from routes.analytics_routes import router as analytics_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("skillpick.main")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SkillPick AI — Autonomous Hiring & Assessment Agent",
    version="1.0.0",
)

# CORS
origins = get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(process_router)
app.include_router(candidate_router)
app.include_router(analytics_router)
