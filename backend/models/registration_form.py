class RegistrationForm:
    def __init__(self, name, type, regNo, established, authority, contact, website, plots):
        self.name = name
        self.type = type
        self.regNo = regNo
        self.established = established
        self.authority = authority
        self.contact = contact
        self.website = website
        self.plots = plots

    def to_dict(self):
        return {
            "name": self.name,
            "type": self.type,
            "regNo": self.regNo,
            "established": self.established,
            "authority": self.authority,
            "contact": self.contact,
            "website": self.website,
            "plots": self.plots
        }

def registration_form_collection(db):
    return db['registration_forms']