# API Endpoints & Configuration Summary

**Project:** NextGenArchitect  
**Last Updated:** 2026-03-19  

---

## Table of Contents
1. [Backend API Configuration](#backend-api-configuration)
2. [Frontend API Configuration](#frontend-api-configuration)
3. [Database Configuration](#database-configuration)
4. [CORS Configuration](#cors-configuration)
5. [Environment Variables](#environment-variables)
6. [Files Requiring Updates](#files-requiring-updates)

---

## Backend API Configuration

### Main Application Configuration
**File:** [backend/app.py](backend/app.py)  
**Lines:** 1-50

#### CORS Setup (Development)
```python
# Line 24-26: CORS configuration
CORS(app, 
     origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"], 
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type", "Authorization"])
```
- **Allowed Origins (DEVELOPMENT):**
  - `http://localhost:5173` - Primary frontend development server (Vite)
  - `http://localhost:5174` - Alternative port 1
  - `http://localhost:5175` - Alternative port 2
  - `http://localhost:5176` - Alternative port 3
- **Methods:** GET, POST, PUT, DELETE, OPTIONS
- **Credentials:** Enabled
- **Security Note:** This is development configuration - hardcoded localhost domains. Should be environment-based in production.

### API Blueprints & Routes Registered
**File:** [backend/app.py](backend/app.py#L55-L95)

| Blueprint | Prefix | File | Purpose |
|-----------|--------|------|---------|
| `user_bp` | `/api/user` | routes/user_routes.py | User authentication & profile |
| `society_profile_bp` | `/api/society-profile` | routes/society_profile_routes.py | Society management |
| `review_bp` | `/api/review` | routes/review_routes.py | Reviews system |
| `plot_bp` | `/api/plots` | routes/plot_routes.py | Plot management |
| `advertisement_bp` | `/api/advertisements` | routes/advertisement_routes.py | Advertisement management |
| `society_registration_form_bp` | `/api/society-registration-form` | routes/society_registration_form_routes.py | Society registration |
| `payment_bp` | `/api/payment` | routes/payment_routes.py | Payment processing |
| `compliance_bp` | `/api/compliance` | routes/compliance_routes.py | Compliance rules |
| `floorplan_bp` | `/api/floorplan` | routes/floorplan_routes.py | Floor plan generation |
| `subscription_bp` | `/api/subscription` | routes/subscription_routes.py | Subscriptions |
| `template_bp` | `/api/template` | routes/template_routes.py | Templates |
| `approval_request_bp` | `/api/approval-request` | routes/approval_request_routes.py | Approval requests |

---

## Frontend API Configuration

### API Base URL Hardcoding Issue ⚠️

The frontend has **multiple files with hardcoded API URLs**. This is a critical issue for deployment.

#### Files with Hardcoded `http://localhost:5000/api`

| File | Lines | Variable | Fallback |
|------|-------|----------|----------|
| [frontend/src/services/baseApiService.js](frontend/src/services/baseApiService.js#L4) | 4 | `export const API_URL = "http://localhost:5000/api";` | None (hardcoded) |
| [frontend/src/services/authService.js](frontend/src/services/authService.js#L1) | - | Imports `API_URL` from baseApiService | Uses baseApiService |
| [frontend/src/services/advertisementAPI.js](frontend/src/services/advertisementAPI.js#L4) | 4 | `const API_BASE_URL = 'http://localhost:5000/api';` | None (hardcoded) |
| [frontend/src/services/advertisementPlanAPI.js](frontend/src/services/advertisementPlanAPI.js#L2) | 2 | `const API_BASE_URL = 'http://localhost:5000/api';` | None (hardcoded) |
| [frontend/src/services/floorplanAPI.js](frontend/src/services/floorplanAPI.js#L1) | 1 | `const API_BASE_URL = 'http://localhost:5000/api';` | None (hardcoded) |
| [frontend/src/services/paymentAPI.js](frontend/src/services/paymentAPI.js#L2) | 2 | `const API_BASE_URL = 'http://localhost:5000/api';` | None (hardcoded) |
| [frontend/src/services/reviewAPI.js](frontend/src/services/reviewAPI.js#L4) | 4 | `const API_BASE_URL = 'http://localhost:5000/api';` | None (hardcoded) |

#### Files with Vite Environment Variable Support (Recommended Pattern)

| File | Lines | Configuration | Fallback |
|------|-------|---|---|
| [frontend/src/services/complianceAPI.js](frontend/src/services/complianceAPI.js#L3) | 3 | `const API_URL = import.meta.env.VITE_API_URL \|\| 'http://localhost:5000/api';` | Fallback: localhost |
| [frontend/src/pages/FloorPlanGeneration/FloorPlanGenerator.jsx](frontend/src/pages/FloorPlanGeneration/FloorPlanGenerator.jsx#L8) | 8 | `const API_URL = import.meta.env.VITE_API_URL \|\| 'http://localhost:5000/api';` | Fallback: localhost |
| [frontend/src/pages/user/PlotDetail.jsx](frontend/src/pages/user/PlotDetail.jsx#L11) | 11 | `const API_URL = import.meta.env.VITE_API_URL \|\| 'http://localhost:5000/api';` | Fallback: localhost |
| [frontend/src/components/user/TemplateGallery.jsx](frontend/src/components/user/TemplateGallery.jsx#L6) | 6 | `const API_URL = import.meta.env.VITE_API_URL \|\| 'http://localhost:5000/api';` | Fallback: localhost |
| [frontend/src/components/subadmin/ComplianceManagement.jsx](frontend/src/components/subadmin/ComplianceManagement.jsx#L15) | 15 | `const API_URL = import.meta.env.VITE_API_URL \|\| 'http://localhost:5000/api';` | Fallback: localhost |
| [frontend/src/pages/subadmin/FloorPlanManager.jsx](frontend/src/pages/subadmin/FloorPlanManager.jsx#L11) | 11 | `const API_URL = import.meta.env.VITE_API_URL \|\| 'http://localhost:5000/api';` | Fallback: localhost |

#### Environment Variables (Frontend)
**File:** [frontend/src/components/auth/GoogleOAuthProvider.jsx](frontend/src/components/auth/GoogleOAuthProvider.jsx#L5)  
**Line:** 5
```javascript
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id-here";
```
- Uses Vite environment variable `VITE_GOOGLE_CLIENT_ID`
- Fallback placeholder: "your-google-client-id-here"

### Vite Configuration
**File:** [frontend/vite.config.js](frontend/vite.config.js)

```javascript
// Lines 11-17: Proxy configuration
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```
- **Development Proxy:** Routes `/api/*` requests to `http://127.0.0.1:5000`
- **Port:** 5000 (backend Flask server)
- **Change Origin:** Enabled
- **SSL:** Disabled (development)

---

## Database Configuration

### Primary Configuration File
**File:** [backend/utils/db.py](backend/utils/db.py#L1-10)

#### Connection Strings

| Environment | Connection String | File | Usage |
|-------------|-------------------|------|-------|
| **Production/Atlas** | `mongodb+srv://AashfaNoor:NextGenIT22-A@cluster0.otiywgx.mongodb.net/?retryWrites=true&w=majority` | db.py Line 3 | MongoDB Atlas cloud |
| **Local Development** | `mongodb://localhost:27017/` | db.py Line 6 | Local MongoDB |

#### Database Configuration Details
```python
# db.py - Lines 3-6
MONGO_URI = "mongodb+srv://AashfaNoor:NextGenIT22-A@cluster0.otiywgx.mongodb.net/?retryWrites=true&w=majority"
LOCAL_MONGO_URI = "mongodb://localhost:27017/"

# Connection pooling (Lines 35-45)
maxPoolSize=50          # Maximum connections in pool
minPoolSize=10          # Minimum connections to maintain
retryWrites=True
retryReads=True
serverSelectionTimeoutMS=30000
connectTimeoutMS=30000
socketTimeoutMS=30000
```

### Connection Fallback Priority
1. **Try MongoDB Atlas first** (production)
2. **Fall back to Local MongoDB** if Atlas unavailable

### Secondary Migration Files

#### Migration: Local → Atlas
**File:** [backend/migrate_to_atlas.py](backend/migrate_to_atlas.py#L1-20)
- Line 7: `ATLAS_MONGO_URI = "mongodb+srv://AashfaNoor:NextGenIT22-A@cluster0.otiywgx.mongodb.net/?retryWrites=true&w=majority"`
- Line 8: `LOCAL_MONGO_URI = "mongodb://localhost:27017/"`
- Database: `NextGenArchitect`

#### Migration: Atlas → Local
**File:** [backend/migrate_to_local.py](backend/migrate_to_local.py#L1-20)
- Line 13: `ATLAS_URI = "mongodb+srv://AashfaNoor:NextGenIT22-A@cluster0.otiywgx.mongodb.net/?retryWrites=true&w=majority"`
- Line 14: `LOCAL_URI = "mongodb://localhost:27017/"`
- Database: `NextGenArchitect`

### Database Connection Endpoint Details
- **Host (Atlas):** cluster0.otiywgx.mongodb.net
- **Database Name:** NextGenArchitect
- **Credentials:** Username `AashfaNoor` (exposed in code ⚠️)
- **Port (Local):** 27017

---

## CORS Configuration

### Backend CORS Policy
**File:** [backend/app.py](backend/app.py#L20-30)

**Current Settings (Development):**
```python
CORS(app, 
     origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"], 
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type", "Authorization"])
```

| Setting | Value | Notes |
|---------|-------|-------|
| **Allowed Origins** | 4 localhost ports | Dev only - hardcoded |
| **Credentials** | Enabled | Allows cookies/auth headers |
| **Methods** | GET, POST, PUT, DELETE, OPTIONS | Full CRUD support |
| **Custom Headers** | Content-Type, Authorization | Standard REST headers |
| **SSL/Cookies** | `JWT_COOKIE_SECURE = False` | Dev only - should be True in prod |

### Flask-CORS Package
**File:** [backend/requirements.txt](backend/requirements.txt#L19)
- `flask-cors==6.0.2`

---

## Environment Variables

### Backend Environment Variables

#### Requirements
- **GEMINI_API_KEY** - Required for AI floor plan generation
  - Source: [backend/ai/genai_client.py](backend/ai/genai_client.py#L20-45)
  - Can be set in:
    - .env file: `GEMINI_API_KEY=your_key`
    - Environment: `$env:GEMINI_API_KEY = "YOUR_KEY_HERE"` (PowerShell)
    - Environment: `export GEMINI_API_KEY="YOUR_KEY"` (Unix/Linux)
  - Error if missing (Line 45): RuntimeError with helpful message

#### Email Configuration (Optional)
- **SENDER_EMAIL** - Required for email service
- **SENDER_PASSWORD** - Required for email service
  - Source: [backend/utils/email_service.py](backend/utils/email_service.py#L106)
  - Missing configuration error message at lines 106 and 977

### Frontend Environment Variables

#### Vite Variables (create `.env` or `.env.production`)
```
VITE_API_URL=http://your-api-server:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

- **VITE_API_URL** - Backend API endpoint (overrides hardcoded defaults)
- **VITE_GOOGLE_CLIENT_ID** - Google OAuth client ID

### Environment Files Location
- **Backend:** `backend/.env` (should exist but may not be in repo)
- **Frontend:** `frontend/.env` or `frontend/.env.production` (Vite standard)

### Environment File Status
⚠️ **No `.env` files found in repository** - They are likely in `.gitignore`

---

## Files Requiring Updates

### Critical Issues

#### 1. Hardcoded API URLs (Production Deployment Risk)
**Priority:** HIGH

Files with hardcoded `http://localhost:5000/api`:
- [frontend/src/services/baseApiService.js](frontend/src/services/baseApiService.js#L4)
- [frontend/src/services/authService.js](frontend/src/services/authService.js#L49-337)
- [frontend/src/services/advertisementAPI.js](frontend/src/services/advertisementAPI.js#L4)
- [frontend/src/services/advertisementPlanAPI.js](frontend/src/services/advertisementPlanAPI.js#L2)
- [frontend/src/services/floorplanAPI.js](frontend/src/services/floorplanAPI.js#L1)
- [frontend/src/services/paymentAPI.js](frontend/src/services/paymentAPI.js#L2)
- [frontend/src/services/reviewAPI.js](frontend/src/services/reviewAPI.js#L4)

**Recommended Fix:**
Replace hardcoded URLs with:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

#### 2. Exposed Database Credentials
**Priority:** CRITICAL

- MongoDB Atlas username: `AashfaNoor` 
- Password in connection string visible in:
  - [backend/utils/db.py](backend/utils/db.py#L3)
  - [backend/migrate_to_atlas.py](backend/migrate_to_atlas.py#L7)
  - [backend/migrate_to_local.py](backend/migrate_to_local.py#L8)

**Recommended Fix:**
- Move to environment variables
- Rotate MongoDB credentials immediately
- Use `.env` file pattern

#### 3. Hardcoded CORS Origins
**Priority:** MEDIUM

- Localhost ports hardcoded in [backend/app.py](backend/app.py#L26)
- Production domains need to be added
- Should be environment-based

**Recommended Fix:**
```python
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174').split(',')
CORS(app, origins=CORS_ORIGINS)
```

#### 4. Email Configuration Missing
**Priority:** MEDIUM

- SENDER_EMAIL and SENDER_PASSWORD must be set in environment
- Checked in [backend/utils/email_service.py](backend/utils/email_service.py#L106-977)
- Error message provided but no fallback

### Recommended Configuration Pattern

#### Backend (.env)
```env
# Database
MONGODB_ATLAS_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
MONGODB_LOCAL_URI=mongodb://localhost:27017/

# API
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,https://yourdomain.com

# Email
SENDER_EMAIL=noreply@yourdomain.com
SENDER_PASSWORD=your_email_password

# AI
GEMINI_API_KEY=your_gemini_key

# JWT
JWT_SECRET_KEY=secret_key_here
```

#### Frontend (.env / .env.production)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# For development
# VITE_API_URL=http://localhost:5000/api
```

---

## Security Issues Summary

| Issue | Severity | Location | Impact | Status |
|-------|----------|----------|--------|--------|
| Hardcoded DB credentials | **CRITICAL** | db.py, migrate_*.py | Public visibility if repo exposed | ❌ Not Fixed |
| Hardcoded API URLs (frontend) | **HIGH** | 7 service files | Cannot change endpoints without rebuild | ⚠️ Partial (some files use env vars) |
| Hardcoded CORS origins | **MEDIUM** | app.py | Dev origins in prod | ⚠️ Development only |
| Exposed API keys needed | **MEDIUM** | Multiple files | Needs .env setup | ⚠️ Needs setup |
| Email config missing | **MEDIUM** | email_service.py | Feature won't work | ❌ Needs setup |

---

## Deployment Checklist

- [ ] Create `.env` file with all required variables
- [ ] Move MongoDB credentials to environment variables
- [ ] Update CORS origins for production domain
- [ ] Update `VITE_API_URL` to production API endpoint
- [ ] Set `JWT_COOKIE_SECURE = True` for HTTPS
- [ ] Configure email credentials (SENDER_EMAIL, SENDER_PASSWORD)
- [ ] Set up GEMINI_API_KEY for AI features
- [ ] Use production MongoDB cluster settings
- [ ] Add Google OAuth callback URLs
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up proper error logging and monitoring

---

## Connection Flow Diagram

```
Frontend (http://localhost:5173)
  ↓
  ├─ Direct API calls to http://localhost:5000
  └─ Vite proxy (/api → http://127.0.0.1:5000)
  
Backend (http://localhost:5000)
  ├─ CORS Check ✓
  ├─ Route Handler
  └─ Database Query
      ├─ Try MongoDB Atlas (Primary)
      │   └─ mongodb+srv://...cluster0.otiywgx.mongodb.net
      └─ Fallback to Local MongoDB
          └─ mongodb://localhost:27017
```

---

## Reference Links

- [MongoDB Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
