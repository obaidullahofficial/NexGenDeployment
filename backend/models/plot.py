from datetime import datetime
from bson import ObjectId

class Plot:
    """
    Represents a plot document in the database.
    """
    def __init__(self, plot_number, societyId, price, status='Available', type='Residential Plot',
                 area='', marla_size='', dimension_x=0, dimension_y=0, description=None,
                 image=None, plot_id=None, pdf_template=None, json_template=None, 
                 saved_floorplan_id=None, saved_floorplan_name=None, created_at=None, updated_at=None):

        self.plot_id = plot_id
        self.plot_number = plot_number
        self.societyId = societyId
        self.image = image
        self.price = price
        self.status = status
        self.type = type
        self.area = area
        self.marla_size = marla_size
        self.dimension_x = dimension_x
        self.dimension_y = dimension_y
        self.description = description or []
        self.pdf_template = pdf_template
        self.json_template = json_template
        self.saved_floorplan_id = saved_floorplan_id
        self.saved_floorplan_name = saved_floorplan_name
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self):
        return {
            "plot_id": self.plot_id,
            "plot_number": self.plot_number,
            "societyId": self.societyId,
            "image": self.image,
            "price": self.price,
            "status": self.status,
            "type": self.type,
            "area": self.area,
            "marla_size": self.marla_size,
            "dimension_x": self.dimension_x,
            "dimension_y": self.dimension_y,
            "description": self.description,
            "pdf_template": self.pdf_template,
            "json_template": self.json_template,
            "saved_floorplan_id": self.saved_floorplan_id,
            "saved_floorplan_name": self.saved_floorplan_name,
        }
        
    def validate(self):
        """Validate plot data"""
        required_fields = [
            self.plot_number, self.societyId, self.price,
            self.status, self.type, self.area
        ]
        
        # Check if all required fields have values
        return all(field and str(field).strip() for field in required_fields)


def plot_collection(db):
    return db['plots']
