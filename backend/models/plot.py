# Plot Model Example
def plot_collection(db):
    return db['plots']

# Example plot schema (for reference, not enforced by MongoDB)
plot_schema = {
    'plot_id': str,  # Plot ID
    'plot_number': str,  # Unique plot number within a society
    'societyId': str,  # Society ID
    'image': str,  # Image URL or path
    'price': str,  # e.g., 'PKR 50 Lakh'
    'status': str,  # 'Available' or 'Sold'
    'type': str,  # e.g., 'Residential Plot'
    'area': str,  # e.g., '10 Marla'
    'dimension_x': int,  # e.g., 50 (ft)
    'dimension_y': int,  # e.g., 90 (ft)
    'location': str,  # e.g., 'Bahria Town, Islamabad'
    'description': list,  # List of description strings
    'seller': dict,  # { name, phone}
    'amenities': list,  # List of amenities
}
