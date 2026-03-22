import urllib.request
import urllib.error
import urllib.parse
import json
import time

def get_token():
    url = 'http://localhost:5000/api/users/login'
    data = json.dumps({'email': 'obaid@example.com', 'password': 'password123'}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data.get('access_token')
    except urllib.error.HTTPError as e:
        print(f"Login HTTPError: {e.code}")
    except Exception as e:
        print(f"Failed to login: {e}")
    return None

def test_endpoint(url, name, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=headers)
    
    start_time = time.time()
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            end_time = time.time()
            elapsed = end_time - start_time
            print(f"{name} Loaded: {elapsed:.2f}s")
            return data
    except urllib.error.HTTPError as e:
        print(f"{name} Failed HTTPError: {e.code}")
    except Exception as e:
        print(f"{name} Failed: {e}")
    return None

print("Starting checks...")
# First try to get token
token = get_token()
print(f"Got Token: {'YES' if token else 'NO'}")

# Ads
ads = test_endpoint('http://localhost:5000/api/advertisements/active', "Active Ads")
# Plots 
plots = test_endpoint('http://localhost:5000/api/plots', "Plots", token=token)

if ads:
    if isinstance(ads, list) and ads: 
        print(f"Sample Ad keys: {list(ads[0].keys())}")
    elif isinstance(ads, dict):
        if 'advertisements' in ads and ads['advertisements']:
            print(f"Sample Ad keys: {list(ads['advertisements'][0].keys())}")
        elif 'error' in ads:
            print(f"Error in ads: {ads['error']}")
