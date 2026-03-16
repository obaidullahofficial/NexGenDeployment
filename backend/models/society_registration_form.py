class SocietyRegistrationForm:
    def __init__(self, name, type, regNo, established, authority, contact, website, city, 
                 noc_issued=False, status="pending", user_id=None, land_acquisition_status=None, 
                 procurement_status=None, noc_document=None, user_email=None):
        self.name = name
        self.type = type
        self.regNo = regNo
        self.established = established
        self.authority = authority
        self.contact = contact
        self.website = website
        self.city = city
        self.noc_issued = noc_issued
        self.status = status
        self.user_id = user_id  # ID of the user who owns this society
        self.user_email = user_email
        self.land_acquisition_status = land_acquisition_status
        self.procurement_status = procurement_status
        self.noc_document = noc_document

    def to_dict(self):
        return {
            "name": self.name,
            "type": self.type,
            "regNo": self.regNo,
            "established": self.established,
            "authority": self.authority,
            "contact": self.contact,
            "website": self.website,
            "city": self.city,
            "noc_issued": self.noc_issued,
            "status": self.status,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "land_acquisition_status": self.land_acquisition_status,
            "procurement_status": self.procurement_status,
            "noc_document": self.noc_document
        }


def society_registration_form_collection(db):
    return db['society_registration_forms']