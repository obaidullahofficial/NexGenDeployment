"""Quick test to verify plot endpoint and data structure"""
from utils.db import get_db
from bson import ObjectId

def test_plot_endpoint():
    db = get_db()
    plots = db['plots']
    
    # Get a sample plot
    sample_plot = plots.find_one()
    if sample_plot:
        print("✅ Sample plot found:")
        print(f"   _id: {sample_plot.get('_id')}")
        print(f"   plot_number: {sample_plot.get('plot_number')}")
        print(f"   price: {sample_plot.get('price')}")
        print(f"   marla_size: {sample_plot.get('marla_size')}")
        print(f"   dimension_x: {sample_plot.get('dimension_x')}")
        print(f"   dimension_y: {sample_plot.get('dimension_y')}")
        print(f"   status: {sample_plot.get('status')}")
        print(f"   type: {sample_plot.get('type')}")
        print(f"   description: {sample_plot.get('description')}")
        print(f"   societyId: {sample_plot.get('societyId')}")
        
        # Test fetching by ID
        plot_id = str(sample_plot['_id'])
        print(f"\n🔍 Testing fetch by ID: {plot_id}")
        fetched_plot = plots.find_one({'_id': ObjectId(plot_id)})
        if fetched_plot:
            print("✅ Successfully fetched plot by ID")
        else:
            print("❌ Could not fetch plot by ID")
    else:
        print("❌ No plots found in database")
    
    # Count total plots
    total_plots = plots.count_documents({})
    print(f"\n📊 Total plots in database: {total_plots}")
    
    # Show a few plot IDs
    print("\n📋 Sample plot IDs:")
    for plot in plots.find().limit(5):
        print(f"   {plot['_id']} - Plot {plot.get('plot_number', 'N/A')}")

if __name__ == '__main__':
    test_plot_endpoint()
