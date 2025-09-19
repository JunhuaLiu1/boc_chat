#!/usr/bin/env python3
"""
Test registration with proper password format
"""
import requests
import json

def test_correct_register():
    """Test register API with correct format"""
    print("Testing Register API with correct format")
    print("=" * 50)
    
    url = "http://localhost:8000/api/auth/register"
    
    # Test registration data with strong password
    register_data = {
        "email": "frontend_test@example.com",
        "password": "Password123",  # Contains uppercase, lowercase, and number
        "confirm_password": "Password123",  # Add confirm_password field
        "name": "Frontend Test User"
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

def test_frontend_login():
    """Test login from frontend perspective"""
    print("\nTesting Login API from frontend perspective")
    print("=" * 50)
    
    url = "http://localhost:8000/api/auth/login"
    
    # Test login data exactly as frontend would send
    login_data = {
        "email": "test@example.com",
        "password": "password123",
        "remember_me": False
    }
    
    print(f"URL: {url}")
    print(f"Data: {json.dumps(login_data, indent=2)}")
    
    # Add headers that frontend might send
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Origin": "http://localhost:3001",
        "User-Agent": "Mozilla/5.0 (Frontend Test)"
    }
    
    try:
        response = requests.post(url, json=login_data, headers=headers, timeout=10)
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            data = response.json()
            # Show partial tokens
            if 'access_token' in data:
                data['access_token'] = data['access_token'][:30] + "..."
            if 'refresh_token' in data:
                data['refresh_token'] = data['refresh_token'][:30] + "..."
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

if __name__ == "__main__":
    test_correct_register()
    test_frontend_login()