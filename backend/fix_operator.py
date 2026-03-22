import re

with open('models/advertisement.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the dictionary mapping that got lost previously
text = text.replace("{'_id': {'': society_ids}},", "{'_id': {'$in': society_ids}},")
text = text.replace("{'society_name': 1}", "{'name': 1}")
text = text.replace("soc.get('society_name',", "soc.get('name',")

with open('models/advertisement.py', 'w', encoding='utf-8') as f:
    f.write(text)

print('Fixed operators')