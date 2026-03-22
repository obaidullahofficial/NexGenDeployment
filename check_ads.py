import sys
sys.path.append(r'd:\Final upload\Deployement\NextGenArchitect\backend')
from app import app
import time

with app.app_context():
    from controllers.advertisement_controller import AdvertisementController
    print('Fetching ads...')
    start = time.time()
    try:
        ads = AdvertisementController.get_active_advertisements()
        print(f'Fetched {len(ads)} active ads in {time.time() - start:.2f}s')
    except Exception as e:
        print(f'Error fetching ads: {e}')
        
    try:
        from controllers.society_profile_controller import SocietyProfileController
        print('\nFetching society profiles...')
        start = time.time()
        profs = SocietyProfileController.get_all_society_profiles()
        print(f'Fetched {len(profs)} profiles in {time.time() - start:.2f}s')
    except Exception as e:
        print(f'Error fetching profiles: {e}')
        
    try:
        from controllers.plot_controller import PlotController
        print('\nFetching plots...')
        start = time.time()
        plots_res = PlotController.get_all_plots()
        plots = plots_res[0].json['plots']
        print(f'Fetched {len(plots)} plots in {time.time() - start:.2f}s')
        if plots:
            print("Plot 1 keys:", list(plots[0].keys()))
    except Exception as e:
        print(f'Error fetching plots: {e}')
