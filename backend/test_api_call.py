"""Test API endpoint directly"""
import requests

def test_api():
    plot_id = "6935d1dfade7827b09886f04"
    url = f"http://localhost:5000/api/plots/{plot_id}"
    
    print(f"🔍 Testing URL: {url}")
    
    try:
        response = requests.get(url)
        print(f"✅ Status Code: {response.status_code}")
        print(f"📦 Response: {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_api()
