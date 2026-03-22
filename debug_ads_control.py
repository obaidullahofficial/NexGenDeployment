
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.getcwd(), 'backend')))
from app import app
from controllers.advertisement_controller import AdvertisementController

with app.app_context():
    print('Calling get_active_advertisements')
    res = AdvertisementController.get_active_advertisements()
    print('DONE', res.keys() if isinstance(res, dict) else type(res))
