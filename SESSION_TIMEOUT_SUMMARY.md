# Session Timeout Configuration Summary

## ✅ **Changes Made:**

### **1. Backend JWT Configuration** (`backend/app.py`)
- **Set 30-minute session timeout**: `JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)`
- **Added decode leeway**: `JWT_DECODE_LEEWAY = 30` seconds for token validation
- **Enhanced CORS**: Added `supports_credentials=True`
- **Added JWT error handlers** for expired, invalid, and missing tokens

### **2. Frontend Token Validation** (`frontend/src/services/apiService.js`)
- **Enhanced `getValidToken()` function**:
  - Validates JWT format (3 parts separated by dots)
  - Checks token expiration client-side
  - Logs detailed token information for debugging
  - Automatically clears expired tokens
- **Added session utilities**:
  - `getSessionTimeRemaining()` - Returns minutes remaining
  - `isSessionExpiringSoon()` - Checks if < 5 minutes left
  - `testTokenValidity()` - Tests token with backend

### **3. Session Timer Component** (`frontend/src/components/common/SessionTimer.jsx`)
- **Optional session warning** when < 5 minutes remaining
- **Optional timer display** showing remaining time
- **Automatic updates** every minute
- **Easy integration** into any component

### **4. Enhanced Debugging** (`backend/routes/society_profile_routes.py`)
- **JWT debugging logs** showing headers and token info
- **Simple test endpoint** for token validation
- **Better error reporting** with detailed stack traces

## 🕐 **Session Behavior:**

### **Login**
- User logs in → Receives JWT token valid for **30 minutes**
- Token stored in `localStorage` with automatic validation

### **Activity**
- Each API request validates token server-side
- Client-side validation prevents unnecessary requests with expired tokens
- Automatic token cleanup when expired

### **Expiration Warning**
- Warning shown when < 5 minutes remaining (optional)
- User can save work or re-authenticate
- Clear error messages guide user to log in again

### **Expiration**
- After 30 minutes, token expires
- Next API request returns 401 Unauthorized
- User automatically redirected to login

## 🧪 **Testing:**

### **Check Session Time**
```javascript
import { getSessionTimeRemaining } from './services/apiService';
console.log('Minutes remaining:', getSessionTimeRemaining());
```

### **Add Session Warning** (Optional)
```jsx
import SessionTimer from './components/common/SessionTimer';

// In your component:
<SessionTimer showWarning={true} showTimer={false} />
```

### **Debug Token**
```javascript
import { testTokenValidity } from './services/apiService';
testTokenValidity().then(console.log).catch(console.error);
```

## 📋 **Configuration Options:**

### **Adjust Session Time**
In `backend/app.py`, change:
```python
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=45)  # 45 minutes
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)     # 2 hours
```

### **Adjust Warning Time**
In `frontend/src/services/apiService.js`, change:
```javascript
export function isSessionExpiringSoon() {
  const timeRemaining = getSessionTimeRemaining();
  return timeRemaining > 0 && timeRemaining <= 10; // Warn at 10 minutes
}
```

## 🔧 **Current Settings:**

- **Session Duration**: 30 minutes
- **Warning Time**: 5 minutes before expiry
- **Decode Leeway**: 30 seconds for network delays
- **Auto-cleanup**: Expired tokens automatically removed
- **Debug Mode**: Extensive logging available

## 📱 **User Experience:**

1. **Smooth Login**: No immediate expiration issues
2. **Clear Feedback**: Users know when session will expire
3. **Automatic Handling**: Expired tokens cleaned up automatically
4. **Graceful Errors**: Clear messages guide users to re-authenticate
5. **Flexible Warnings**: Optional session timer and warnings

This configuration provides a good balance between security (30-minute timeout) and user experience (sufficient time to complete tasks).
