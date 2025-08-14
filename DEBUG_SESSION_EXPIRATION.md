# Debug Session Expiration Issue

## Issue Description
Session expires immediately (within 2-3 seconds) after login instead of lasting 30 minutes.

## Debugging Steps

### Step 1: Start Backend and Test JWT Configuration
1. **Start the backend:**
   ```bash
   cd backend
   python app.py
   ```

2. **Test JWT configuration:**
   Open browser and visit: `http://localhost:5000/api/jwt-test`
   
   **Expected Response:**
   ```json
   {
     "success": true,
     "message": "JWT configuration test",
     "token_created_at": "2025-01-14T09:35:00Z",
     "token_expires_at": "2025-01-14T10:05:00Z",
     "minutes_until_expiry": 30,
     "jwt_config": "0:30:00"
   }
   ```

### Step 2: Test Login and Check Backend Logs
1. **Login as society user** through frontend
2. **Check Flask console logs** for these messages:
   ```
   [LOGIN DEBUG] Creating token at: ...
   [LOGIN DEBUG] Token created: ...
   [LOGIN DEBUG] Token expires at: ...
   [LOGIN DEBUG] Time until expiry: ... seconds
   ```

### Step 3: Check Frontend Browser Console
1. **Open browser DevTools → Console**
2. **Login and check for these logs:**
   ```
   [LOGIN] Storing token: {tokenLength: ..., tokenStart: ...}
   [LOGIN] Token stored successfully: {stored: true, same: true}
   [LOGIN] Token details: {issuedAt: ..., expiresAt: ..., timeUntilExpiry: ...}
   ```

### Step 4: Check Token Validation
1. **After login, navigate to profile setup**
2. **Check console for token validation:**
   ```
   Token validation details: {
     tokenExists: true,
     currentTimeUTC: "...",
     tokenExpUTC: "...",
     secondsUntilExpiry: ...,
     minutesUntilExpiry: ...
   }
   ```

## Common Issues and Solutions

### Issue 1: JWT Configuration Not Applied
**Symptoms:** 
- `/api/jwt-test` shows short expiry or no expiry
- Backend logs show wrong expiration time

**Solution:**
- Restart Flask app completely
- Check if `timedelta(minutes=30)` import is working

### Issue 2: Time Zone Mismatch
**Symptoms:**
- Backend creates token with correct expiry
- Frontend thinks token is expired immediately
- Time difference in logs

**Solution:**
- Check system clock synchronization
- Verify UTC timestamps match

### Issue 3: Token Storage Issue
**Symptoms:**
- Token stored correctly but validation fails
- Browser storage shows corrupted token

**Solution:**
- Clear `localStorage.clear()` in browser console
- Login again with fresh session

### Issue 4: Import/Module Issue
**Symptoms:**
- Errors in backend logs about datetime or timedelta
- JWT test endpoint fails

**Solution:**
- Check Python imports in `app.py`
- Restart Flask app

## Manual Tests

### Test 1: Direct Token Test
```bash
curl http://localhost:5000/api/jwt-test
```

### Test 2: Check localStorage
In browser console after login:
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires:', new Date(payload.exp * 1000));
console.log('Current time:', new Date());
console.log('Minutes until expiry:', (payload.exp - Date.now()/1000) / 60);
```

### Test 3: API Call Test
In browser console after login:
```javascript
import { testTokenValidity } from './services/apiService';
testTokenValidity().then(console.log).catch(console.error);
```

## Expected vs Actual Behavior

### Expected:
1. Login → Token created with 30-minute expiry
2. Token stored in localStorage
3. All API calls work for 30 minutes
4. Warning at 25 minutes (optional)
5. Expiration after 30 minutes

### Actual Problem:
1. Login → Token created (check backend logs)
2. Token stored (check frontend logs)
3. **Immediate "session expired" message**

## Next Steps Based on Findings

### If JWT test shows correct 30-minute expiry:
- Issue is in frontend token validation
- Check browser console logs for time mismatch

### If JWT test shows wrong expiry:
- Backend configuration issue
- Check Flask restart and imports

### If times don't match between frontend/backend:
- System clock synchronization issue
- Time zone handling problem

### If logs show token corruption:
- Browser storage issue
- Clear localStorage and retry

## Quick Fix Attempts

### Fix 1: Clear Everything
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then login again
```

### Fix 2: Force Restart Backend
```bash
# Kill Flask process completely
# Restart with: python app.py
```

### Fix 3: Check System Time
- Ensure system clock is correct
- Check if using VM with time sync issues

## Report Results
After following these steps, report:
1. JWT test endpoint response
2. Backend login logs
3. Frontend console logs
4. Time comparisons
5. Any error messages

This will help identify the exact cause of the immediate session expiration.
