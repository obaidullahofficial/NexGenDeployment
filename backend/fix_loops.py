import re

with open('models/advertisement.py', 'r', encoding='utf-8') as f:
    text = f.read()

old_block = r'''            ads = \[\]
            for ad in self\.collection\.find\(query\)\.sort\("created_at", -1\)\.skip\(skip\)\.limit\(per_page\):
                ad\['_id'\] = str\(ad\['_id'\]\)
                if 'plan_id' in ad and isinstance\(ad\['plan_id'\], ObjectId\):
                    ad\['plan_id'\] = str\(ad\['plan_id'\]\)
                if 'society_id' in ad and isinstance\(ad\['society_id'\], ObjectId\):
                    society_id = ad\['society_id'\]
                    ad\['society_id'\] = str\(society_id\)
                    # Fetch and add society name
                    ad\['society_name'\] = self\._get_society_name\(society_id\)
                ads\.append\(ad\)'''

new_block = '''            cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(per_page)
            ads = list(cursor)
            ads = self._populate_society_names(ads)'''

text = re.sub(old_block, new_block, text)

with open('models/advertisement.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done")
