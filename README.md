# Size Recommendation Backend API

A complete, production-grade **REST API Backend** built with **Python 3.11+**, **FastAPI**, **SQLAlchemy 2.0 (SQLite)**, **Alembic**, **Pydantic v2**, **PyJWT + bcrypt**, and **scikit-learn/joblib** for apparel size and fit recommendations, including dedicated **Browser Extension REST endpoints**.

---

## Features Overview

- **Authentication & Role-Based Access Control**: JWT access + refresh tokens, token blacklisting on logout/refresh rotation, `bcrypt` password hashing, sliding-window rate limiting on auth endpoints, and `user` vs `admin` authorization dependencies.
- **Body Measurement Management**: Multiple measurement profiles per user, automatic conversion from inches (`in`) to centimetres (`cm`) and pounds (`lbs`) to kilograms (`kg`), physiological min/max validation, category-specific required fields, and fit preference storage (`slim`, `regular`, `relaxed`).
- **4-Category Strategy Recommendation Engine**:
  - `MensTopsStrategy` (`mens_tops`): Chest, shoulder, sleeve, torso
  - `WomensTopsStrategy` (`womens_tops`): Bust, underbust (where relevant), shoulder, sleeve
  - `MensBottomsStrategy` (`mens_bottoms`): Waist, hips, inseam, thigh, rise
  - `WomensBottomsStrategy` (`womens_bottoms`): Waist, hips, inseam, thigh, rise
  - Configurable ease allowance tables (`app/services/ease_config.json`), fabric stretch compensation, top-N ranked sizes, per-measurement fit notes, and graceful handling of missing measurements.
- **Machine Learning Integration & Automatic Rule Fallback**: Loads a trained scikit-learn classifier via `joblib`, validates output schema/confidence/allowed sizes, automatically falls back to the rule-based strategy engine if the model is unavailable or low-confidence, and logs every prediction in `prediction_logs`.
- **Fit Feedback & Analytics**: Captures post-purchase user fit feedback connected to recommendations, categorizes fit labels (`too_tight`, `good_fit`, `loose`), computes accuracy/acceptance metrics by brand, category, and model version, and exports clean labelled CSV training data for admins.
- **Browser Extension REST Support**: Matches product pages by URL, domain, or external product ID, fetches the authenticated user's measurements, returns instant size recommendations, and handles unsupported websites gracefully (`{"supported": false, "message": "..."}` with HTTP 200).

---

## Quickstart & Run Instructions

### 1. Environment & Dependencies

```bash
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

### 2. Database Migrations (Alembic)

```bash
alembic upgrade head
```

### 3. Train Initial ML Artifact & Seed Sample Data

```bash
# Train the stub RandomForest size classifier artifact:
python -m app.ml.train_stub

# Seed admin account, demo user, 4 categories, brands, products, and verified size charts:
python seed.py
```

**Seeded Credentials:**
- **Admin**: `admin@sizerec.example.com` / `AdminPass123`
- **Standard User**: `alex@sizerec.example.com` / `UserPass123`

### 4. Start the FastAPI Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/api/v1/health`

### 5. Run Automated Tests

```bash
pytest -v
```

---

## Git & GitHub Setup Steps

```bash
git init
git add .
git commit -m "feat: complete FastAPI size recommendation backend with ML and extension APIs"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
