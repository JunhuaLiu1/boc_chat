#!/usr/bin/env python3
"""
Debug login and register API issues
"""
import requests
import json

def test_register_api():
    """Test register API"""
    print("Testing Register API")
    print("=" * 40)
    
    url = "http://localhost:8000/api/auth/register"
    
    # Test registration data
    register_data = {
        "email": "newuser@example.com",
        "password": "password123",
        "name": "New Test User"
    }
    
    print(f"URL: {url}")
    print(f"Data: {json.dumps(register_data, indent=2)}")
    
    try:
        response = requests.post(url, json=register_data, timeout=10)
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Registration successful!")
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print("❌ Registration failed!")
            try:
                error_data = response.json()
                print(f"Error Response: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Error text: {response.text}")
                
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_login_api():
    """Test login API"""
    print("\nTesting Login API")
    print("=" * 40)
    
    url = "http://localhost:8000/api/auth/login"
    
    # Test login data
    login_data = {
        "email": "test@example.com",
        "password": "password123",
        "remember_me": False
    }
    
    print(f"URL: {url}")
    print(f"Data: {json.dumps(login_data, indent=2)}")
    
    try:
        response = requests.post(url, json=login_data, timeout=10)
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            data = response.json()
            # Don't print the full token, just show it exists
            if 'access_token' in data:
                data['access_token'] = data['access_token'][:50] + "..."
            if 'refresh_token' in data:
                data['refresh_token'] = data['refresh_token'][:50] + "..."
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print("❌ Login failed!")
            try:
                error_data = response.json()
                print(f"Error Response: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Error text: {response.text}")
                
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_auth_health():
    """Test auth health endpoint"""
    print("\nTesting Auth Health")
    print("=" * 40)
    
    url = "http://localhost:8000/api/auth/health"
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Auth service healthy: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ Auth service unhealthy: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_auth_health()
    test_register_api()
    test_login_api()