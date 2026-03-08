# AI Energy Intelligence Platform

An AI-powered full-stack platform for energy consumption analytics, forecasting, anomaly detection, cost optimization, and sustainability scoring.

## Quick Start

### 1. Backend Setup
```bash
cd energy-backend
pip install poetry
poetry install

# Train AI models (optional - pre-trained models included)
poetry run python ../AI/train_models.py

# Start backend server
poetry run fastapi dev app/main.py --port 8000
```

### 2. Frontend Setup
```bash
cd energy-frontend
npm install

# Start dev server
npm run dev
```

### 3. Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs


## Architecture

```
energy-platform/
├── AI/                          # AI/ML Layer
│   ├── data/                    # Dataset & generator
│   │   ├── generate_dataset.py  # Synthetic data generator
│   │   └── energy_data.csv      # Generated dataset (17,521 records)
│   ├── models/                  # ML Models
│   │   ├── lstm_forecaster.py   # LSTM time-series forecasting (PyTorch)
│   │   └── anomaly_detector.py  # Isolation Forest anomaly detection
│   ├── optimization/            # Cost optimization engine
│   │   └── load_optimizer.py    # Peak/off-peak load shifting
│   ├── scoring/                 # Energy health scoring
│   │   └── energy_score.py      # Weighted sustainability metrics
│   ├── preprocessing/           # Data pipeline
│   │   └── pipeline.py          # Validation, scaling, sequences
│   ├── checkpoints/             # Trained model files
│   │   ├── lstm_forecaster.pth  # LSTM model weights
│   │   ├── anomaly_detector.pkl # Isolation Forest model
│   │   └── forecast_scaler.pkl  # MinMaxScaler state
│   └── train_models.py          # Master training script
├── energy-backend/              # FastAPI Backend
│   ├── app/
│   │   ├── main.py              # App entry point + CORS + lifespan
│   │   ├── config.py            # Configuration & paths
│   │   ├── models_db/           # SQLAlchemy models
│   │   │   ├── database.py      # Async DB engine
│   │   │   └── user.py          # User model
│   │   ├── routes/              # API endpoints
│   │   │   ├── auth_routes.py   # Signup, login (JWT + bcrypt)
│   │   │   └── ai_routes.py     # Forecast, anomaly, optimize, score
│   │   └── services/            # Business logic
│   │       ├── auth_service.py  # JWT verification dependency
│   │       └── ai_service.py    # AI model orchestration
│   └── pyproject.toml           # Python dependencies
└── energy-frontend/             # React Frontend
    ├── src/
    │   ├── App.tsx              # Router + auth guards
    │   ├── lib/
    │   │   ├── api.ts           # Axios API client
    │   │   └── auth-context.tsx # Auth state management
    │   ├── pages/
    │   │   ├── LoginPage.tsx    # Login form
    │   │   ├── SignupPage.tsx   # Registration form
    │   │   └── DashboardPage.tsx# Main dashboard
    │   └── components/
    │       ├── ForecastChart.tsx # LSTM prediction visualization
    │       ├── AnomalyAlerts.tsx# Anomaly scatter plot + alerts
    │       ├── OptimizationPanel.tsx # Cost optimization charts
    │       └── EnergyScoreCard.tsx   # Health score gauge
    └── package.json
```

## AI Models

### 1. LSTM Forecaster (PyTorch)
- Stacked LSTM neural network for time-series energy prediction
- 24-hour lookback window, recursive multi-step forecasting
- Trained on 17,521 hourly data points with early stopping
- MSE loss, Adam optimizer, gradient clipping

### 2. Isolation Forest Anomaly Detector (scikit-learn)
- Detects abnormal energy consumption patterns
- Features: energy_kwh, hour_of_day, day_of_week
- Severity scoring (0-1) based on decision function
- 5% contamination threshold

### 3. Load Optimization Engine
- Simulates peak-to-off-peak load shifting
- Configurable tariff rates and shiftable load percentage
- Calculates estimated cost savings and optimal shift hours

### 4. Energy Health Scorer
- Weighted score (0-100) from anomaly rate, peak variance, carbon intensity
- Letter grade (A+ to F) with AI-generated insights
- Carbon emissions tracking (kg CO2 per kWh)

## Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Frontend | React, Vite, TypeScript, TailwindCSS, Recharts |
| Backend  | FastAPI, SQLAlchemy, SQLite, JWT, bcrypt       |
| AI/ML    | PyTorch (LSTM), scikit-learn, pandas, numpy    |


## API Endpoints

| Method | Endpoint          | Auth | Description                    |
|--------|-------------------|------|--------------------------------|
| POST   | /auth/signup      | No   | Register new user              |
| POST   | /auth/login       | No   | Login and get JWT token        |
| GET    | /api/dashboard    | Yes  | Dashboard summary metrics      |
| GET    | /api/forecast     | Yes  | LSTM energy forecast (1-168h)  |
| GET    | /api/anomaly      | Yes  | Anomaly detection (1-365 days) |
| GET    | /api/optimize     | Yes  | Load optimization analysis     |
| GET    | /api/energy-score | Yes  | Energy health score            |

## Default Credentials
Create an account via the signup page, or use:
- Email: any valid email
- Password: min 6 characters

## Dataset Information

The platform uses energy consumption datasets combined with environmental parameters to train AI models for forecasting and anomaly detection.

### Dataset Features

The dataset contains the following attributes:

* Temperature
* Humidity
* Wind Speed
* General Diffuse Flow
* Diffuse Flow
* Power Consumption Zone 1
* Power Consumption Zone 2
* Power Consumption Zone 3

These variables allow the AI system to understand how environmental factors influence electricity consumption patterns.

### Dataset Source

The dataset used in this project is based on publicly available energy consumption datasets and synthetic data generation techniques to simulate realistic energy usage scenarios.

### Data Processing

Before training the AI models, the dataset undergoes preprocessing steps:

* Missing value handling
* Feature normalization
* Time-series alignment
* Data validation

### AI Model Training

The processed dataset is used to train machine learning models for:

* Energy demand forecasting
* Energy anomaly detection
* Load optimization recommendations

These models learn patterns in energy usage and environmental conditions to generate intelligent predictions for the dashboard.

