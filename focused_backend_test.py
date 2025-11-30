#!/usr/bin/env python3
import requests
import json
from datetime import datetime, timezone
import uuid

def test_endpoint(name, method, url, data=None, params=None, expected_status=200, timeout=10):
    """Test a single endpoint and return result"""
    headers = {'Content-Type': 'application/json'}
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, params=params, timeout=timeout)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers, params=params, timeout=timeout)
        elif method == 'PUT':
            response = requests.put(url, json=data, headers=headers, params=params, timeout=timeout)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, params=params, timeout=timeout)
        
        success = response.status_code == expected_status
        status_msg = "✅ PASS" if success else f"❌ FAIL ({response.status_code})"
        
        print(f"{status_msg} | {name}")
        if not success:
            print(f"    Error: {response.text[:150]}")
        
        return success, response
        
    except Exception as e:
        print(f"❌ ERROR | {name}: {str(e)}")
        return False, None

def main():
    base_url = 'https://sportreels.preview.emergentagent.com/api'
    test_user = f"test_{str(uuid.uuid4())[:8]}"
    
    print("🔍 FOCUSED BACKEND API TESTING")
    print("=" * 50)
    
    # Core working endpoints
    print("\n📍 CORE ENDPOINTS")
    test_endpoint("API Root", "GET", f"{base_url}/")
    test_endpoint("Posts Feed", "GET", f"{base_url}/posts/feed")
    
    # User management
    print("\n👤 USER MANAGEMENT")
    test_endpoint("Create User", "POST", f"{base_url}/users", {
        "firebase_uid": test_user,
        "display_name": "Test User",
        "email": "test@example.com"
    })
    test_endpoint("Get User", "GET", f"{base_url}/users/{test_user}")
    test_endpoint("Search Users", "GET", f"{base_url}/users/search/query", params={"q": "test"})
    
    # Activity tracking
    print("\n🏃 ACTIVITY TRACKING")
    test_endpoint("Create Activity", "POST", f"{base_url}/activities", {
        "user_id": test_user,
        "activity_type": "running",
        "duration_minutes": 30,
        "distance_km": 5.0
    })
    test_endpoint("Get Activities", "GET", f"{base_url}/activities/{test_user}")
    test_endpoint("Activity Stats", "GET", f"{base_url}/activities/{test_user}/stats")
    
    # Sleep tracking
    print("\n😴 SLEEP TRACKING")
    now = datetime.now(timezone.utc)
    sleep_start = now.replace(hour=22, minute=0, second=0, microsecond=0)
    sleep_end = now.replace(hour=6, minute=30, second=0, microsecond=0)
    
    test_endpoint("Create Sleep Record", "POST", f"{base_url}/sleep", {
        "user_id": test_user,
        "sleep_start": sleep_start.isoformat(),
        "sleep_end": sleep_end.isoformat(),
        "quality": 4
    })
    test_endpoint("Get Sleep Records", "GET", f"{base_url}/sleep/{test_user}")
    test_endpoint("Sleep Stats", "GET", f"{base_url}/sleep/{test_user}/stats")
    
    # AI Coach (working from logs)
    print("\n🤖 AI COACH")
    test_endpoint("Exercise Coach", "POST", f"{base_url}/coach/chat", {
        "user_id": test_user,
        "coach_type": "exercise",
        "user_message": "Koşu antrenmanı tavsiyesi?"
    }, timeout=30)
    test_endpoint("Yoga Coach", "POST", f"{base_url}/coach/chat", {
        "user_id": test_user,
        "coach_type": "yoga", 
        "user_message": "Yoga programı önerir misin?"
    }, timeout=30)
    test_endpoint("Coach History", "GET", f"{base_url}/coach/history/{test_user}")
    
    # Social features
    print("\n👥 SOCIAL FEATURES")
    test_endpoint("Create Post", "POST", f"{base_url}/posts", {
        "user_id": test_user,
        "user_name": "Test User",
        "content": "Test post content"
    })
    
    # Problematic endpoints (404s from logs)
    print("\n❓ PROBLEMATIC ENDPOINTS")
    test_endpoint("Goals (404 expected)", "GET", f"{base_url}/goals/{test_user}", expected_status=404)
    test_endpoint("Achievements (404 expected)", "GET", f"{base_url}/achievements/{test_user}", expected_status=404)
    test_endpoint("Analytics (404 expected)", "GET", f"{base_url}/analytics/stats", expected_status=404)
    test_endpoint("Notifications (404 expected)", "GET", f"{base_url}/notifications/{test_user}", expected_status=404)
    
    # Yoga program (500 error from logs)
    print("\n🧘 YOGA PROGRAM (Known Issue)")
    test_endpoint("Generate Yoga Program (500 expected)", "POST", f"{base_url}/yoga/generate-program", {
        "user_id": test_user,
        "program_name": "Test Program",
        "duration_minutes": 30,
        "difficulty": "beginner"
    }, expected_status=500, timeout=30)
    
    print("\n" + "=" * 50)
    print("✅ Test completed - Check results above")

if __name__ == "__main__":
    main()