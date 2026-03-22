import os
import sys
import time
import json
from datetime import datetime

# Add backend directory to sys.path to enable importing
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app import app
from controllers.plot_controller import PlotController
from controllers.advertisement_controller import AdvertisementController

with app.app_context():
    # If the user is authenticated in normal flows, we can mock it or just call the methods since they might need user id ?
    print("Testing Plots Query Response Time...")
    start_time = time.time()
    try:
        plots_response = PlotController.get_all_plots()
        # Some controllers return a Flask response or tuple. Extract data.
        plots = plots_response[0].json if isinstance(plots_response, tuple) else plots_response.json
    except Exception as e:
        plots = str(e); print('ERROR WAS:', plots)
    end_time = time.time()
    print(f"SUCCESS: Extracted plotting in {end_time - start_time:.4f} seconds.")
    if hasattr(plots, 'keys'):
        print(f"Sample Plot Keys: {list(plots.keys())}")
    elif isinstance(plots, list) and plots:
        print(f"Sample Plot Keys: {list(plots[0].keys())}")
    
    print("\n---------------------------\n")
    
    print("Testing Active Advertisements Query Response Time...")
    start_time = time.time()
    try:
        ads_response = AdvertisementController.get_active_advertisements()
        ads = ads_response.get('data', []) if isinstance(ads_response, dict) else ads_response
    except Exception as e:
        ads = str(e); print('ERROR WAS:', ads)
    end_time = time.time()
    print(f"SUCCESS: Extracted active ads in {end_time - start_time:.4f} seconds.")
    if ads:
        print(f"Sample Ad Keys: {list(ads[0].keys())}")
