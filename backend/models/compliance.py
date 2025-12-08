from datetime import datetime
from bson import ObjectId

class Compliance:
    """
    Compliance model for storing Pakistan building regulations based on plot size.
    Sub-admins can set compliance rules for their society's plots.
    """
    
    def __init__(self, society_id, marla_size, **kwargs):
        self.society_id = ObjectId(society_id) if isinstance(society_id, str) else society_id
        self.marla_size = marla_size  # e.g., "5 Marla", "7 Marla", "10 Marla"
        
        # Building regulations (Pakistan Building Code)
        self.max_ground_coverage = kwargs.get('max_ground_coverage', 0)  # Percentage (e.g., 60%)
        self.max_floors = kwargs.get('max_floors', 0)  # Number of floors allowed
        self.front_setback = kwargs.get('front_setback', 0)  # feet
        self.rear_setback = kwargs.get('rear_setback', 0)  # feet
        self.side_setback_left = kwargs.get('side_setback_left', 0)  # feet
        self.side_setback_right = kwargs.get('side_setback_right', 0)  # feet
        
        # Room requirements
        self.min_room_height = kwargs.get('min_room_height', 10)  # feet
        self.min_bathroom_size = kwargs.get('min_bathroom_size', 0)  # sq ft
        self.min_kitchen_size = kwargs.get('min_kitchen_size', 0)  # sq ft
        self.min_bedroom_size = kwargs.get('min_bedroom_size', 0)  # sq ft
        
        # Parking and open space
        self.parking_spaces_required = kwargs.get('parking_spaces_required', 1)
        self.min_open_space = kwargs.get('min_open_space', 0)  # Percentage
        
        # Building specifications
        self.max_building_height = kwargs.get('max_building_height', 0)  # feet
        self.staircase_width_min = kwargs.get('staircase_width_min', 4)  # feet
        self.corridor_width_min = kwargs.get('corridor_width_min', 4)  # feet
        
        # Additional rules (specific to Pakistan/society)
        self.additional_rules = kwargs.get('additional_rules', [])  # Array of text rules
        self.building_type_allowed = kwargs.get('building_type_allowed', 'Residential')  # Residential/Commercial/Mixed
        
        # Metadata
        self.created_by = kwargs.get('created_by')  # Sub-admin user_id
        self.is_active = kwargs.get('is_active', True)
        self.created_at = kwargs.get('created_at', datetime.utcnow())
        self.updated_at = kwargs.get('updated_at', datetime.utcnow())
        
        # Notes/Description
        self.notes = kwargs.get('notes', '')
    
    def to_dict(self):
        """Convert compliance to dictionary for MongoDB storage"""
        return {
            'society_id': self.society_id,
            'marla_size': self.marla_size,
            'max_ground_coverage': self.max_ground_coverage,
            'max_floors': self.max_floors,
            'front_setback': self.front_setback,
            'rear_setback': self.rear_setback,
            'side_setback_left': self.side_setback_left,
            'side_setback_right': self.side_setback_right,
            'min_room_height': self.min_room_height,
            'min_bathroom_size': self.min_bathroom_size,
            'min_kitchen_size': self.min_kitchen_size,
            'min_bedroom_size': self.min_bedroom_size,
            'parking_spaces_required': self.parking_spaces_required,
            'min_open_space': self.min_open_space,
            'max_building_height': self.max_building_height,
            'staircase_width_min': self.staircase_width_min,
            'corridor_width_min': self.corridor_width_min,
            'additional_rules': self.additional_rules,
            'building_type_allowed': self.building_type_allowed,
            'created_by': self.created_by,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            'updated_at': self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at,
            'notes': self.notes
        }
    
    def validate(self):
        """Validate compliance data"""
        if not self.society_id or not self.marla_size:
            return False, "Society ID and Marla Size are required"
        
        if self.max_ground_coverage < 0 or self.max_ground_coverage > 100:
            return False, "Ground coverage must be between 0-100%"
        
        if self.max_floors < 0:
            return False, "Maximum floors must be a positive number"
        
        return True, "Valid"

def compliance_collection(db):
    """Get the compliance collection"""
    return db['compliances']
