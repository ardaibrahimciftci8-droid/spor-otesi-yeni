import requests
import sys
import json
import os
from datetime import datetime, timezone
import uuid

class SporOtesiAPITester:
    def __init__(self, base_url=None):
        self.base_url = base_url or 'https://fitintegrate.preview.emergentagent.com'
        self.api_url = f"{self.base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_id = f"test_user_{str(uuid.uuid4())[:8]}"  # Unique test user
        self.test_user_id2 = f"test_user2_{str(uuid.uuid4())[:8]}"  # Second test user for social features
        self.test_results = []
        self.created_post_id = None
        self.created_activity_id = None
        self.created_conversation_id = None
        self.created_goal_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, params=params, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                details = f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}"
                self.log_test(name, False, details)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test basic API root endpoint"""
        return self.run_test(
            "API Root Endpoint",
            "GET",
            "",
            200
        )

    def test_posts_feed_endpoint(self):
        """Test posts feed endpoint"""
        return self.run_test(
            "Posts Feed Endpoint",
            "GET", 
            "posts/feed",
            200
        )

    def test_create_user(self):
        """Test user creation endpoint"""
        user_data = {
            "firebase_uid": self.test_user_id,
            "display_name": "Test User",
            "email": "test@example.com",
            "bio": "Test user for API testing"
        }
        return self.run_test(
            "Create/Update User (POST /api/users)",
            "POST",
            "users",
            200,
            data=user_data
        )

    def test_create_activity(self):
        """Test activity creation endpoint"""
        activity_data = {
            "user_id": self.test_user_id,
            "activity_type": "running",
            "duration_minutes": 30,
            "distance_km": 5.0,
            "calories_burned": 300,
            "notes": "Morning run test"
        }
        return self.run_test(
            "Create Activity (POST /api/activities)",
            "POST",
            "activities",
            200,
            data=activity_data
        )

    def test_create_sleep_record(self):
        """Test sleep record creation endpoint"""
        now = datetime.now(timezone.utc)
        sleep_start = now.replace(hour=22, minute=0, second=0, microsecond=0)
        sleep_end = now.replace(hour=6, minute=30, second=0, microsecond=0)
        
        sleep_data = {
            "user_id": self.test_user_id,
            "sleep_start": sleep_start.isoformat(),
            "sleep_end": sleep_end.isoformat(),
            "quality": 4,
            "notes": "Good sleep test"
        }
        return self.run_test(
            "Create Sleep Record (POST /api/sleep)",
            "POST",
            "sleep",
            200,
            data=sleep_data
        )

    def test_get_activities(self):
        """Test getting user activities"""
        return self.run_test(
            "Get User Activities",
            "GET",
            f"activities/{self.test_user_id}",
            200
        )

    def test_get_sleep_records(self):
        """Test getting user sleep records"""
        return self.run_test(
            "Get User Sleep Records",
            "GET",
            f"sleep/{self.test_user_id}",
            200
        )

    def test_activity_stats(self):
        """Test activity statistics endpoint"""
        return self.run_test(
            "Get Activity Stats",
            "GET",
            f"activities/{self.test_user_id}/stats",
            200
        )

    def test_sleep_stats(self):
        """Test sleep statistics endpoint"""
        return self.run_test(
            "Get Sleep Stats",
            "GET",
            f"sleep/{self.test_user_id}/stats",
            200
        )

    def test_ai_analysis(self):
        """Test AI analysis endpoint"""
        return self.run_test(
            "AI Activity Analysis",
            "POST",
            "ai/analyze-activity",
            200,
            params={"user_id": self.test_user_id}
        )

    def test_create_post(self):
        """Test post creation"""
        post_data = {
            "user_id": self.test_user_id,
            "user_name": "Test User",
            "content": "Test post for API testing",
            "media_url": None,
            "media_type": None
        }
        return self.run_test(
            "Create Post",
            "POST",
            "posts",
            200,
            data=post_data
        )

    def test_search_users(self):
        """Test user search functionality"""
        return self.run_test(
            "Search Users",
            "GET",
            "users/search/query",
            200,
            params={"q": "test"}
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Spor Ötesi API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Test basic endpoints
        self.test_root_endpoint()
        self.test_posts_feed_endpoint()
        
        # Test user management
        self.test_create_user()
        self.test_search_users()
        
        # Test activity tracking
        self.test_create_activity()
        self.test_get_activities()
        self.test_activity_stats()
        
        # Test sleep tracking
        self.test_create_sleep_record()
        self.test_get_sleep_records()
        self.test_sleep_stats()
        
        # Test social features
        self.test_create_post()
        
        # Test AI features
        self.test_ai_analysis()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = SporOtesiAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())