#!/usr/bin/env python3
"""
Test login API endpoint
"""
import requests
import json

def test_login_api():
    """Test the login API endpoint"""
    print("Testing Login API Endpoint")
    print("=" * 40)
    
    # API endpoint
    url = "http://localhost:8000/api/auth/login"
    
    # Test credentials
    credentials = {
        "email": "test@example.com",
        "password": "password123",
        "remember_me": False
    }
    
    print(f"Testing login with:")
    print(f"Email: {credentials['email']}")
    print(f"Password: {credentials['password']}")
    print(f"URL: {url}")
    
    try:
        # Make the request
        response = requests.post(url, json=credentials, timeout=10)
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            data = response.json()
            print(f"User: {data.get('user', {}).get('name')} ({data.get('user', {}).get('email')})")
            print(f"Access Token: {data.get('access_token', 'N/A')[:50]}...")
            print(f"Refresh Token: {data.get('refresh_token', 'N/A')[:50]}...")
        else:
            print("❌ Login failed!")
            try:
                error_data = response.json()
                print(f"Error: {error_data}")
            except:
                print(f"Error text: {response.text}")
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        
    # Test with wrong password
    print("\n" + "=" * 40)
    print("Testing with wrong password...")
    
    wrong_credentials = {
        "email": "test@example.com",
        "password": "wrongpassword",
        "remember_me": False
    }
    
    try:
        response = requests.post(url, json=wrong_credentials, timeout=10)
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Correctly rejected wrong password")
            try:
                error_data = response.json()
                print(f"Error message: {error_data.get('detail', 'N/A')}")
            except:
                print(f"Error text: {response.text}")
        else:
            print("❌ Should have rejected wrong password")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_login_api()