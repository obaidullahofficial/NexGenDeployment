
import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.getcwd(), 'backend')))
from models.advertisement import Advertisement
from datetime import datetime

ad = Advertisement()
print('ad loaded')
now = datetime.utcnow()
query = {
    'status': 'active',
    'start_date': {'': now},
    'end_date': {'': now}
}
print(1)
cursor = ad.collection.find(query).sort('created_at', -1)
print(2)
ads = list(cursor)
print('3 ads len:', len(ads))
ads = ad._populate_society_names(ads)
print(4)
