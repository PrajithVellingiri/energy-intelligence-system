# Database Architecture & Data Flow

## Overview
The AI Energy Platform uses **SQLite** database with **SQLAlchemy ORM** (async) to store user data, analysis reports, and training history.

---

## Database Tables

### 1. **users** Table
Stores user authentication information.

**Schema:**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:**
- User registration and authentication
- JWT token generation based on user ID
- Password stored as bcrypt hash (never plain text)

---

### 2. **analysis_reports** Table
Stores complete analysis results for each CSV upload per user.

**Schema:**
```sql
CREATE TABLE analysis_reports (
    id INTEGER PRIMARY KEY,
    user_id INTEGER FOREIGN KEY -> users.id,
    filename VARCHAR NOT NULL,
    data_hash VARCHAR NOT NULL,
    record_count INTEGER NOT NULL,
    result_json TEXT NOT NULL,           -- Full analysis as JSON
    -- Quick summary fields for list view:
    avg_24h FLOAT,
    max_24h FLOAT,
    health_score FLOAT,
    health_grade VARCHAR,
    anomaly_count INTEGER,
    total_records INTEGER,
    date_range_start VARCHAR,
    date_range_end VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:**
- Persist analysis results so users can view them later
- Each report is a complete snapshot of CSV analysis
- Summary fields enable fast report list display
- Full JSON stores: forecasts, anomalies, optimization, health scores

---

### 3. **trained_datasets** Table
Tracks which CSV datasets have been used for AI model training.

**Schema:**
```sql
CREATE TABLE trained_datasets (
    id INTEGER PRIMARY KEY,
    data_hash VARCHAR UNIQUE NOT NULL,
    filename VARCHAR,
    record_count INTEGER NOT NULL,
    lstm_val_loss FLOAT,
    anomaly_count INTEGER,
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:**
- Prevent duplicate training on same dataset
- Track model training history
- Store training metrics (validation loss, anomalies found)

---

## Data Flow

### 🔐 **Authentication Flow**

#### Signup:
```
1. User submits: email, username, password
2. Backend checks if email/username exists
3. Password hashed with bcrypt
4. User record created in 'users' table
5. JWT token generated with user_id
6. Token returned to frontend
7. Frontend stores token in localStorage
```

#### Login:
```
1. User submits: email, password
2. Backend queries 'users' table by email
3. Password verified against hashed_password
4. JWT token generated with user_id
5. Token returned to frontend
6. Frontend stores token in localStorage
```

#### Protected Routes:
```
1. Frontend sends JWT token in Authorization header
2. Backend verifies token signature
3. Extracts user_id from token payload
4. Uses user_id to fetch/filter data
```

---

### 📊 **CSV Upload & Analysis Flow**

#### Step 1: Upload CSV
```
Frontend (DashboardPage)
    ↓ [User uploads CSV file]
POST /api/analyze-csv
    ↓
Backend (ai_routes.py)
```

#### Step 2: Process & Store
```python
# Backend Processing:
1. Read CSV file → pandas DataFrame
2. Compute data_hash (SHA256 of content)
3. Check if data_hash exists in 'trained_datasets'
   - If NO: Train AI models with this data
   - If YES: Skip training (already used)
4. Normalize CSV data (SmartCSVAnalyzer)
5. Run AI analysis:
   - Forecast (LSTM)
   - Anomaly Detection (Isolation Forest)
   - Optimization (Load Shifting)
   - Health Score (Weighted metrics)
6. Create AnalysisReport record:
   - user_id (from JWT)
   - filename
   - data_hash
   - result_json (full analysis as JSON)
   - Summary fields (avg_24h, health_score, etc.)
7. Save to 'analysis_reports' table
8. Return analysis result + report_id
```

#### Step 3: Display Results
```
Backend returns JSON
    ↓
Frontend (UploadAnalysisPanel)
    ↓
Renders: Charts, Tables, Metrics
```

---

### 📋 **Report List Flow**

#### Fetch Reports:
```
Frontend (DashboardPage)
    ↓ [On page load]
GET /api/reports
    ↓
Backend:
    1. Extract user_id from JWT
    2. Query: SELECT * FROM analysis_reports 
             WHERE user_id = ? 
             ORDER BY created_at DESC
    3. Return list of reports (summary only)
    ↓
Frontend displays report cards in sidebar
```

#### View Saved Report:
```
User clicks report card
    ↓
GET /api/reports/{report_id}
    ↓
Backend:
    1. Extract user_id from JWT
    2. Query: SELECT * FROM analysis_reports 
             WHERE id = ? AND user_id = ?
    3. Parse result_json (full analysis)
    4. Return complete analysis
    ↓
Frontend renders full analysis
```

#### Delete Report:
```
User clicks delete button
    ↓
DELETE /api/reports/{report_id}
    ↓
Backend:
    1. Extract user_id from JWT
    2. Query: DELETE FROM analysis_reports 
             WHERE id = ? AND user_id = ?
    3. Commit transaction
    ↓
Frontend removes report from list
```

---

## Data Storage Details

### 🔹 **User Data**
- **Location:** `users` table
- **Stored:** Email, username, hashed password
- **Never Stored:** Plain text passwords
- **Access:** Only during auth operations

### 🔹 **CSV Data**
- **NOT stored in database**
- **Process:** Upload → Analyze → Discard
- **Only stored:** Analysis results (JSON)
- **Reason:** Save space, privacy

### 🔹 **Analysis Results**
- **Location:** `analysis_reports.result_json` (TEXT column)
- **Format:** JSON string containing:
  ```json
  {
    "detected_columns": {...},
    "dashboard_summary": {...},
    "analysis": {
      "forecast": {...},
      "anomalies": {...},
      "optimization": {...},
      "health_score": {...}
    },
    "fix_suggestions": {...},
    "training_info": {...}
  }
  ```
- **Size:** Typically 50-500 KB per report
- **Retrieval:** Parsed back to JSON when fetched

### 🔹 **AI Models**
- **NOT stored in database**
- **Location:** File system (`AI/checkpoints/`)
- **Files:**
  - `lstm_forecaster.pth` (PyTorch model)
  - `anomaly_detector.pkl` (scikit-learn model)
  - `forecast_scaler.pkl` (MinMaxScaler)
- **Loaded:** Once at server startup
- **Updated:** When new training occurs

---

## Database File Location

```
energy-platform/
└── energy-backend/
    └── energy_platform.db  ← SQLite database file
```

**Connection String:**
```python
DATABASE_URL = "sqlite+aiosqlite:///./energy_platform.db"
```

---

## Security Features

### 🔒 **Password Security**
- Hashed with bcrypt (salt + hash)
- Never stored or transmitted in plain text
- Verified using bcrypt.checkpw()

### 🔒 **JWT Tokens**
- Signed with SECRET_KEY
- Contains: user_id, email, expiration
- Expires after 24 hours
- Verified on every protected route

### 🔒 **Data Isolation**
- Users can only access their own reports
- All queries filtered by user_id from JWT
- Foreign key constraints enforce relationships

### 🔒 **SQL Injection Prevention**
- SQLAlchemy ORM (parameterized queries)
- No raw SQL with user input

---

## Performance Optimizations

### ⚡ **Indexes**
- `users.email` (UNIQUE INDEX)
- `users.username` (UNIQUE INDEX)
- `analysis_reports.user_id` (INDEX)
- `trained_datasets.data_hash` (UNIQUE INDEX)

### ⚡ **Async Operations**
- All database operations are async
- Non-blocking I/O for better concurrency
- Uses `asyncio` and `aiosqlite`

### ⚡ **Caching Strategy**
- AI models loaded once at startup
- Reports cached in frontend state
- No repeated model loading per request

---

## Data Lifecycle

### 📥 **Data In**
1. User uploads CSV
2. CSV processed in memory
3. Analysis results saved to DB
4. CSV discarded

### 📤 **Data Out**
1. User requests report list
2. DB returns summary fields
3. User clicks specific report
4. DB returns full JSON
5. Frontend parses and displays

### 🗑️ **Data Deletion**
1. User deletes report
2. Record removed from `analysis_reports`
3. CSV data already discarded
4. No orphaned data

---

## Backup & Recovery

### 💾 **Database Backup**
```bash
# Manual backup
cp energy_platform.db energy_platform_backup.db

# Automated backup (recommended)
# Add to cron job or scheduled task
```

### 💾 **Model Backup**
```bash
# Backup trained models
cp -r AI/checkpoints/ AI/checkpoints_backup/
```

---

## Summary

| Component | Storage | Format | Persistence |
|-----------|---------|--------|-------------|
| Users | SQLite DB | Table rows | Permanent |
| Passwords | SQLite DB | Bcrypt hash | Permanent |
| CSV Files | Memory only | DataFrame | Temporary |
| Analysis Results | SQLite DB | JSON text | Permanent |
| AI Models | File system | .pth/.pkl | Permanent |
| JWT Tokens | Frontend localStorage | String | 24 hours |
| Training History | SQLite DB | Table rows | Permanent |

**Key Points:**
- ✅ User data persists across sessions
- ✅ Analysis reports saved per user
- ✅ CSV data NOT stored (privacy + space)
- ✅ AI models shared across all users
- ✅ Secure authentication with JWT
- ✅ Fast async database operations
