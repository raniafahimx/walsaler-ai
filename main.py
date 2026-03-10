"""
Phase 3: Walmart Sales Forecasting — FastAPI Backend
-----------------------------------------------------
Endpoints:
  GET  /              → health check
  GET  /model/info    → model metadata & metrics
  POST /predict       → single prediction
  POST /predict/batch → batch predictions
"""

import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator

# Import our Phase 2 preprocessor
from preprocessor import WalmartPreprocessor


# ─── PATHS ───────────────────────────────────────────────────
BASE_DIR  = '/Users/raniaf./Desktop/walmart-app'
CSV_DIR   = f'{BASE_DIR}/archive (2) 3'

STORES_PATH   = f'{CSV_DIR}/stores.csv'
FEATURES_PATH = f'{CSV_DIR}/features.csv'
TRAIN_PATH    = f'{CSV_DIR}/train.csv'
RF_PATH       = f'{BASE_DIR}/model_random_forest.joblib'
GB_PATH       = f'{BASE_DIR}/model_gradient_boosting.joblib'
ENCODER_PATH  = f'{BASE_DIR}/label_encoder.joblib'
METADATA_PATH = f'{BASE_DIR}/model_metadata.joblib'


# ─── APP STATE ───────────────────────────────────────────────
# Holds all loaded objects so they are initialised once at startup
# and shared across all requests (no repeated disk I/O).
app_state: dict = {}


# ─── LIFESPAN (startup / shutdown) ───────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models and preprocessor once when the server starts."""
    print("=" * 55)
    print("  Walmart Forecasting API — starting up")
    print("=" * 55)

    # Validate that all required files exist before loading
    required_files = {
        'Random Forest model':    RF_PATH,
        'Gradient Boosting model': GB_PATH,
        'Label Encoder':          ENCODER_PATH,
        'Model Metadata':         METADATA_PATH,
        'stores.csv':             STORES_PATH,
        'features.csv':           FEATURES_PATH,
        'train.csv':              TRAIN_PATH,
    }
    missing = [name for name, path in required_files.items() if not os.path.exists(path)]
    if missing:
        raise RuntimeError(
            f"Missing required files: {missing}\n"
            "Run walmart_forecast.py first to generate the .joblib model files."
        )

    # Load models
    print("\n[1] Loading models...")
    app_state['rf'] = joblib.load(RF_PATH)
    print("    model_random_forest.joblib     ✓")
    app_state['gb'] = joblib.load(GB_PATH)
    print("    model_gradient_boosting.joblib ✓")

    # Load metadata
    meta = joblib.load(METADATA_PATH)
    app_state['meta']      = meta
    app_state['rf_weight'] = meta['rf_weight']
    app_state['gb_weight'] = meta['gb_weight']
    print("    model_metadata.joblib          ✓")

    # Initialise preprocessor (loads CSVs + builds lookup tables)
    print("\n[2] Initialising preprocessor...")
    app_state['preprocessor'] = WalmartPreprocessor(
        stores_path   = STORES_PATH,
        features_path = FEATURES_PATH,
        train_path    = TRAIN_PATH,
        metadata_path = METADATA_PATH,
        encoder_path  = ENCODER_PATH,
    )
    print("    Preprocessor ready             ✓")

    app_state['started_at'] = datetime.utcnow().isoformat() + 'Z'
    print("\n  API is ready. Listening for requests.")
    print("=" * 55)

    yield  # ← server runs here

    # Shutdown
    app_state.clear()
    print("API shut down cleanly.")


# ─── FASTAPI APP ─────────────────────────────────────────────
app = FastAPI(
    title       = "Walmart Sales Forecasting API",
    description = "Predicts weekly sales for a given Walmart store, department, and date.",
    version     = "1.0.0",
    lifespan    = lifespan,
)

# Allow all origins so the frontend (any port / domain) can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


# ─── SCHEMAS ─────────────────────────────────────────────────

class PredictRequest(BaseModel):
    store: int   = Field(..., ge=1, le=45,  example=1,            description="Walmart store number (1–45)")
    dept:  int   = Field(..., ge=1, le=99,  example=1,            description="Department number (1–99)")
    date:  str   = Field(...,               example="2012-11-02", description="Date in YYYY-MM-DD format")

    @validator('date')
    def validate_date_format(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError("date must be in YYYY-MM-DD format, e.g. '2012-11-02'")
        return v


class PredictResponse(BaseModel):
    store:               int
    dept:                int
    date:                str
    predicted_sales:     float = Field(..., description="Predicted weekly sales in USD")
    predicted_sales_fmt: str   = Field(..., description="Formatted prediction, e.g. '$24,153.80'")
    model:               str   = Field(..., description="Model used for prediction")


class BatchPredictRequest(BaseModel):
    inputs: List[PredictRequest] = Field(..., min_items=1, max_items=500)


class BatchPredictResponse(BaseModel):
    count:       int
    predictions: List[PredictResponse]


class ModelInfoResponse(BaseModel):
    model_name:    str
    version:       str
    mae:           float
    rmse:          float
    wmae_pct:      float
    rf_weight:     float
    gb_weight:     float
    feature_count: int
    started_at:    str


# ─── HELPER ──────────────────────────────────────────────────

def _run_prediction(store: int, dept: int, date: str) -> float:
    """
    Core prediction logic shared by both single and batch endpoints.
    Returns the raw float prediction in USD.
    """
    preprocessor: WalmartPreprocessor = app_state['preprocessor']
    rf  = app_state['rf']
    gb  = app_state['gb']
    w_rf = app_state['rf_weight']
    w_gb = app_state['gb_weight']

    # Validate input
    check = preprocessor.validate_input(store, dept, date)
    if not check['valid']:
        raise HTTPException(status_code=422, detail=check['errors'])

    # Preprocess → model-ready feature vector
    X = preprocessor.transform(store=store, dept=dept, date=date)

    # Ensemble prediction (RF 60% + GB 40%)
    pred_rf = float(np.clip(rf.predict(X)[0], 0, None))
    pred_gb = float(np.clip(gb.predict(X)[0], 0, None))
    prediction = w_rf * pred_rf + w_gb * pred_gb

    return round(prediction, 2)


def _build_response(store: int, dept: int, date: str, prediction: float) -> PredictResponse:
    return PredictResponse(
        store               = store,
        dept                = dept,
        date                = date,
        predicted_sales     = prediction,
        predicted_sales_fmt = f"${prediction:,.2f}",
        model               = "RF(60%) + GradientBoosting(40%) Ensemble",
    )


# ─── ROUTES ──────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    """Health check — confirms the API is running."""
    return {
        "status":  "ok",
        "message": "Walmart Sales Forecasting API is running.",
        "docs":    "/docs",
    }


@app.get("/model/info", response_model=ModelInfoResponse, tags=["Model"])
def model_info():
    """Returns metadata about the loaded model, including validation metrics."""
    meta = app_state['meta']
    return ModelInfoResponse(
        model_name    = "RF + Gradient Boosting Ensemble",
        version       = "1.0.0",
        mae           = round(meta['mae'],  2),
        rmse          = round(meta['rmse'], 2),
        wmae_pct      = round(meta['wmae'], 2),
        rf_weight     = meta['rf_weight'],
        gb_weight     = meta['gb_weight'],
        feature_count = len(meta['feature_cols']),
        started_at    = app_state.get('started_at', 'unknown'),
    )


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
def predict(request: PredictRequest):
    """
    Predict weekly sales for a single (Store, Dept, Date) combination.

    **Example request body:**
    ```json
    { "store": 1, "dept": 1, "date": "2012-11-02" }
    ```
    """
    prediction = _run_prediction(request.store, request.dept, request.date)
    return _build_response(request.store, request.dept, request.date, prediction)


@app.post("/predict/batch", response_model=BatchPredictResponse, tags=["Prediction"])
def predict_batch(request: BatchPredictRequest):
    """
    Predict weekly sales for up to 500 (Store, Dept, Date) combinations in one call.

    **Example request body:**
    ```json
    {
      "inputs": [
        { "store": 1,  "dept": 1,  "date": "2012-11-02" },
        { "store": 5,  "dept": 92, "date": "2012-11-09" },
        { "store": 20, "dept": 14, "date": "2012-12-28" }
      ]
    }
    ```
    """
    preprocessor: WalmartPreprocessor = app_state['preprocessor']
    rf  = app_state['rf']
    gb  = app_state['gb']
    w_rf = app_state['rf_weight']
    w_gb = app_state['gb_weight']

    # Validate all inputs up-front before running any predictions
    errors = []
    for i, item in enumerate(request.inputs):
        check = preprocessor.validate_input(item.store, item.dept, item.date)
        if not check['valid']:
            errors.append(f"Row {i}: {check['errors']}")
    if errors:
        raise HTTPException(status_code=422, detail=errors)

    # Batch preprocess in one call (much faster than looping)
    batch_inputs = [
        {'store': item.store, 'dept': item.dept, 'date': item.date}
        for item in request.inputs
    ]
    X_batch = preprocessor.transform_batch(batch_inputs)

    # Ensemble predictions
    preds_rf = np.clip(rf.predict(X_batch), 0, None)
    preds_gb = np.clip(gb.predict(X_batch), 0, None)
    predictions = w_rf * preds_rf + w_gb * preds_gb

    responses = [
        _build_response(item.store, item.dept, item.date, round(float(pred), 2))
        for item, pred in zip(request.inputs, predictions)
    ]

    return BatchPredictResponse(count=len(responses), predictions=responses)


# ─── ENTRY POINT ─────────────────────────────────────────────
if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
