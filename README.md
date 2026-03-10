# Walsaler.ai — Retail Sales Intelligence

> An end-to-end ML forecasting system that predicts weekly Walmart store sales with **91.81% accuracy**, powered by a Random Forest + Gradient Boosting ensemble trained on 421K records.

![Walsaler.ai Hero](walmart-forecast/public/bg_walmart.jpg)

---

## 🧠 What It Does

Walsaler.ai takes a store number, department, and date — and returns a precise weekly sales forecast in under a second. It was built from scratch: raw CSV → feature engineering → ensemble model → FastAPI backend → Next.js frontend.

**Live demo features:**
- Single prediction with real-time inference
- Batch forecasting (up to 500 rows via CSV upload)
- Analytics dashboard with Actual vs. Predicted chart
- Full model transparency (feature importances, architecture info)

---

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| Weighted MAE (WMAE) | **8.19%** |
| Model Accuracy | **91.81%** |
| MAE | $1,450.52 |
| RMSE | $3,174.48 |
| Peak Forecast | $4.60M (Week 52, Holiday 2012) |

---

## 🗂 Project Structure

```
walmart-app/
├── walmart_forecast.py       # ML training script (run once)
├── preprocessor.py           # WalmartPreprocessor class
├── main.py                   # FastAPI backend
├── model_random_forest.joblib
├── model_gradient_boosting.joblib
├── label_encoder.joblib
├── model_metadata.joblib
├── archive/                  # Kaggle CSVs (not committed — see Data section)
│   ├── train.csv
│   ├── test.csv
│   ├── features.csv
│   └── stores.csv
└── walmart-forecast/         # Next.js 15 frontend
    ├── app/
    ├── components/
    ├── hooks/
    ├── lib/
    └── public/
```

---

## ⚙️ Tech Stack

**ML / Backend**
- Python 3.13 · Pandas · Scikit-learn · Joblib
- FastAPI · Uvicorn
- Random Forest (200 trees, depth 20) + Gradient Boosting (300 trees, depth 6, lr 0.08)

**Frontend**
- Next.js 15 · TypeScript · Tailwind CSS
- Framer Motion · Recharts

---

## 🚀 Getting Started

### 1. Get the Data

Download the Walmart Store Sales dataset from [Kaggle](https://www.kaggle.com/competitions/walmart-recruiting-store-sales-forecasting/data) and place the CSVs in an `archive/` folder:

```
archive/
  train.csv
  test.csv
  features.csv
  stores.csv
```

### 2. Train the Model *(first time only — takes ~5–10 min)*

```bash
cd walmart-app
python walmart_forecast.py
```

This generates 4 `.joblib` files in the project root.

### 3. Start the Backend

```bash
python main.py
# API running at http://localhost:8000
```

### 4. Start the Frontend

```bash
cd walmart-forecast
npm install
npm run dev
# App running at http://localhost:3000
```

> **Note:** Use `python` not `python3` if you're on Anaconda.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/model/info` | Model metadata & feature list |
| `POST` | `/predict` | Single prediction |
| `POST` | `/predict/batch` | Batch predictions (up to 500 rows) |

**Single prediction payload:**
```json
{
  "Store": 1,
  "Dept": 1,
  "Date": "2012-11-02",
  "IsHoliday": false,
  "Temperature": 55.0,
  "Fuel_Price": 3.45,
  "CPI": 211.0,
  "Unemployment": 7.8
}
```

---

## 🧪 Feature Engineering

31 features engineered from raw data:

| Category | Features |
|----------|----------|
| Time | Week, Month, Year, Quarter, sin/cos cyclical encodings |
| Lag signals | Lag-4, Lag-13 weekly sales |
| Rolling stats | 4-week rolling mean & std |
| Store metadata | Type (A/B/C), Size, Dept encoded |
| Economic | Temperature, Fuel Price, CPI, Unemployment |
| Promotions | MarkDown 1–5 |
| Holiday flags | 8 peak weeks (Thanksgiving, Christmas, etc.) |

---

## 📁 Data

The raw CSV files are **not committed** to this repo (Kaggle terms of use). Download them from:

👉 [Kaggle — Walmart Store Sales Forecasting](https://www.kaggle.com/competitions/walmart-recruiting-store-sales-forecasting/data)

The `.joblib` model files are also excluded (large binary files). Run `walmart_forecast.py` to regenerate them.

---

## 🖼️ Images

Place these files in `walmart-forecast/public/` before running the frontend:

- `brain.png` — hero robot/brain image
- `bg_walmart.jpg` — hero background image

These are excluded from the repo due to file size.

---

## 📝 License

MIT — free to use, modify, and distribute.

---

*Built by [@raniaf](https://github.com/raniaf) · Powered by scikit-learn + Next.js*
