# 🛡️ SentinelAI — Multi-Model Anomaly Detection Engine

SentinelAI is an enterprise-grade, web-based anomaly detection platform built using **FastAPI** and **React**. It enables users to upload datasets (`.csv`, `.xlsx`, `.xls`), choose from multiple Machine Learning algorithms, tune hyperparameters dynamically, and inspect real-time anomaly metrics alongside interactive data visualizations.

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: Python FastAPI
- **Machine Learning**: Scikit-Learn (`IsolationForest`, `LocalOutlierFactor`, `OneClassSVM`)
- **Data Processing**: Pandas, NumPy
- **Server**: Uvicorn ASGI Server
- **ORM & Database**: SQLAlchemy (SQLite / PostgreSQL ready)
- **Data Validation**: Pydantic

### **Frontend**
- **Framework**: React.js (Vite)
- **Data Visualization**: Recharts (Scatter Plots, Bar Charts, Score Trend Area Charts)
- **HTTP Client**: Axios
- **Styling**: Modern SOC Cyber Dark Theme (Custom CSS)

---

## 🚀 Key Features

- **Multi-Format Data Support**: Ingests `.csv`, `.xlsx`, and `.xls` files with automatic numeric feature filtering and string-number fallback cleaning.
- **Tri-Model Machine Learning Architecture**:
  - **Isolation Forest (Tree-Based)**: Isolates outliers using random feature partitioning.
  - **Local Outlier Factor - LOF (Density-Based)**: Measures local density deviation of data points relative to their $k$-nearest neighbors.
  - **One-Class SVM - OC-SVM (Boundary-Based)**: Learns decision boundaries using kernel methods (RBF, Linear, Polynomial, Sigmoid) to isolate complex anomalies.
- **Dynamic Hyperparameter Control**: Adjust contamination rate, number of estimators ($n\_estimators$), $k$-neighbors, or kernel options directly from the UI.
- **Interactive SOC Analytics Dashboard**: Real-time KPI summary cards, multi-chart visual distribution (Scatter, Ratio Bar, Score Trend), and anomaly-highlighted data tables.

---

## 📁 Project Directory Structure

```text
sentinelai-isolation-forest/
│
├── backend/                        # FastAPI Backend Service
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # API Routing, Endpoints & CORS configuration
│   │   ├── config.py               # Database URL & App Settings
│   │   ├── database.py             # SQLAlchemy Engine & Session Setup
│   │   │
│   │   ├── models/                 # Database ORM Models
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # User authentication model
│   │   │   ├── project.py          # Workspace/Project model
│   │   │   ├── dataset.py          # Dataset metadata model
│   │   │   └── model_record.py     # Metrics & execution log storage
│   │   │
│   │   ├── schemas/                # Pydantic Schemas (Request/Response Validation)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   └── anomaly.py
│   │   │
│   │   ├── api/                    # REST API Endpoint Modules
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # Auth endpoints
│   │   │   ├── dataset.py          # Dataset upload handlers
│   │   │   └── anomaly.py          # Anomaly detection execution API
│   │   │
│   │   └── ml/                     # Machine Learning Core Algorithms
│   │       ├── __init__.py
│   │       ├── preprocessor.py     # Data cleaning & StandardScaler
│   │       ├── isolation_forest.py # Isolation Forest execution logic
│   │       ├── lof.py              # Local Outlier Factor execution logic
│   │       └── oc_svm.py           # One-Class SVM execution logic
│   │
│   ├── uploads/                    # Temporary uploaded file storage
│   ├── saved_models/               # Model artifacts repository (.pkl)
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Environment configuration
│
├── frontend/                       # React.js Frontend App (Vite)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                 # Icons and image assets
│   │   ├── components/             # Reusable UI Components
│   │   │   ├── Sidebar.jsx / .css  # Vertical navigation side panel
│   │   │   ├── FileUpload.jsx / .css# File dropzone & model parameters
│   │   │   ├── SummaryCards.jsx / .css # Real-time KPI summary cards
│   │   │   └── AnomalyTable.jsx / .css # Red-highlighted anomaly log table
│   │   │
│   │   ├── pages/
│   │   │   └── Dashboard.jsx / .css# Main Analytics & Charts Dashboard layout
│   │   │
│   │   ├── services/
│   │   │   └── api.js              # Axios REST API service client
│   │   │
│   │   ├── App.jsx                 # Application entry container
│   │   ├── App.css                 # Global theme resets
│   │   └── main.jsx                # React DOM render entry
│   │
│   ├── package.json                # Frontend dependencies & scripts
│   └── vite.config.js              # Vite server & proxy configuration
│
└── README.md                       # Project Documentation
