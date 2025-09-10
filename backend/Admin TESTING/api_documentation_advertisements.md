# Advertisement API Documentation

## Overview
Complete REST API for managing property advertisements in the NextGenArchitect platform. Supports CRUD operations, search, filtering, analytics, and featured listings.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Advertisement Data Schema

### Advertisement Object
```json
{
  "_id": "string",
  "society_name": "string",
  "location": "string", 
  "plot_sizes": ["5 Marla", "10 Marla", "1 Kanal"],
  "price_start": 5000000,
  "price_end": 10000000,
  "contact_number": "string",
  "description": "string",
  "facilities": "string",
  "status": "active|inactive|pending|expired",
  "is_featured": false,
  "installments_available": true,
  "possession_status": "ready|under_construction|planning",
  "created_by": "user@example.com",
  "view_count": 0,
  "contact_count": 0,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Valid Plot Sizes
- "5 Marla"
- "10 Marla" 
- "1 Kanal"
- "2 Kanal"
- "5 Kanal"
- "1 Acre"

### Valid Statuses
- "active" - Advertisement is live and visible
- "inactive" - Advertisement is hidden but not deleted
- "pending" - Waiting for approval
- "expired" - Advertisement has expired

## API Endpoints

### 1. Create Advertisement
**POST** `/advertisements`

**Authentication:** Required

**Request Body:**
```json
{
  "society_name": "Green Valley Society",
  "location": "Near XYZ Landmark, Main Road, Lahore", 
  "plot_sizes": ["5 Marla", "10 Marla"],
  "price_start": 5000000,
  "price_end": 8000000,
  "contact_number": "+92-300-1234567",
  "description": "Beautiful residential plots in prime location",
  "facilities": "Gated community, electricity, gas, water, parks, schools & 24/7 security",
  "installments_available": true,
  "possession_status": "ready"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "advertisement_id",
    "society_name": "Green Valley Society",
    "location": "Near XYZ Landmark, Main Road, Lahore",
    "plot_sizes": ["5 Marla", "10 Marla"],
    "price_start": 5000000,
    "price_end": 8000000,
    "contact_number": "+92-300-1234567",
    "description": "Beautiful residential plots in prime location",
    "facilities": "Gated community, electricity, gas, water, parks, schools & 24/7 security",
    "status": "active",
    "is_featured": false,
    "installments_available": true,
    "possession_status": "ready",
    "created_by": "user@example.com",
    "view_count": 0,
    "contact_count": 0,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  },
  "message": "Advertisement created successfully"
}
```

### 2. Get All Advertisements
**GET** `/advertisements`

**Authentication:** Not required

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `per_page` (int, default: 10, max: 100) - Items per page
- `sort_by` (string, default: "created_at") - Sort field
- `sort_order` (string, default: "desc") - Sort order (asc/desc)
- `status` (string) - Filter by status
- `society_name` (string) - Filter by society name (partial match)
- `location` (string) - Filter by location (partial match)
- `is_featured` (boolean) - Filter by featured status
- `min_price` (number) - Minimum price filter
- `max_price` (number) - Maximum price filter
- `plot_sizes` (string) - Comma-separated plot sizes

**Example:** `/advertisements?page=1&per_page=5&status=active&is_featured=true`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "advertisement_id",
      "society_name": "Green Valley Society",
      // ... full advertisement object
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total_pages": 5,
    "total_count": 50
  },
  "message": "Advertisements fetched successfully"
}
```

### 3. Get Advertisement by ID
**GET** `/advertisements/{advertisement_id}`

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "advertisement_id",
    "society_name": "Green Valley Society",
    // ... full advertisement object
  },
  "message": "Advertisement fetched successfully"
}
```

### 4. Update Advertisement
**PUT** `/advertisements/{advertisement_id}`

**Authentication:** Required (Creator only)

**Request Body:** (All fields optional)
```json
{
  "society_name": "Updated Society Name",
  "location": "Updated Location",
  "plot_sizes": ["10 Marla", "1 Kanal"],
  "price_start": 6000000,
  "description": "Updated description",
  "facilities": "Updated facilities"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // ... updated advertisement object
  },
  "message": "Advertisement updated successfully"
}
```

### 5. Delete Advertisement
**DELETE** `/advertisements/{advertisement_id}`

**Authentication:** Required (Creator only)

**Response:**
```json
{
  "success": true,
  "message": "Advertisement deleted successfully"
}
```

### 6. Get User's Advertisements
**GET** `/users/{user_email}/advertisements`

**Authentication:** Not required

**Query Parameters:**
- `page` (int, default: 1)
- `per_page` (int, default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    // ... array of advertisements
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total_pages": 3,
    "total_count": 25
  },
  "message": "User advertisements fetched successfully"
}
```

### 7. Search Advertisements
**GET** `/advertisements/search`

**Authentication:** Not required

**Query Parameters:**
- `q` (string, required) - Search term (min 2 characters)
- `page` (int, default: 1)
- `per_page` (int, default: 10)

**Example:** `/advertisements/search?q=green&page=1`

**Response:**
```json
{
  "success": true,
  "data": [
    // ... array of matching advertisements
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total_pages": 2,
    "total_count": 15
  },
  "message": "Search results for 'green'"
}
```

### 8. Get Featured Advertisements
**GET** `/advertisements/featured`

**Authentication:** Not required

**Query Parameters:**
- `limit` (int, default: 5) - Number of featured ads to return

**Response:**
```json
{
  "success": true,
  "data": [
    // ... array of featured advertisements
  ],
  "message": "Featured advertisements fetched successfully"
}
```

### 9. Increment View Count
**POST** `/advertisements/{advertisement_id}/view`

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "View count updated"
}
```

### 10. Increment Contact Count
**POST** `/advertisements/{advertisement_id}/contact`

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "Contact count updated"
}
```

### 11. Get Advertisement Statistics
**GET** `/advertisements/stats`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "total_advertisements": 150,
    "active_advertisements": 120,
    "featured_advertisements": 25,
    "total_views": 5000,
    "total_contacts": 800
  },
  "message": "Advertisement statistics fetched successfully"
}
```

### 12. Toggle Featured Status
**PUT** `/advertisements/{advertisement_id}/featured`

**Authentication:** Required

**Request Body:**
```json
{
  "is_featured": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // ... updated advertisement object
  },
  "message": "Advertisement updated successfully"
}
```

### 13. Update Advertisement Status
**PUT** `/advertisements/{advertisement_id}/status`

**Authentication:** Required

**Request Body:**
```json
{
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // ... updated advertisement object
  },
  "message": "Advertisement updated successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authorization token is required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Advertisement not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error: detailed error message"
}
```

## Usage Examples

### Frontend Integration Example (JavaScript)

```javascript
// Create advertisement
const createAdvertisement = async (adData) => {
  const response = await fetch('http://localhost:5000/api/advertisements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(adData)
  });
  
  return response.json();
};

// Get all advertisements with filters
const getAdvertisements = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:5000/api/advertisements?${queryParams}`);
  
  return response.json();
};

// Search advertisements
const searchAdvertisements = async (searchTerm) => {
  const response = await fetch(`http://localhost:5000/api/advertisements/search?q=${encodeURIComponent(searchTerm)}`);
  
  return response.json();
};
```

### Advertisement Template Generator

Use this data structure to create advertisements like the example you provided:

```json
{
  "society_name": "Green Valley Residencia",
  "location": "Near DHA Phase 5, Main Boulevard, Lahore",
  "plot_sizes": ["5 Marla", "10 Marla", "1 Kanal"],
  "price_start": 2500000,
  "price_end": 12000000,
  "contact_number": "+92-300-1234567",
  "description": "🏡 Green Valley Residencia – Residential Plots for Sale\nPrime location with excellent connectivity and modern amenities.",
  "facilities": "Gated community, electricity, gas, water, parks, schools & 24/7 security",
  "installments_available": true,
  "possession_status": "ready",
  "status": "active",
  "is_featured": true
}
```

This will generate an advertisement that matches your template format when displayed on the frontend.

## Database Collections

The API uses MongoDB with the following collection:
- **advertisements** - Stores all advertisement data with indexes on:
  - `created_by` - For user-specific queries
  - `status` - For filtering active/inactive ads
  - `is_featured` - For featured advertisement queries
  - `created_at` - For sorting by date
  - Text indexes on `society_name`, `location`, `description`, `facilities` for search
