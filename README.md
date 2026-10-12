# 🛡️ SentinelAI — Multi-Model Anomaly Detection Engine

SentinelAI is a web-based anomaly detection platform built with **FastAPI**, **React** and **PostgreSQL**. Users sign in, upload datasets (`.csv`, `.xlsx`, `.xls`), choose a Machine Learning algorithm, tune its hyperparameters, and inspect the results through KPI cards, interactive charts and a high-performance anomaly table. Results can be **saved to the database** and loaded again later, and a **Generative AI (Groq)** assistant recommends the best model for a dataset.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Python FastAPI + Uvicorn (ASGI)
- **Machine Learning**: Scikit-Learn (`IsolationForest`, `LocalOutlierFactor`, `OneClassSVM`)
- **Data Processing**: Pandas, NumPy, OpenPyXL (Excel read/write)
- **Database**: PostgreSQL via SQLAlchemy ORM
- **Authentication**: bcrypt password hashing + JWT access tokens (PyJWT)
- **Generative AI**: Groq API (model recommendation)
- **Validation**: Pydantic (`EmailStr`)

### Frontend
- **Framework**: React.js (Vite)
- **Dashboard charts**: Chart.js via `react-chartjs-2` (Line, Bar, Scatter, Doughnut)
- **Analysis page charts**: Recharts
- **HTTP Client**: Axios
- **Styling**: Custom "Violet Nebula" dark theme (CSS variables, no UI framework)

---

## 🚀 Key Features

### 🔐 Authentication & Security
- **Sign up / Login** with bcrypt-hashed passwords (72-byte safe truncation).
- **JWT access tokens** (HS256, 24-hour expiry). Every saved-analysis endpoint is protected by a `get_current_user` dependency.
- **Ownership checks**: a user can only list, load or delete their own saved analyses.
- **Auto-logout**: if the API returns `401` (invalid or expired token), the app clears the session and returns to the login page.
- Session restored on refresh without a login-page flash.

### 🤖 Machine Learning
- **Multi-format ingestion**: `.csv`, `.xlsx`, `.xls` with automatic numeric feature filtering.
- **Three algorithms**
  - **Isolation Forest (Tree-Based)** — isolates outliers by random feature partitioning.
  - **Local Outlier Factor, LOF (Density-Based)** — compares local density against the *k* nearest neighbors.
  - **One-Class SVM (Boundary-Based)** — learns a decision boundary with RBF / Linear / Polynomial / Sigmoid kernels.
- **Dynamic hyperparameters**: contamination rate, number of estimators, number of neighbors, kernel type (shown per selected model).

### 🧠 Generative AI Assistant
- **Model recommendation** (`POST /api/suggest-model`): the backend summarizes the uploaded dataset and asks Groq which algorithm fits best.
- **AI prompt card** on the dashboard (one prompt per session, with a Generate button).

### 💾 Saved Analyses (UI → DB → UI)
- **Save** the current result table from the Anomaly Table card. The backend converts it to CSV (or Excel) and stores the file in PostgreSQL (`BYTEA`) together with the model name, contamination, record count and anomaly count.
- **Saved Analyses list** with model, anomaly count and date; **Load** converts the stored file back into table records, summary cards and graphs; **Delete** removes it.
- Loaded analyses are also pushed to the Analysis page.

### 📊 Dashboard
Layout (top to bottom):
1. **Data & Model Setup** (left) and **Generative AI prompt** (right), equal height.
2. **Summary cards** — Selected Model, Total Records, Anomalies Detected, Anomaly Percentage. Cards have a hover lift, shadow and glow animation (red theme on the anomalies card).
3. **Graph 1** (large) with a themed custom dropdown (Line / Bar / Scatter) and **Graph 2** (compact doughnut: dark violet = anomaly, light lavender = normal, with percentages).
4. **Saved Analyses** list.
5. **Detected Anomaly Records** table.

Other UI details:
- **Navbar**: larger logo and height, active-link underline, user dropdown with **Settings** and **Logout**.
- **Empty states**: charts stay empty (with a hint) until a file is uploaded and anomaly detection has run — no demo data.
- **Anomaly table**: left-aligned columns, sticky header, `—` for empty cells, red-highlighted anomaly rows, ANOMALY / NORMAL badges, **scrolls after 8 rows**, record and anomaly counts in the header, and a Save button (idle / saving / saved / error states).
- **Analysis page**: Line, Bar, Doughnut and Scatter charts (Recharts) plus the full table.
- Responsive layout for tablet and mobile; reduced-motion support on animated cards.

### ⚡ Performance (large files, 60K+ rows)
- **Virtual scrolling** in the anomaly table — only the visible rows are rendered.
- **Chart sampling** — at most 1,500 points are drawn (all anomalies are prioritized); the doughnut still uses the full counts. A note shows how many points are displayed.
- Chart animations disabled for large data; `useMemo` for derived chart data.
- Scatter charts use two series (Normal / Anomaly) instead of one element per point.
- Session cache is limited to results of 2,000 records or fewer; larger results should be saved and loaded from the database.

### 🔄 State & Refresh Behaviour
- The latest result lives in React state and is lifted to `App.jsx`, so it survives switching between the Dashboard and Analysis tabs.
- Results of up to 2,000 records are cached in `sessionStorage`, so a page refresh restores them. The cache is cleared on logout.
- The selected file itself cannot be restored after a refresh (browser security).

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | – | Health check |
| POST | `/api/auth/signup` | – | Create an account, returns JWT + user |
| POST | `/api/auth/login` | – | Log in, returns JWT + user |
| POST | `/api/detect-anomalies` | – | Run the selected model on an uploaded file |
| POST | `/api/suggest-model` | – | AI model recommendation for an uploaded file |
| POST | `/api/saves` | ✅ | Save the current result table (CSV / Excel) |
| GET | `/api/saves` | ✅ | List the user's saved analyses (metadata only) |
| GET | `/api/saves/{id}` | ✅ | Load one saved analysis as records + summary |
| DELETE | `/api/saves/{id}` | ✅ | Delete a saved analysis |

Protected endpoints expect the header `Authorization: Bearer <token>`.

**`/api/detect-anomalies` form fields**: `file`, `algorithm` (`isolation_forest` \| `lof` \| `oc_svm`), `contamination`, `n_estimators`, `n_neighbors`, `kernel`.

---

## 🗄️ Database Schema (PostgreSQL)

```text
users (1) ────────< saved_analyses (many)
```

```sql
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  full_name       VARCHAR NOT NULL,
  email           VARCHAR NOT NULL UNIQUE,
  hashed_password VARCHAR NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_analyses (
  id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name       VARCHAR(255) NOT NULL,
  file_type       VARCHAR(10)  NOT NULL DEFAULT 'csv',
  file_data       BYTEA NOT NULL,
  model_name      VARCHAR(50)  NOT NULL,
  contamination   NUMERIC(3,2),
  total_records   INTEGER,
  anomalies_found INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_analyses_user ON saved_analyses (user_id, created_at DESC);
```

Tables are created automatically on server start (`Base.metadata.create_all`). Passwords are stored only as bcrypt hashes.

---

## 📁 Project Directory Structure

```text
sentinelai-isolation-forest/
│
├── backend/                          # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # Routes: auth, detection, AI suggestion, saved analyses
│   │   ├── auth.py                   # bcrypt hashing + JWT create/decode
│   │   ├── database.py               # SQLAlchemy engine, session, Base, get_db
│   │   │
│   │   ├── models/                   # ORM models
│   │   │   ├── __init__.py           # Exports User, SavedAnalysis
│   │   │   ├── user.py               # User model
│   │   │   └── saved_analysis.py     # Saved analysis (file stored as BYTEA)
│   │   │
│   │   └── ml/                       # ML + AI core
│   │       ├── isolation_forest.py
│   │       ├── lof.py
│   │       ├── oc_svm.py
│   │       ├── dataset_helper.py     # Dataset summary for the AI advisor
│   │       └── groq_service.py       # Groq model-recommendation service
│   │
│   └── requirements.txt
│
├── frontend/                         # React (Vite)
│   ├── src/
│   │   ├── assets/                   # Logo and images
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Logo, links, user dropdown (Settings / Logout)
│   │   │   ├── FileUpload.jsx        # File input + model parameters
│   │   │   ├── AIPrompt.jsx          # Generative AI prompt card
│   │   │   ├── SummaryCards.jsx      # KPI cards with hover animation
│   │   │   ├── Graphcard.jsx         # Chart.js graphs + custom dropdown
│   │   │   └── AnomalyTable.jsx      # Virtual-scroll table + Save button
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Main dashboard (analyze, save, load, delete)
│   │   │   ├── Analysis.jsx          # Recharts analysis page
│   │   │   ├── AuthPage.jsx          # Sign in / Create account
│   │   │   └── SavedAnalyses.jsx     # Saved analyses list
│   │   │
│   │   ├── styles/                   # One CSS file per component / page
│   │   ├── App.jsx                   # Session handling, tabs, shared analysis state
│   │   └── main.jsx
│   │
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup & Run

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (create a database, e.g. `sentinelai_db`)

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows  (macOS/Linux: source venv/bin/activate)

pip install fastapi uvicorn sqlalchemy psycopg2-binary pandas numpy scikit-learn \
            openpyxl bcrypt PyJWT "pydantic[email]" python-multipart groq
```

Configuration:
- **Database URL** — set in `app/database.py`:
  `postgresql://<user>:<password>@localhost:5432/sentinelai_db`
- **`SECRET_KEY`** — JWT signing key, read from the environment (a development default exists in `auth.py`).
- **Groq API key** — read by `groq_service.py` (set it as an environment variable, e.g. `GROQ_API_KEY`).

Generate a strong secret:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Run the server:

```bash
uvicorn app.main:app --reload --port 8000
```

On startup you should see: `PostgreSQL Database Connected & Tables Synced Successfully!`

### 3. Frontend

```bash
cd frontend
npm install
npm install axios chart.js react-chartjs-2 recharts
npm run dev                      # http://localhost:5173
```

The frontend calls the API at `http://127.0.0.1:8000`.

---

## 🔒 Security Notes

- Never commit real secrets (`SECRET_KEY`, database password, Groq key). Use environment variables or a `.env` file listed in `.gitignore`.
- Restrict `allow_origins` in the CORS settings to your frontend's domain before deploying.
- Changing `SECRET_KEY` invalidates all existing tokens (everyone must log in again).
- Tokens are stored in `localStorage`; use HTTPS in production.

---

## 🧪 Typical Workflow

1. Create an account or log in.
2. Upload a `.csv` / `.xlsx` file and pick a model (use **Isolation Forest** for very large files — OC-SVM and LOF are slow on 60K+ rows).
3. Click **Detect Anomalies** to see KPI cards, graphs and the anomaly table.
4. Click **Save** to store the result; reopen it any time from **Saved Analyses**.
5. Open the **Analysis** tab for the extended chart view.

---

## 🗺️ Roadmap

- Reporting page for saved analyses (search, sort, filter, CSV / Excel download endpoint).
- Settings page (profile, password change).
- Resources page.
- Server-side result caching so **Save** does not re-upload large tables.
- Alembic migrations for schema changes.
