# NextGenArchitect Database Schema Documentation

## Overview
Complete documentation of the MongoDB database schema for NextGenArchitect property management system.

---

## 🗂️ Collections & Schema

### 1. **USERS** Collection
**Purpose:** Authentication and user management  
**Primary Key:** `_id` (MongoDB ObjectId)

```json
{
  "_id": ObjectId,
  "username": "string (unique)",
  "email": "string (unique)",
  "password_hash": "string",
  "role": "user | subadmin | admin",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Relationships:**
- One USERS → Many SOCIETY_PROFILES (owns)
- One USERS → Many USER_PROFILES (has)
- One USERS → Many FLOORPLANS (creates)
- One USERS → Many ADVERTISEMENTS (manages)
- One USERS → Many SUBSCRIPTIONS (purchases)

---

### 2. **USER_PROFILES** Collection
**Purpose:** Extended user profile information  
**Foreign Key:** `user_id` → USERS._id

```json
{
  "_id": ObjectId,
  "user_id": "string (FK)",
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "profile_picture": "string (base64 or URL)",
  "bio": "string",
  "location": "string",
  "created_at": "datetime"
}
```

**Indexes:** user_id

---

### 3. **SOCIETY_PROFILES** Collection
**Purpose:** Society/organization management  
**Primary Key:** `_id`  
**Foreign Key:** `user_id` → USERS._id

```json
{
  "_id": ObjectId,
  "user_id": "string (FK)",
  "name": "string",
  "description": "string",
  "location": "string",
  "available_plots": ["5 Marla", "10 Marla", ...],
  "price_range": "string",
  "society_logo": "string (base64 or URL)",
  "contact_number": "string",
  "contact_name": "string",
  "head_office_address": "string",
  "amenities": [
    "gatedCommunity", "security", "parks", ...
  ],
  "marla_data": {
    "marlaStandard": 272.25,
    "baseMarla": "5 Marla",
    "calculations": {
      "5 Marla": { "x": 30, "y": 50, "sqft": 1500 },
      "10 Marla": { "x": 45, "y": 60.6, "sqft": 2727 }
    },
    "available_plots": ["5 Marla", "10 Marla", ...],
    "configured_at": "datetime"
  },
  "is_complete": boolean,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Relationships:**
- One SOCIETY → Many PLOTS (contains)
- One SOCIETY → Many COMPLIANCE_RULES (defines)
- One SOCIETY → Many APPROVAL_REQUESTS (receives)

**Indexes:** user_id, status

---

### 4. **PLOTS** Collection
**Purpose:** Individual property plots  
**Primary Key:** `_id`  
**Foreign Key:** `societyId` → SOCIETY_PROFILES._id

```json
{
  "_id": ObjectId,
  "plot_number": "string",
  "societyId": "ObjectId (FK)",
  "type": "Residential | Commercial",
  "status": "Available | Sold | Reserved",
  "marla_size": "5 Marla | 10 Marla | 1 Kanal",
  "dimension_x": "float (in feet)",
  "dimension_y": "float (in feet)",
  "area": "string (e.g., '1500 sq ft')",
  "price": "string (e.g., '50 Lakh')",
  "image": "string (base64 data)",
  "description": ["Feature 1", "Feature 2", ...],
  "pdf_template": "string (base64 PDF)",
  "json_template": "string (JSON floor plan)",
  "saved_floorplan_id": "string",
  "saved_floorplan_name": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Relationships:**
- Many PLOTS ← One SOCIETY_PROFILE (contains)
- Many PLOTS → One FLOORPLAN (uses)
- One PLOT → Many EMAIL_VERIFICATIONS (has)

**Unique Index:** (societyId, plot_number)  
**Indexes:** societyId, status, marla_size

---

### 5. **FLOORPLANS** Collection
**Purpose:** AI-generated floor plan designs  
**Primary Key:** `_id`  
**Foreign Keys:** `user_id`, `society_id`

```json
{
  "_id": ObjectId,
  "user_id": "string (FK → USERS)",
  "society_id": "string (FK → SOCIETY_PROFILES)",
  "project_name": "string",
  "plot_size": "5 Marla | 10 Marla",
  "floor_plan_data": [
    {
      "type": "room | wall | door",
      "coordinates": { "x": 0, "y": 0 },
      "dimensions": { "width": 100, "height": 100 }
    }
  ],
  "room_data": [
    {
      "label": "Living Room",
      "area": 250,
      "type": "living"
    }
  ],
  "constraints": {
    "bedrooms": 3,
    "bathrooms": 2,
    "drawing_room": true
  },
  "dimensions": {
    "width": 50,
    "height": 90
  },
  "room_requirements": {
    "rooms": ["bedroom", "bathroom", ...],
    "connections": ["bedroom-bathroom", ...]
  },
  "generation_parameters": {
    "algorithm": "GeneticAlgorithm",
    "generations": 50,
    "fitness_score": 0.95
  },
  "is_favorite": boolean,
  "is_template": boolean,
  "is_approved": boolean,
  "status": "active | archived | draft",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Relationships:**
- One FLOORPLAN → One USER
- Many FLOORPLANS → One SOCIETY (for templates)
- One FLOORPLAN → One PLOT (optional)

**Indexes:** user_id, society_id, is_template, status

---

### 6. **TEMPLATES** Collection
**Purpose:** Approved floor plan templates  
**Primary Key:** `_id`  
**Foreign Keys:** `floorplan_id`, `society_id`

```json
{
  "_id": ObjectId,
  "floorplan_id": "string (FK → FLOORPLANS)",
  "template_name": "string",
  "template_description": "string",
  "plot_size": "5 Marla | 10 Marla",
  "society_id": "string (FK → SOCIETY_PROFILES)",
  "is_approved": boolean,
  "created_at": "datetime"
}
```

**Relationships:**
- One TEMPLATE → One FLOORPLAN

---

### 7. **COMPLIANCE_RULES** Collection
**Purpose:** Building regulations per society and marla size  
**Primary Key:** `_id`  
**Foreign Key:** `societyId` → SOCIETY_PROFILES._id

```json
{
  "_id": ObjectId,
  "societyId": "string (FK)",
  "marla_size": "5 Marla | 10 Marla",
  "minimum_area": 1500,
  "dimension_requirements": {
    "minX": 30,
    "maxX": 60,
    "minY": 40,
    "maxY": 80
  },
  "building_setbacks": {
    "front": 25,
    "side": 10,
    "rear": 20
  },
  "maximum_coverage": 60,
  "maximum_height": 45,
  "restrictions": [
    {
      "type": "height_restriction",
      "description": "Max height 45 feet"
    }
  ],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Relationships:**
- Many RULES ← One SOCIETY_PROFILE

**Unique Index:** (societyId, marla_size)

---

### 8. **ADVERTISEMENTS** Collection
**Purpose:** Property/society advertisements  
**Primary Key:** `_id`  
**Foreign Keys:** `user_id`, `societyId`

```json
{
  "_id": ObjectId,
  "user_id": "string (FK → USERS)",
  "societyId": "string (FK → SOCIETY_PROFILES)",
  "title": "string",
  "description": "string",
  "image_url": "string",
  "ad_url": "string (landing page URL)",
  "status": "pending | active | paused | rejected",
  "payment_status": "pending | completed | failed",
  "price": 5000,
  "impressions": 1250,
  "clicks": 45,
  "is_featured": boolean,
  "created_at": "datetime",
  "expires_at": "datetime"
}
```

**Relationships:**
- Many AD ← One USER
- Many AD ← One SOCIETY
- One AD → Many ADVERTISEMENT_PLANS

**Indexes:** user_id, societyId, status, created_at

---

### 9. **ADVERTISEMENT_PLANS** Collection
**Purpose:** Different advertising package options  
**Primary Key:** `_id`  
**Foreign Key:** `advertisement_id` → ADVERTISEMENTS._id

```json
{
  "_id": ObjectId,
  "advertisement_id": "string (FK)",
  "plan_name": "Premium",
  "price": 10000,
  "duration_days": 30,
  "features": {
    "featured_listing": true,
    "premium_placement": true,
    "daily_boost": false
  }
}
```

---

### 10. **REVIEWS** Collection
**Purpose:** User reviews for societies  
**Primary Key:** `_id`  
**Foreign Key:** `societyId` → SOCIETY_PROFILES._id

```json
{
  "_id": ObjectId,
  "societyId": "string (FK)",
  "user_email": "string",
  "rating": 4,
  "comment": "Great society with excellent facilities",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Relationships:**
- One REVIEW → One SOCIETY
- One REVIEW → One USER (by email)

**Indexes:** societyId, rating, created_at

---

### 11. **APPROVAL_REQUESTS** Collection
**Purpose:** Pending requests for approval  
**Primary Key:** `_id`  
**Foreign Keys:** `societyId`, `user_id`

```json
{
  "_id": ObjectId,
  "societyId": "string (FK)",
  "user_id": "string (FK)",
  "request_type": "plot | development | modification",
  "status": "pending | approved | rejected",
  "request_details": {
    "plot_number": "1",
    "desired_changes": "..."
  },
  "admin_notes": "Approved with conditions",
  "requested_at": "datetime",
  "reviewed_at": "datetime"
}
```

**Indexes:** societyId, user_id, status

---

### 12. **EMAIL_VERIFICATIONS** Collection
**Purpose:** Email verification tracking for plots  
**Primary Key:** `_id`  
**Foreign Key:** `plotId` → PLOTS._id

```json
{
  "_id": ObjectId,
  "plotId": "string (FK)",
  "email": "buyer@example.com",
  "verification_code": "ABC123XYZ",
  "is_verified": boolean,
  "created_at": "datetime",
  "expires_at": "datetime"
}
```

---

### 13. **SUBSCRIPTIONS** Collection
**Purpose:** User subscription management  
**Primary Key:** `_id`  
**Foreign Keys:** `user_id`, `plan_id`

```json
{
  "_id": ObjectId,
  "user_id": "string (FK → USERS)",
  "plan_id": "string (FK → SUBSCRIPTION_PLANS)",
  "status": "active | cancelled | expired",
  "start_date": "datetime",
  "end_date": "datetime",
  "created_at": "datetime"
}
```

---

### 14. **SUBSCRIPTION_PLANS** Collection
**Purpose:** Available subscription packages  
**Primary Key:** `_id`

```json
{
  "_id": ObjectId,
  "name": "Premium",
  "description": "Full access to all features",
  "price": 999,
  "duration_days": 30,
  "features": {
    "unlimited_plots": true,
    "ai_floorplans": true,
    "featured_ads": 10
  },
  "created_at": "datetime"
}
```

---

## 🔑 Key Relationships

### One-to-Many:
- USERS → SOCIETY_PROFILES (User owns societies)
- USERS → FLOORPLANS (User creates floor plans)
- SOCIETY_PROFILES → PLOTS (Society has plots)
- PLOTS → EMAIL_VERIFICATIONS (Plot has verifications)

### One-to-One:
- USERS ← → USER_PROFILES (User has one profile)
- REVIEW ← → SOCIETY_PROFILES (Review for one society)

### Many-to-Many (Indirect):
- USERS ← ADVERTISEMENTS → SOCIETY_PROFILES
- FLOORPLANS ← TEMPLATES → SOCIETY_PROFILES

---

## 📊 Data Flow Examples

### Creating a Plot:
```
1. USERS (Subadmin) 
   ↓
2. SOCIETY_PROFILES (Select society)
   ↓
3. PLOTS (Create plot with dimensions)
   ↓
4. COMPLIANCE_RULES (Check regulations)
   ↓
5. FLOORPLANS (Optional: Generate design)
```

### Advertising Property:
```
1. USERS (Create ad)
   ↓
2. ADVERTISEMENTS (Submit ad details)
   ↓
3. ADVERTISEMENT_PLANS (Choose plan)
   ↓
4. REVIEWS (Collect user feedback)
```

### Floor Plan Generation:
```
1. USERS (Request generation)
   ↓
2. FLOORPLANS (AI generates design)
   ↓
3. TEMPLATES (Save as template)
   ↓
4. COMPLIANCE_RULES (Validate against rules)
```

---

## 🔍 Important Indexes

```javascript
// USERS
db.users.createIndex({ email: 1 })
db.users.createIndex({ username: 1 })

// PLOTS
db.plots.createIndex({ societyId: 1 })
db.plots.createIndex({ status: 1 })
db.plots.createIndex({ marla_size: 1 })
db.plots.createIndex({ societyId: 1, plot_number: 1 }, { unique: true })

// COMPLIANCE_RULES
db.compliance_rules.createIndex({ societyId: 1, marla_size: 1 }, { unique: true })

// ADVERTISEMENTS
db.advertisements.createIndex({ user_id: 1 })
db.advertisements.createIndex({ societyId: 1 })
db.advertisements.createIndex({ status: 1 })

// REVIEWS
db.reviews.createIndex({ societyId: 1 })
db.reviews.createIndex({ rating: 1 })

// APPROVALS
db.approval_requests.createIndex({ societyId: 1 })
db.approval_requests.createIndex({ status: 1 })
```

---

## 📈 Database Growth Metrics

| Collection | Typical Size | Growth Rate |
|------------|-------------|-------------|
| USERS | 100KB | Slow |
| SOCIETY_PROFILES | 50KB | Slow |
| PLOTS | 50MB | Medium |
| FLOORPLANS | 100MB | High |
| ADVERTISEMENTS | 20MB | Medium |
| COMPLIANCE_RULES | 5MB | Very Slow |
| REVIEWS | 10MB | Medium |

---

## ✅ Best Practices

1. **Use ObjectId for primary keys** - Properly indexed by MongoDB
2. **Foreign keys as strings** - Store ObjectId as string for flexibility
3. **Denormalize for performance** - Store marla_data directly in society_profiles
4. **Timestamp all entities** - created_at and updated_at on every document
5. **Use composite indexes** - For queries like (societyId, plot_number)
6. **Archive old data** - Move expired ads/subscriptions to archive collection
7. **Regular backups** - MongoDB Atlas handles this automatically

---

## 🚀 Migration Notes

- Database migrated from local MongoDB to **MongoDB Atlas**
- Connection string: `mongodb+srv://AashfaNoor:NextGenIT22-A@cluster0.otiywgx.mongodb.net/`
- All documents preserved during migration
- Unique indexes enforced in Atlas

---

## 📞 Support

For schema modifications or optimization questions, refer to:
- Backend models: `/backend/models/`
- Database utilities: `/backend/utils/db.py`
- Migration script: `/backend/migrate_to_atlas.py`

Table USERS {
  _id string [pk]
  username string [unique]
  email string [unique]
  password_hash string
  role string
  created_at datetime
  updated_at datetime
}

Table USER_PROFILES {
  _id string [pk]
  user_id string [ref: > USERS._id]
  first_name string
  last_name string
  phone string
  profile_picture string
  bio text
  location string
  created_at datetime
}

Table SOCIETY_PROFILES {
  _id string [pk]
  user_id string [ref: > USERS._id]
  name string
  description text
  location string
  available_plots string[]
  price_range string
  society_logo string
  contact_number string
  contact_name string
  head_office_address string
  amenities object[]
  marla_data object
  is_complete boolean
  created_at datetime
  updated_at datetime
}

Table PLOTS {
  _id string [pk]
  plot_number string
  societyId string [ref: > SOCIETY_PROFILES._id]
  type string
  status string
  marla_size string
  dimension_x float
  dimension_y float
  area string
  price string
  image string
  description string[]
  pdf_template string
  json_template string
  saved_floorplan_id string
  created_at datetime
  updated_at datetime
}

Table FLOORPLANS {
  _id string [pk]
  user_id string [ref: > USERS._id]
  society_id string [ref: > SOCIETY_PROFILES._id]
  project_name string
  plot_size string
  floor_plan_data object
  room_data object[]
  constraints object
  dimensions object
  room_requirements object
  generation_parameters object
  is_favorite boolean
  is_template boolean
  is_approved boolean
  status string
  created_at datetime
  updated_at datetime
}

Table TEMPLATES {
  _id string [pk]
  floorplan_id string [ref: > FLOORPLANS._id]
  template_name string
  template_description text
  plot_size string
  society_id string [ref: > SOCIETY_PROFILES._id]
  is_approved boolean
  created_at datetime
}

Table COMPLIANCE_RULES {
  _id string [pk]
  societyId string [ref: > SOCIETY_PROFILES._id]
  marla_size string
  minimum_area float
  dimension_requirements object
  building_setbacks object
  maximum_coverage float
  maximum_height float
  restrictions object[]
  created_at datetime
  updated_at datetime
}

Table APPROVAL_REQUESTS {
  _id string [pk]
  societyId string [ref: > SOCIETY_PROFILES._id]
  user_id string [ref: > USERS._id]
  request_type string
  status string
  request_details object
  admin_notes text
  requested_at datetime
  reviewed_at datetime
}

Table ADVERTISEMENTS {
  _id string [pk]
  user_id string [ref: > USERS._id]
  societyId string [ref: > SOCIETY_PROFILES._id]
  title string
  description text
  image_url string
  ad_url string
  status string
  payment_status string
  price float
  impressions int
  clicks int
  is_featured boolean
  created_at datetime
  expires_at datetime
}

Table ADVERTISEMENT_PLANS {
  _id string [pk]
  advertisement_id string [ref: > ADVERTISEMENTS._id]
  plan_name string
  price float
  duration_days int
  features object
}

Table REVIEWS {
  _id string [pk]
  societyId string [ref: > SOCIETY_PROFILES._id]
  user_email string
  rating int
  comment text
  created_at datetime
  updated_at datetime
}

Table EMAIL_VERIFICATIONS {
  _id string [pk]
  plotId string [ref: > PLOTS._id]
  email string
  verification_code string
  is_verified boolean
  created_at datetime
  expires_at datetime
}

Table SUBSCRIPTIONS {
  _id string [pk]
  user_id string [ref: > USERS._id]
  plan_id string [ref: > SUBSCRIPTION_PLANS._id]
  status string
  start_date datetime
  end_date datetime
  created_at datetime
}

Table SUBSCRIPTION_PLANS {
  _id string [pk]
  name string
  description text
  price float
  duration_days int
  features object
  created_at datetime
}

