# 🛡️ SentinelAI — Multi-Model Anomaly Detection Engine

SentinelAI is a web-based anomaly detection platform built using **FastAPI** and **React**. It enables users to upload datasets (`.csv`, `.xlsx`), select machine learning algorithms, tune hyperparameters dynamically, and inspect anomaly-highlighted data alongside real-time metrics.

---

## 🚀 Key Features

- **Multi-Format Data Support**: Ingests `.csv`, `.xlsx`, and `.xls` files with automatic numeric feature filtering and data cleaning.
- **Multiple Machine Learning Models**:
  - **Isolation Forest (Tree-Based)**: Isolates outliers through random feature partitioning.
  - **Local Outlier Factor - LOF (Density-Based)**: Detects local anomalies based on neighborhood density metrics (`lof.py`).
  - 🚧 **3rd Model Coming Soon**: Additional algorithms will be integrated shortly.
- **Dynamic Hyperparameter Tuning**: Adjust contamination rate, number of estimators, or neighborhood size ($k$) directly from the UI.
- **Full-Stack Modular Architecture**: Decoupled FastAPI backend and React frontend with dedicated services for database models, API schemas, and ML algorithms.

---

## 📁 Project Directory Structure

```text
sentinelai-isolation-forest/
│
├── backend/                        # FastAPI Backend Service
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # Application Entrypoint & CORS configuration
│   │   ├── config.py               # Database URL & App Settings
│   │   ├── database.py             # SQLAlchemy Engine & Session Setup
│   │   │
│   │   ├── models/                 # DB Models
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # User authentication model
│   │   │   ├── project.py          # Workspace/Project model
│   │   │   ├── dataset.py          # Dataset metadata model
│   │   │   └── model_record.py     # Trained model & metrics storage
│   │   │
│   │   ├── schemas/                # Pydantic Schemas (Validation)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   └── anomaly.py
│   │   │
│   │   ├── api/                    # REST API Routes
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # Auth endpoints
│   │   │   ├── dataset.py          # CSV/Excel upload endpoints
│   │   │   └── anomaly.py          # Detection API
│   │   │
│   │   └── ml/                     # ML Core Modules
│   │       ├── __init__.py
│   │       ├── preprocessor.py     # Data cleaning & StandardScaler
│   │       ├── isolation_forest.py # Isolation Forest execution
│   │       └── lof.py              # Local Outlier Factor execution
│   │
│   ├── uploads/                    # Temporary upload storage
│   ├── saved_models/               # Model artifacts repository (.pkl)
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Environment variables
│
├── frontend/                       # React.js Frontend App (Vite)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                 # Icons, logos, and styling assets
│   │   ├── components/             # React Components
│   │   │   ├── FileUpload.jsx      # File upload & model controls
│   │   │   ├── FeatureSelector.jsx # Dynamic feature selection
│   │   │   ├── Hyperparams.jsx     # Parameter adjustment sliders
│   │   │   ├── SummaryCards.jsx    # Metric summaries & model badges
│   │   │   ├── PlotChart.jsx       # Data visualization charts
│   │   │   └── AnomalyTable.jsx    # Anomaly-highlighted data table
│   │   │
│   │   ├── services/
│   │   │   └── api.js              # Axios REST API requests
│   │   │
│   │   ├── App.jsx                 # Dashboard Layout
│   │   ├── index.css               # Global styles
│   │   └── main.jsx                # React Entry Point
│   │
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite configuration
│
└── README.md                       # Documentation
