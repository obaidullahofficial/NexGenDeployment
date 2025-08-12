# Society Model Example
def society_collection(db):
    return db['societies']

# Example society schema (for reference)
society_schema = {
    'name': str,
    'description': str,
    'location': str,
    'available_plots': int,
    'image': str,
    'rating': float,
    'created_at': None,
}
