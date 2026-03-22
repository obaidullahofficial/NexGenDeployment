
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.getcwd(), 'backend')))
from models.advertisement import Advertisement
from datetime import datetime

print('Init ad')
ad = Advertisement()
print('calling db test')
now = datetime.utcnow()
print(ad.collection.count_documents({'status': 'active'}))
print('testing populate')
ads = list(ad.collection.find({'status': 'active'}).limit(1))
print('Running _populate_society_names')
result = ad._populate_society_names(ads)
print('DONE!', len(result))
