import urllib.request, json, time, urllib.error
def get_token():
    url = 'http://127.0.0.1:5000/api/users/login'
    data = json.dumps({'email': 'admin@gmail.com', 'password': 'password123'}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())['access_token']
    except Exception as e:
        print('Login Error:', e)
        return None

def test_ep(url, name, tk=None):
    req = urllib.request.Request(url, headers={'Authorization': 'Bearer '+tk} if tk else {})
    start = time.time()
    try:
        with urllib.request.urlopen(req) as r:
            d = json.loads(r.read())
            print(f'{name}: {time.time()-start:.2f}s')
            return d
    except Exception as e:
        print(f'{name} Error:', e)
        return None

tk = get_token()
print('Token:', bool(tk))
ads = test_ep('http://127.0.0.1:5000/api/advertisements/active', 'Ads')
plots = test_ep('http://127.0.0.1:5000/api/plots', 'Plots', tk)
print('Ads keys:', list(ads['data'][0].keys()) if ads and 'data' in ads and ads['data'] else None)
if plots and isinstance(plots, dict):
    print('Plot keys:', list(plots.get('plots',[{}])[0].keys()) if plots.get('plots') else None)
elif plots and isinstance(plots, list):
    print('Plot keys:', list(plots[0].keys()) if plots else None)
