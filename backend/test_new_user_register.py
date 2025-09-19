#!/usr/bin/env python3
"""
Test registration with new email
"""
import requests
import json
import time

def test_new_user_register():
    """Test register API with new email"""
    print("Testing Register API with new user")
    print("=" * 50)
    
    url = "http://localhost:8000/api/auth/register"
    
    # Use timestamp to ensure unique email
    timestamp = int(time.time())
    register_data = {
        "email": f"user{timestamp}@example.com",
        "password": "Password123",
        "confirm_password": "Password123",
        "name": "New User Test"
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
            
            # Test login with new user
            print(f"\nTesting login with new user...")
            login_data = {
                "email": register_data["email"],
                "password": register_data["password"],
                "remember_me": False
            }
            
            login_response = requests.post("http://localhost:8000/api/auth/login", json=login_data, timeout=10)
            print(f"Login Status: {login_response.status_code}")
            
            if login_response.status_code == 200:
                print("✅ Login with new user successful!")
                login_data = login_response.json()
                print(f"User: {login_data.get('user', {}).get('name')} ({login_data.get('user', {}).get('email')})")
            else:
                print("❌ Login with new user failed!")
                try:
                    error_data = login_response.json()
                    print(f"Login Error: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
                except:
                    print(f"Login Error text: {login_response.text}")
        else:
            print("❌ Registration failed!")
            try:
                error_data = response.json()
                print(f"Error Response: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Error text: {response.text}")
                
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_new_user_register()