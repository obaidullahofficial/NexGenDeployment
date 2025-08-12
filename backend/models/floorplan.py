# Floor Plan Model Example
def floorplan_collection(db):
    return db['floorplans']

# Example floorplan schema (for reference)
floorplan_schema = {
    'plot_id': str,
    'user_id': str,
    'constraints': dict,
    'rooms': list,
    'project_name': str,
    'created_at': None,
}
