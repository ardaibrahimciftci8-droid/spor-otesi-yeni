import requests
import sys
import json
import os
from datetime import datetime, timezone
import uuid

class BugFixAPITester:
    def __init__(self, base_url=None):
        self.base_url = base_url or 'https://sportster.preview.emergentagent.com'
        self.api_url = f"{self.base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        # Use existing test users from the review request
        self.test_user_1 = "plepYiy57abmoFDS7a3LoIUXDNl1"  # Arda Çiftçi
        self.test_user_2 = "patukQYrBzWTt8RmdPaCW89r8tA3"   # ahmet arda keskinoğlu
        self.private_user = f"private_user_{str(uuid.uuid4())[:8]}"  # New private user for testing
        self.test_results = []
        self.created_post_id = None
        self.created_reel_id = None

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
        if params:
            print(f"   Params: {params}")
        
        try:
            timeout = 15
            
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, params=params, timeout=timeout)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                details = f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:300]}"
                self.log_test(name, False, details)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_profile_endpoint(self):
        """Test GET /api/profile/{user_id} - Bug Fix Verification"""
        print("\n🔍 TESTING PROFILE ENDPOINT (Bug Fix Verification)")
        print("-" * 60)
        
        # Test with existing user (should work)
        success, response = self.run_test(
            "Profile Endpoint - Existing User",
            "GET",
            f"users/{self.test_user_1}/profile",
            200,
            params={"current_user_id": self.test_user_2}
        )
        
        if success:
            # Verify response structure
            if isinstance(response, dict):
                required_fields = ['user', 'posts', 'posts_count', 'is_following']
                missing_fields = [field for field in required_fields if field not in response]
                if missing_fields:
                    self.log_test("Profile Response Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Profile Response Structure", True)
                    
                    # Check if user data is present
                    if 'user' in response and isinstance(response['user'], dict):
                        user_fields = ['firebase_uid', 'display_name', 'followers_count', 'following_count']
                        user_missing = [field for field in user_fields if field not in response['user']]
                        if user_missing:
                            self.log_test("Profile User Data", False, f"Missing user fields: {user_missing}")
                        else:
                            self.log_test("Profile User Data", True)
                    
                    # Check posts array
                    if 'posts' in response and isinstance(response['posts'], list):
                        self.log_test("Profile Posts Array", True, f"Found {len(response['posts'])} posts")
                    else:
                        self.log_test("Profile Posts Array", False, "Posts should be an array")
            else:
                self.log_test("Profile Response Format", False, "Response should be JSON object")
        
        # Test with non-existent user (should return 404)
        self.run_test(
            "Profile Endpoint - Non-existent User",
            "GET",
            "users/non_existent_user/profile",
            404
        )
        
        return success, response

    def test_private_post_filtering(self):
        """Test private post filtering functionality"""
        print("\n🔒 TESTING PRIVATE POST FILTERING")
        print("-" * 60)
        
        # 1. Create a private user
        private_user_data = {
            "firebase_uid": self.private_user,
            "display_name": "Private Test User",
            "email": "private@test.com",
            "bio": "Private account for testing"
        }
        
        success, _ = self.run_test(
            "Create Private Test User",
            "POST",
            "users",
            200,
            data=private_user_data
        )
        
        if not success:
            self.log_test("Private Post Filtering Setup", False, "Could not create private user")
            return False, {}
        
        # 2. Set user as private
        success, _ = self.run_test(
            "Set Account to Private",
            "POST",
            f"users/{self.private_user}/privacy",
            200,
            params={"is_private": True}
        )
        
        if not success:
            self.log_test("Set Private Account", False, "Could not set account to private")
            return False, {}
        
        # 3. Create a post from private user
        private_post_data = {
            "user_id": self.private_user,
            "user_name": "Private Test User",
            "content": "This is a private post that should be filtered from non-followers",
            "media_url": None,
            "media_type": None
        }
        
        success, post_response = self.run_test(
            "Create Post from Private User",
            "POST",
            "posts",
            200,
            data=private_post_data
        )
        
        if success and isinstance(post_response, dict) and 'id' in post_response:
            self.created_post_id = post_response['id']
        
        # 4. Test feed without following (should NOT see private post)
        success, feed_response = self.run_test(
            "Get Feed as Non-Follower",
            "GET",
            "posts/feed",
            200,
            params={"user_id": self.test_user_1}
        )
        
        if success and isinstance(feed_response, list):
            private_posts_visible = [post for post in feed_response if post.get('user_id') == self.private_user]
            if private_posts_visible:
                self.log_test("Private Post Filtering - Non-Follower", False, f"Private posts visible to non-follower: {len(private_posts_visible)}")
            else:
                self.log_test("Private Post Filtering - Non-Follower", True, "Private posts correctly hidden from non-followers")
        
        # 5. Follow the private user
        success, _ = self.run_test(
            "Follow Private User",
            "POST",
            f"follow/{self.private_user}",
            200,
            params={"follower_id": self.test_user_1}
        )
        
        # 6. Test feed after following (should see private post)
        success, feed_response = self.run_test(
            "Get Feed as Follower",
            "GET",
            "posts/feed",
            200,
            params={"user_id": self.test_user_1}
        )
        
        if success and isinstance(feed_response, list):
            private_posts_visible = [post for post in feed_response if post.get('user_id') == self.private_user]
            if private_posts_visible:
                self.log_test("Private Post Filtering - Follower", True, f"Private posts correctly visible to follower: {len(private_posts_visible)}")
            else:
                self.log_test("Private Post Filtering - Follower", False, "Private posts should be visible to followers")
        
        # 7. Test public feed (no user_id) - should not see private posts
        success, public_feed = self.run_test(
            "Get Public Feed (No Auth)",
            "GET",
            "posts/feed",
            200
        )
        
        if success and isinstance(public_feed, list):
            private_posts_in_public = [post for post in public_feed if post.get('user_id') == self.private_user]
            if private_posts_in_public:
                self.log_test("Private Post Filtering - Public Feed", False, f"Private posts visible in public feed: {len(private_posts_in_public)}")
            else:
                self.log_test("Private Post Filtering - Public Feed", True, "Private posts correctly hidden from public feed")
        
        return True, {}

    def test_reels_endpoints(self):
        """Test reels endpoints and video upload functionality"""
        print("\n🎬 TESTING REELS ENDPOINTS")
        print("-" * 60)
        
        # 1. Test reels feed endpoint
        success, reels_response = self.run_test(
            "Get Reels Feed",
            "GET",
            "reels/feed",
            200,
            params={"user_id": self.test_user_1, "limit": 10}
        )
        
        if success and isinstance(reels_response, list):
            self.log_test("Reels Feed Response Format", True, f"Found {len(reels_response)} reels")
            
            # Check reel structure if any reels exist
            if reels_response:
                reel = reels_response[0]
                required_reel_fields = ['id', 'user_id', 'user_name', 'video_url', 'likes_count', 'comments_count', 'views_count']
                missing_reel_fields = [field for field in required_reel_fields if field not in reel]
                if missing_reel_fields:
                    self.log_test("Reel Structure Validation", False, f"Missing reel fields: {missing_reel_fields}")
                else:
                    self.log_test("Reel Structure Validation", True)
        else:
            self.log_test("Reels Feed Response Format", False, "Response should be an array")
        
        # 2. Test creating a reel (simulating video upload)
        reel_data = {
            "user_id": self.test_user_1,
            "user_name": "Arda Çiftçi",
            "user_photo": "https://ui-avatars.com/api/?name=Arda+Çiftçi&background=random",
            "video_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            "description": "Test reel upload - spor videosu 🏃‍♂️💪 #fitness #test",
            "music": "Original Audio - Arda Çiftçi"
        }
        
        success, reel_response = self.run_test(
            "Create Reel",
            "POST",
            "reels",
            200,
            data=reel_data
        )
        
        if success and isinstance(reel_response, dict) and 'id' in reel_response:
            self.created_reel_id = reel_response['id']
            self.log_test("Reel Creation Response", True, f"Created reel with ID: {self.created_reel_id}")
        
        # 3. Test reel interactions (like, view)
        if self.created_reel_id:
            # Test liking a reel
            success, like_response = self.run_test(
                "Like Reel",
                "POST",
                f"reels/{self.created_reel_id}/like",
                200,
                params={"user_id": self.test_user_2}
            )
            
            if success and isinstance(like_response, dict):
                if 'liked' in like_response and 'likes_count' in like_response:
                    self.log_test("Reel Like Response", True, f"Like status: {like_response['liked']}, Count: {like_response['likes_count']}")
                else:
                    self.log_test("Reel Like Response", False, "Missing like status or count")
            
            # Test incrementing views
            success, view_response = self.run_test(
                "Increment Reel Views",
                "POST",
                f"reels/{self.created_reel_id}/view",
                200
            )
        
        # 4. Test video posts automatically creating reels
        video_post_data = {
            "user_id": self.test_user_1,
            "user_name": "Arda Çiftçi",
            "content": "Video post that should auto-create a reel 🎥",
            "media_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "media_type": "video"
        }
        
        success, video_post_response = self.run_test(
            "Create Video Post (Auto-Reel)",
            "POST",
            "posts",
            200,
            data=video_post_data
        )
        
        if success:
            # Check if reel was automatically created
            success, updated_reels = self.run_test(
                "Verify Auto-Created Reel",
                "GET",
                "reels/feed",
                200,
                params={"user_id": self.test_user_1, "limit": 20}
            )
            
            if success and isinstance(updated_reels, list):
                # Look for reel with the video URL
                auto_reel = next((reel for reel in updated_reels if reel.get('video_url') == video_post_data['media_url']), None)
                if auto_reel:
                    self.log_test("Auto-Reel Creation", True, "Video post automatically created reel")
                else:
                    self.log_test("Auto-Reel Creation", False, "Video post did not create reel automatically")
        
        return True, {}

    def test_user_search_with_profile_navigation(self):
        """Test user search functionality for onViewProfile bug fix"""
        print("\n👤 TESTING USER SEARCH & PROFILE NAVIGATION")
        print("-" * 60)
        
        # Test searching for 'arda' (should return existing users)
        success, search_response = self.run_test(
            "Search Users - 'arda' Query",
            "GET",
            "users/search/query",
            200,
            params={"q": "arda"}
        )
        
        if success and isinstance(search_response, list):
            self.log_test("User Search Response Format", True, f"Found {len(search_response)} users")
            
            # Verify search results contain expected users
            user_names = [user.get('display_name', '') for user in search_response]
            expected_users = ['Arda Çiftçi', 'ahmet arda keskinoğlu']
            
            found_users = [name for name in expected_users if any(name.lower() in user_name.lower() for user_name in user_names)]
            
            if found_users:
                self.log_test("Expected Users Found", True, f"Found users: {found_users}")
            else:
                self.log_test("Expected Users Found", False, f"Expected users not found. Available: {user_names}")
            
            # Test profile navigation for each found user
            for user in search_response[:3]:  # Test first 3 users
                if 'firebase_uid' in user:
                    success, profile_response = self.run_test(
                        f"Profile Navigation - {user.get('display_name', 'Unknown')}",
                        "GET",
                        f"users/{user['firebase_uid']}/profile",
                        200,
                        params={"current_user_id": self.test_user_2}
                    )
                    
                    if success and isinstance(profile_response, dict):
                        if 'user' in profile_response and 'posts' in profile_response:
                            self.log_test(f"Profile Data Complete - {user.get('display_name', 'Unknown')}", True)
                        else:
                            self.log_test(f"Profile Data Complete - {user.get('display_name', 'Unknown')}", False, "Missing user or posts data")
        else:
            self.log_test("User Search Response Format", False, "Response should be an array")
        
        return True, {}

    def run_focused_tests(self):
        """Run focused tests for recent bug fixes and new features"""
        print("🚀 Starting Focused Bug Fix & Feature Tests...")
        print(f"📍 Testing against: {self.base_url}")
        print(f"🎯 Focus: Profile endpoints, Private posts, Reels, User search")
        print("=" * 80)

        # Test 1: Profile Endpoint (Bug Fix Verification)
        self.test_profile_endpoint()
        
        # Test 2: Private Post Filtering (Existing Feature Verification)
        self.test_private_post_filtering()
        
        # Test 3: Reels Endpoints (New Feature Testing)
        self.test_reels_endpoints()
        
        # Test 4: User Search with Profile Navigation (Bug Fix Verification)
        self.test_user_search_with_profile_navigation()

        # Print focused summary
        print("\n" + "=" * 80)
        print(f"📊 FOCUSED TEST SUMMARY")
        print(f"📈 Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"📉 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        else:
            print("\n🎉 ALL FOCUSED TESTS PASSED!")
        
        print("=" * 80)
        
        return self.tests_passed, self.tests_run, failed_tests

def main():
    tester = BugFixAPITester()
    passed, total, failed = tester.run_focused_tests()
    
    if passed == total:
        print("✅ All bug fixes and new features are working correctly!")
        return 0
    else:
        print(f"⚠️ {total - passed} tests failed. Review needed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())