"""
ChurnIQ — FastAPI Backend
Entry point: uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import prediction, customers, model, business

app = FastAPI(
    title="ChurnIQ API",
    description="Customer Churn Prediction & Retention Intelligence API",
    version="1.0.0",
)

@app.on_event("startup")
def startup_event():
    from app.services.prediction_service import load_model
    load_model()

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(prediction.router, tags=["Prediction"])
app.include_router(customers.router,  prefix="/customers", tags=["Customers"])
app.include_router(model.router,      prefix="/model",     tags=["Model"])
app.include_router(business.router,   tags=["Business"])


# ── Health ────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "ChurnIQ API", "version": "1.0.0"}
