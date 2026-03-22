import sys
import time
import os
import json

sys.path.append(r'd:\Final upload\Deployement\NextGenArchitect\backend')
try:
    from app import app
except Exception as e:
    print(f"FAILED TO IMPORT APP: {e}")
    sys.exit(1)

def run_tests():
    client = app.test_client()
    
    print("--- Testing Plot Endpoints ---")
    start = time.time()
    response = client.get('/api/plots')
    plots_time = time.time() - start
    print(f"Status: {response.status_code}")
    print(f"Time taken (Plots): {plots_time:.4f}s")
    if response.status_code == 200:
        data = json.loads(response.data)
        plots = data.get('plots', [])
        if plots:
            p = plots[0]
            print("First Plot keys:", list(p.keys()))
            if 'image' in p or 'json_template' in p or 'pdf_template' in p:
                print("!! WARNING: Base64 payloads still present in bulk plot fetch!")
            else:
                print(">> SUCCESS: Base64 payload fields successfully stripped.")
            
    print("\n--- Testing Active Advertisements ---")
    start = time.time()
    response = client.get('/api/advertisements/active')
    ads_time = time.time() - start
    print(f"Status: {response.status_code}")
    print(f"Time taken (Active Ads): {ads_time:.4f}s")
    if response.status_code == 200:
        data = json.loads(response.data)
        if isinstance(data, list) and len(data) > 0:
            print("First Ad keys:", list(data[0].keys()))
            print(">> SUCCESS: Active ads fetched successfully.")
            
    print("\n--- Testing All Advertisements ---")
    start = time.time()
    response = client.get('/api/advertisements')
    ads_time = time.time() - start
    print(f"Status: {response.status_code}")
    print(f"Time taken (All Ads): {ads_time:.4f}s")
    if response.status_code == 200:
        data = json.loads(response.data)
        ads = data.get('advertisements', [])
        if ads:
            print("First Ad keys:", list(ads[0].keys()))
            print(">> SUCCESS: All ads fetched successfully.")

    print("\n--- Testing Society Profiles ---")
    start = time.time()
    response = client.get('/api/society_profiles')
    soc_time = time.time() - start
    print(f"Status: {response.status_code}")
    print(f"Time taken (Society Profiles): {soc_time:.4f}s")
    if response.status_code == 200:
        data = json.loads(response.data)
        profiles = data.get('profiles', [])
        if profiles:
            p = profiles[0]
            print("First Profile keys:", list(p.keys()))
            if 'payment_proof' in p or 'cnic_front' in p or 'cnic_back' in p:
                 print("!! WARNING: Heavy base64 fields still present in society profile list!")
            else:
                 print(">> SUCCESS: Base64 payloads properly stripped from profiles.")

if __name__ == '__main__':
    with app.app_context():
        run_tests()
