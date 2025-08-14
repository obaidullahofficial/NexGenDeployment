#!/usr/bin/env python3

import requests
import json

# Test the society profile endpoint to debug 422 error
API_URL = "http://localhost:5000/api"

def test_login_and_profile_update():
    """Test login and then profile update to reproduce 422 error"""
    
    # Step 1: Test login with a society user
    login_data = {
        "email": "test@society.com",  # Replace with an actual society email
        "password": "password123"     # Replace with actual password
    }
    
    print("Testing login...")
    login_response = requests.post(f"{API_URL}/login", json=login_data)
    print(f"Login Status: {login_response.status_code}")
    print(f"Login Response: {login_response.text}")
    
    if login_response.status_code != 200:
        print("Login failed, cannot proceed with profile test")
        return
    
    login_result = login_response.json()
    if not login_result.get('access_token'):
        print("No access token received")
        return
    
    token = login_result['access_token']
    print(f"Got token: {token[:20]}...")
    
    # Step 2: Test profile update with form data
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Test with simple JSON data first
    profile_data = {
        "name": "Test Society",
        "description": "A test society description",
        "location": "Test City",
        "available_plots": "5 Marla, 10 Marla",
        "price_range": "50L - 1Cr"
    }
    
    print("\nTesting profile update with JSON data...")
    json_response = requests.post(
        f"{API_URL}/society-profile", 
        json=profile_data, 
        headers=headers
    )
    print(f"JSON Update Status: {json_response.status_code}")
    print(f"JSON Update Response: {json_response.text}")
    
    # Test with form data
    print("\nTesting profile update with form data...")
    form_response = requests.post(
        f"{API_URL}/society-profile", 
        data=profile_data, 
        headers=headers
    )
    print(f"Form Update Status: {form_response.status_code}")
    print(f"Form Update Response: {form_response.text}")

if __name__ == "__main__":
    try:
        test_login_and_profile_update()
    except Exception as e:
        print(f"Test failed with error: {e}")
