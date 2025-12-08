# Compliance System Documentation

## Overview
The compliance system allows sub-admins to set Pakistan building regulations for different plot sizes (5 marla, 7 marla, 10 marla, etc.). When users generate floor plans, these compliance rules are automatically applied.

## Features

### For Sub-Admins:
1. **Create Compliance Rules** - Set regulations for each plot size in their society
2. **Edit Compliance Rules** - Update existing regulations
3. **Delete Compliance Rules** - Remove outdated rules
4. **View All Compliances** - See all rules at a glance

### For Users:
- **Automatic Application** - Compliance rules are automatically applied when generating floor plans
- **Compliance Display** - See applicable rules in the floor plan generation response

## API Endpoints

### 1. Create Compliance (Sub-admin only)
```http
POST /api/compliance/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "marla_size": "5 Marla",
  "max_ground_coverage": 60,
  "max_floors": 2,
  "front_setback": 10,
  "rear_setback": 10,
  "side_setback_left": 5,
  "side_setback_right": 5,
  "min_room_height": 10,
  "min_bathroom_size": 36,
  "min_kitchen_size": 100,
  "min_bedroom_size": 100,
  "parking_spaces_required": 1,
  "min_open_space": 20,
  "max_building_height": 30,
  "staircase_width_min": 4,
  "corridor_width_min": 4,
  "building_type_allowed": "Residential",
  "additional_rules": ["Must have ventilation", "Fire safety required"],
  "notes": "Pakistan Building Code 2021"
}
```

### 2. Get Society Compliances
```http
GET /api/compliance/society/{society_id}
```

### 3. Get Compliance by Plot Size
```http
GET /api/compliance/society/{society_id}/marla/{marla_size}
```

### 4. Get Compliance for Plot (Floor Plan Generation)
```http
GET /api/compliance/plot/{plot_id}
```

### 5. Update Compliance (Sub-admin only)
```http
PUT /api/compliance/update/{compliance_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "max_ground_coverage": 65,
  "notes": "Updated regulations"
}
```

### 6. Delete Compliance (Sub-admin only)
```http
DELETE /api/compliance/delete/{compliance_id}
Authorization: Bearer {token}
```

## Database Schema

```javascript
{
  _id: ObjectId,
  society_id: ObjectId,
  marla_size: String,  // "5 Marla", "7 Marla", "10 Marla", etc.
  
  // Building regulations
  max_ground_coverage: Number,  // Percentage (0-100)
  max_floors: Number,
  front_setback: Number,  // feet
  rear_setback: Number,  // feet
  side_setback_left: Number,  // feet
  side_setback_right: Number,  // feet
  
  // Room requirements
  min_room_height: Number,  // feet
  min_bathroom_size: Number,  // sq ft
  min_kitchen_size: Number,  // sq ft
  min_bedroom_size: Number,  // sq ft
  
  // Parking and open space
  parking_spaces_required: Number,
  min_open_space: Number,  // Percentage
  
  // Building specifications
  max_building_height: Number,  // feet
  staircase_width_min: Number,  // feet
  corridor_width_min: Number,  // feet
  
  // Additional rules
  additional_rules: [String],
  building_type_allowed: String,  // "Residential" | "Commercial" | "Mixed"
  
  // Metadata
  created_by: ObjectId,  // Sub-admin user_id
  is_active: Boolean,
  created_at: Date,
  updated_at: Date,
  notes: String
}
```

## Frontend Usage

### Sub-Admin Component
Add to your sub-admin routes:

```javascript
import ComplianceManagement from '../components/subadmin/ComplianceManagement';

// In your SubAdminLayout or router:
<Route path="/compliance" element={<ComplianceManagement />} />
```

### Floor Plan Generation
Compliance rules are automatically fetched when you include `plot_id` in the request:

```javascript
import { generateFloorPlan } from '../services/floorplanAPI';

const response = await generateFloorPlan({
  plot_id: "plot_id_here",  // Include this to auto-apply compliance
  width: 1000,
  height: 1000,
  connects: [...],
  // ... other parameters
});

// Response includes compliance data:
{
  success: true,
  data: {...},
  floor_plans: [...],
  room_data: [...],
  compliance: {
    marla_size: "5 Marla",
    max_ground_coverage: 60,
    max_floors: 2,
    // ... all compliance rules
  },
  message: "Generated 4 floor plan variations (Compliance rules applied for 5 Marla plot)"
}
```

## Pakistan Building Code Reference

Common regulations by plot size:

### 5 Marla (125 sq yards / 1,125 sq ft)
- Ground Coverage: 60%
- Max Floors: 2
- Front Setback: 10 ft
- Rear Setback: 10 ft
- Side Setbacks: 5 ft each

### 7 Marla (175 sq yards / 1,575 sq ft)
- Ground Coverage: 60%
- Max Floors: 2-3
- Front Setback: 12 ft
- Rear Setback: 10 ft
- Side Setbacks: 5 ft each

### 10 Marla (250 sq yards / 2,250 sq ft)
- Ground Coverage: 60%
- Max Floors: 3
- Front Setback: 15 ft
- Rear Setback: 10 ft
- Side Setbacks: 5 ft each

### 1 Kanal (500 sq yards / 4,500 sq ft)
- Ground Coverage: 60%
- Max Floors: 3-4
- Front Setback: 20 ft
- Rear Setback: 15 ft
- Side Setbacks: 10 ft each

## Migration

Run this if you already have the backend running:

```bash
# Backend will auto-register the routes on restart
# No migration needed - this is a new feature!
```

## Testing

1. **As Sub-Admin:**
   - Login as sub-admin
   - Navigate to Compliance Management
   - Create compliance rules for "5 Marla", "7 Marla", "10 Marla"
   - Edit and verify changes

2. **As User:**
   - Select a plot with marla_size
   - Generate floor plan
   - Check response for compliance data
   - Verify rules are displayed

## Notes

- Compliance rules are society-specific (different societies can have different rules)
- Only sub-admins can create/edit/delete compliance rules
- Compliance is automatically applied during floor plan generation if `plot_id` is provided
- Soft delete: Rules are marked `is_active: false` instead of being permanently deleted
- One compliance rule per society per marla_size (prevents duplicates)

## Future Enhancements

- [ ] Compliance validation in AI generation (enforce rules in generated plans)
- [ ] Compliance reports (show how generated plan meets regulations)
- [ ] Visual compliance overlay on floor plan
- [ ] Export compliance as PDF
- [ ] Import compliance from templates
