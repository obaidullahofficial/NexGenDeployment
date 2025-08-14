# Debugging Guide: Session Expiration and 422 Errors

## Issues Fixed:

### 1. **JWT Token Configuration** ✅
- Set `JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)` for 30-minute sessions
- Added JWT decode leeway for better token validation
- Added proper JWT error handlers

### 2. **Enhanced Token Validation** ✅
- Added token format validation in frontend
- Improved error handling for invalid tokens
- Better logging for debugging

### 3. **Backend Debugging** ✅
- Added extensive logging to society profile endpoint
- Created simple test endpoint for JWT validation
- Better error reporting

## Testing Steps:

### Step 1: Start the Backend
```bash
cd backend
python app.py
```

### Step 2: Test Token Validity
Open browser console and run:
```javascript
// Import the test function in your frontend
import { testTokenValidity } from './services/apiService';

// Test if token is working
testTokenValidity()
  .then(result => console.log('Token test success:', result))
  .catch(error => console.log('Token test failed:', error));
```

### Step 3: Debug Profile Update
If you're still getting 422 errors:
1. Check the browser console for token validation logs
2. Check the Flask backend console for JWT debugging info
3. Look for these specific log messages:
   - `[JWT DEBUG] Request headers:`
   - `[JWT DEBUG] Authorization header:`
   - `[JWT DEBUG] JWT identity:`

### Common Issues and Solutions:

#### Issue: "Token has expired" or "Invalid token"
**Solution:** Log in again - the token might be corrupted or invalid

#### Issue: 422 Unprocessable Entity
**Possible causes:**
1. **JWT token format issue** - Check if token has proper JWT format (3 parts separated by dots)
2. **Missing Authorization header** - Ensure `Bearer ${token}` format is correct
3. **Token payload corruption** - Clear localStorage and log in again

#### Issue: Session expires immediately after login
**Solution:** Check if multiple browser tabs are interfering with token storage

### Manual Tests:

#### Test 1: Login and Check Token
1. Log in as society user
2. Open browser DevTools > Application > Local Storage
3. Verify 'token' exists and is a valid JWT (has 3 parts: `header.payload.signature`)

#### Test 2: Test Simple API Call
1. After login, try the simple test endpoint:
```bash
# POST to http://localhost:5000/api/society-profile/simple-test
# Headers: Authorization: Bearer YOUR_TOKEN_HERE
# Body: {"test": "data"}
```

#### Test 3: Check Backend Logs
When you submit the profile form, check the Flask console for:
- JWT debugging information
- Any error messages
- Database operation results

### If Still Getting Errors:

1. **Clear everything:**
   ```javascript
   localStorage.clear();
   // Then log in again
   ```

2. **Check network tab** in browser DevTools for the exact request/response

3. **Enable more debugging** by adding this to your login component:
   ```javascript
   console.log('Login result:', result);
   console.log('Token stored:', localStorage.getItem('token'));
   ```

### Expected Behavior After Fixes:

1. ✅ Login should work without immediate expiration
2. ✅ Profile form should submit without 422 errors  
3. ✅ Sessions should persist across page refreshes
4. ✅ Clear error messages when authentication fails

The main improvements ensure that:
- Tokens don't expire during testing
- Better token format validation
- Comprehensive error logging for debugging
- Graceful handling of authentication failures
