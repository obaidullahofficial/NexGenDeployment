# Test Advertisement API - Complete CRUD Operations
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000/api"

def test_user_login():
    """Test user login to get JWT token"""
    print("\n=== Testing User Login ===")
    
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/login", json=login_data)
    print(f"Login Status: {response.status_code}")
    print(f"Login Response: {response.json()}")
    
    if response.status_code == 200:
        token = response.json().get('access_token')
        return token
    return None

def test_create_advertisement(token):
    """Test creating a new advertisement"""
    print("\n=== Testing Create Advertisement ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Sample advertisement based on your template
    ad_data = {
        "society_name": "Green Valley Residencia",
        "location": "Near DHA Phase 5, Main Boulevard, Lahore",
        "plot_sizes": ["5 Marla", "10 Marla", "1 Kanal"],
        "price_start": 2500000,
        "price_end": 12000000,
        "contact_number": "+92-300-1234567",
        "description": "🏡 Green Valley Residencia – Residential Plots for Sale\nLocation: Near DHA Phase 5, Main Boulevard\nSizes: 5 Marla, 10 Marla, 1 Kanal\nStatus: Ready for possession ✅\nPrice: Starting from PKR 25 Lacs only\nEasy Installments Available 💰",
        "facilities": "Gated community, electricity, gas, water, parks, schools & 24/7 security",
        "installments_available": True,
        "possession_status": "ready",
        "status": "active",
        "is_featured": True
    }
    
    response = requests.post(f"{BASE_URL}/advertisements", json=ad_data, headers=headers)
    print(f"Create Status: {response.status_code}")
    print(f"Create Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        return response.json().get('data', {}).get('_id')
    return None

def test_get_all_advertisements():
    """Test getting all advertisements"""
    print("\n=== Testing Get All Advertisements ===")
    
    response = requests.get(f"{BASE_URL}/advertisements")
    print(f"Get All Status: {response.status_code}")
    print(f"Get All Response: {json.dumps(response.json(), indent=2)}")
    
    return response.json()

def test_get_advertisement_by_id(ad_id):
    """Test getting specific advertisement by ID"""
    print(f"\n=== Testing Get Advertisement by ID: {ad_id} ===")
    
    response = requests.get(f"{BASE_URL}/advertisements/{ad_id}")
    print(f"Get By ID Status: {response.status_code}")
    print(f"Get By ID Response: {json.dumps(response.json(), indent=2)}")
    
    return response.json()

def test_update_advertisement(ad_id, token):
    """Test updating an advertisement"""
    print(f"\n=== Testing Update Advertisement: {ad_id} ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    update_data = {
        "description": "🏡 UPDATED - Green Valley Residencia – Residential Plots for Sale\nLocation: Near DHA Phase 5, Main Boulevard\nSizes: 5 Marla, 10 Marla, 1 Kanal\nStatus: Ready for possession ✅\nPrice: Starting from PKR 25 Lacs only\nEasy Installments Available 💰\nNEW: Special discount for limited time!",
        "price_start": 2200000,
        "facilities": "Gated community, electricity, gas, water, parks, schools, mosque & 24/7 security"
    }
    
    response = requests.put(f"{BASE_URL}/advertisements/{ad_id}", json=update_data, headers=headers)
    print(f"Update Status: {response.status_code}")
    print(f"Update Response: {json.dumps(response.json(), indent=2)}")
    
    return response.json()

def test_search_advertisements():
    """Test searching advertisements"""
    print("\n=== Testing Search Advertisements ===")
    
    search_terms = ["Green", "DHA", "residential"]
    
    for term in search_terms:
        response = requests.get(f"{BASE_URL}/advertisements/search?q={term}")
        print(f"Search '{term}' Status: {response.status_code}")
        print(f"Search '{term}' Response: {json.dumps(response.json(), indent=2)}")

def test_featured_advertisements():
    """Test getting featured advertisements"""
    print("\n=== Testing Featured Advertisements ===")
    
    response = requests.get(f"{BASE_URL}/advertisements/featured")
    print(f"Featured Status: {response.status_code}")
    print(f"Featured Response: {json.dumps(response.json(), indent=2)}")

def test_increment_view_count(ad_id):
    """Test incrementing view count"""
    print(f"\n=== Testing Increment View Count: {ad_id} ===")
    
    response = requests.post(f"{BASE_URL}/advertisements/{ad_id}/view")
    print(f"View Count Status: {response.status_code}")
    print(f"View Count Response: {json.dumps(response.json(), indent=2)}")

def test_increment_contact_count(ad_id):
    """Test incrementing contact count"""
    print(f"\n=== Testing Increment Contact Count: {ad_id} ===")
    
    response = requests.post(f"{BASE_URL}/advertisements/{ad_id}/contact")
    print(f"Contact Count Status: {response.status_code}")
    print(f"Contact Count Response: {json.dumps(response.json(), indent=2)}")

def test_advertisement_stats(token):
    """Test getting advertisement statistics"""
    print("\n=== Testing Advertisement Statistics ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{BASE_URL}/advertisements/stats", headers=headers)
    print(f"Stats Status: {response.status_code}")
    print(f"Stats Response: {json.dumps(response.json(), indent=2)}")

def test_delete_advertisement(ad_id, token):
    """Test deleting an advertisement"""
    print(f"\n=== Testing Delete Advertisement: {ad_id} ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.delete(f"{BASE_URL}/advertisements/{ad_id}", headers=headers)
    print(f"Delete Status: {response.status_code}")
    print(f"Delete Response: {json.dumps(response.json(), indent=2)}")

def test_filtered_advertisements():
    """Test getting advertisements with filters"""
    print("\n=== Testing Filtered Advertisements ===")
    
    # Test various filters
    filters = [
        {"status": "active"},
        {"is_featured": "true"},
        {"min_price": "2000000"},
        {"max_price": "5000000"},
        {"location": "DHA"},
        {"society_name": "Green"}
    ]
    
    for filter_params in filters:
        query_string = "&".join([f"{k}={v}" for k, v in filter_params.items()])
        response = requests.get(f"{BASE_URL}/advertisements?{query_string}")
        print(f"Filter {filter_params} Status: {response.status_code}")
        print(f"Filter {filter_params} Response: {json.dumps(response.json(), indent=2)}")

def create_multiple_test_advertisements(token):
    """Create multiple test advertisements"""
    print("\n=== Creating Multiple Test Advertisements ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    test_ads = [
        {
            "society_name": "Royal Gardens",
            "location": "Near Emporium Mall, Johar Town, Lahore",
            "plot_sizes": ["5 Marla", "10 Marla"],
            "price_start": 3500000,
            "contact_number": "+92-301-1234567",
            "description": "🏡 Royal Gardens – Premium Residential Plots\nPrime location in Johar Town",
            "facilities": "Modern amenities, parks, security",
            "status": "active",
            "is_featured": False
        },
        {
            "society_name": "Executive Heights",
            "location": "Canal Road, Lahore",
            "plot_sizes": ["1 Kanal", "2 Kanal"],
            "price_start": 15000000,
            "contact_number": "+92-302-1234567",
            "description": "🏡 Executive Heights – Luxury Plots for Sale\nExclusive location on Canal Road",
            "facilities": "Luxury amenities, club house, golf course",
            "status": "active",
            "is_featured": True
        },
        {
            "society_name": "Dream City",
            "location": "Raiwind Road, Lahore",
            "plot_sizes": ["5 Marla", "10 Marla", "1 Kanal"],
            "price_start": 1800000,
            "contact_number": "+92-303-1234567",
            "description": "🏡 Dream City – Affordable Residential Plots\nBest investment opportunity",
            "facilities": "Basic amenities, electricity, water",
            "status": "active",
            "is_featured": False
        }
    ]
    
    created_ids = []
    for ad_data in test_ads:
        response = requests.post(f"{BASE_URL}/advertisements", json=ad_data, headers=headers)
        if response.status_code == 201:
            ad_id = response.json().get('data', {}).get('_id')
            created_ids.append(ad_id)
            print(f"Created advertisement: {ad_data['society_name']} (ID: {ad_id})")
        else:
            print(f"Failed to create advertisement: {ad_data['society_name']}")
    
    return created_ids

def main():
    """Run all advertisement API tests"""
    print("=" * 60)
    print("ADVERTISEMENT API COMPREHENSIVE TEST")
    print("=" * 60)
    
    # Step 1: Login to get token
    token = test_user_login()
    if not token:
        print("❌ Login failed. Cannot proceed with authenticated tests.")
        return
    
    # Step 2: Create multiple test advertisements
    created_ids = create_multiple_test_advertisements(token)
    
    # Step 3: Test basic CRUD operations
    if created_ids:
        main_ad_id = created_ids[0]
        
        # Test get by ID
        test_get_advertisement_by_id(main_ad_id)
        
        # Test update
        test_update_advertisement(main_ad_id, token)
        
        # Test view and contact increments
        test_increment_view_count(main_ad_id)
        test_increment_contact_count(main_ad_id)
    
    # Step 4: Test read operations
    test_get_all_advertisements()
    test_featured_advertisements()
    test_search_advertisements()
    test_filtered_advertisements()
    
    # Step 5: Test analytics
    test_advertisement_stats(token)
    
    # Step 6: Clean up - delete test advertisements
    print("\n=== Cleanup: Deleting Test Advertisements ===")
    for ad_id in created_ids:
        test_delete_advertisement(ad_id, token)
    
    print("\n" + "=" * 60)
    print("ADVERTISEMENT API TEST COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    main()
