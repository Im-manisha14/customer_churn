# ChurnIQ — Customer Churn Prediction & Retention Intelligence

> A full-stack ML portfolio application demonstrating end-to-end customer churn prediction with XGBoost, SHAP explainability, FastAPI backend, and a React/TypeScript dashboard.

---

## Project Structure

```
Customer churn/
├── frontend/                    # React + TypeScript + Tailwind CSS (Vite)
│   └── src/
│       ├── components/
│       │   ├── layout/          # Sidebar, Layout, PageHeader
│       │   └── ui/              # KPICard, RiskBadge, States (skeleton/error/empty)
│       ├── pages/               # 7 application pages
│       │   ├── Dashboard.tsx
│       │   ├── PredictChurn.tsx
│       │   ├── CustomerExplorer.tsx
│       │   ├── ModelPerformance.tsx
│       │   ├── ChurnDrivers.tsx
│       │   ├── BusinessImpact.tsx
│       │   └── About.tsx
│       ├── services/
│       │   ├── api.ts           # API service layer (with mock fallback)
│       │   └── mockData.ts      # Demo data — replace with real model outputs
│       └── types/
│           └── index.ts         # All shared TypeScript types
├── backend/                     # Python FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/              # prediction, customers, model, business
│   │   ├── services/            # prediction_service, explanation_service, business_service
│   │   └── schemas/             # Pydantic models
│   ├── models/                  # Place churn_model.pkl here
│   ├── requirements.txt
│   └── Dockerfile
└── docker-compose.yml
```

---

## Quick Start — Frontend Only (Demo Mode)

The frontend runs fully without a backend. All data comes from the mock service layer.

```powershell
cd "c:\Customer churn\frontend"
npm install
npm run dev
```

Open: **http://localhost:3000**

---

## Quick Start — Full Stack

### 1. Backend

```powershell
cd "c:\Customer churn\backend"
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend API docs: **http://localhost:8000/docs**

### 2. Frontend (connected to backend)

Create `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:8000
```

```powershell
cd "c:\Customer churn\frontend"
npm run dev
```

---

## Docker (Full Stack)

```powershell
cd "c:\Customer churn"
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:8000

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | *(empty)* | FastAPI base URL. Leave empty to use mock data. |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/dashboard/stats` | KPI metrics |
| GET | `/dashboard/churn-by-contract` | Churn rate by contract type |
| GET | `/dashboard/churn-by-tenure` | Churn rate by tenure group |
| GET | `/dashboard/risk-distribution` | Customer risk distribution |
| POST | `/predict` | Predict churn probability |
| POST | `/explain` | SHAP-based explanation |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Get single customer |
| GET | `/model/metrics` | Model evaluation metrics |
| GET | `/model/features` | Feature importance |
| GET | `/model/roc-curve` | ROC curve data |
| GET | `/model/pr-curve` | PR curve data |
| GET | `/model/confusion-matrix` | Confusion matrix |
| POST | `/business-impact` | Business impact calculation |
| POST | `/business-impact/threshold-comparison` | Threshold comparison table |

---

## Connecting the Real XGBoost Model

### Step 1 — Train and save your model

```python
import pickle
from sklearn.pipeline import Pipeline
# ... your training code ...
with open("backend/models/churn_model.pkl", "wb") as f:
    pickle.dump(pipeline, f)
```

### Step 2 — Update prediction_service.py

In `backend/app/services/prediction_service.py`, replace the placeholder in `predict()`:

```python
import pandas as pd

row = pd.DataFrame([features.model_dump()])
# Apply the same preprocessing your training pipeline used
prob = float(_model.predict_proba(row)[0, 1])
```

### Step 3 — Update explanation_service.py

In `backend/app/services/explanation_service.py`, replace the placeholder in `explain()`:

```python
import shap
explainer = shap.TreeExplainer(_model["classifier"])
# Build preprocessed row from features
shap_values = explainer.shap_values(preprocessed_row)
# Map shap_values to ShapFactor list
```

### Step 4 — Replace demo metrics

In `backend/app/routes/model.py`, replace `DEMO_METRICS` with metrics computed from your evaluation:

```python
from sklearn.metrics import accuracy_score, roc_auc_score, ...
REAL_METRICS = ModelMetrics(
    accuracy=accuracy_score(y_test, y_pred),
    rocAuc=roc_auc_score(y_test, y_prob),
    # ...
    isDemo=False,
)
```

### Step 5 — Set VITE_API_BASE_URL

```
VITE_API_BASE_URL=http://localhost:8000
```

The frontend will automatically switch from mock data to real API responses.

---

## Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | Executive KPI overview, churn charts, high-risk table |
| Predict Churn | `/predict` | Form → ML prediction → SHAP explanation → Retention plan |
| Customer Explorer | `/customers` | Filterable/sortable customer table with detail modal |
| Model Performance | `/model` | Metrics, confusion matrix, ROC/PR curves, threshold slider |
| Churn Drivers | `/drivers` | Global feature importance + key insights |
| Business Impact | `/business` | Cost simulator + threshold comparison + ROI |
| About | `/about` | ML pipeline, tech stack, dataset information |

---

## Dataset

This project is designed around the **Telco Customer Churn** dataset:
- https://www.kaggle.com/datasets/blastchar/telco-customer-churn
- 7,043 customers, 20 features
- Target: `Churn` (Yes/No)

Download the CSV and load it in `backend/app/services/` to replace the mock customer data.

---

## Tech Stack

**Frontend**: React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide React, React Router v6, Vite 8

**Backend**: Python 3.11, FastAPI, Pydantic v2, Uvicorn

**ML**: Pandas, NumPy, Scikit-learn, XGBoost, SHAP

**Infrastructure**: Docker, Docker Compose
