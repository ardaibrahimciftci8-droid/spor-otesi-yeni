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
            # Use longer timeout for AI endpoints
            timeout = 30 if any(ai_endpoint in endpoint for ai_endpoint in ['coach/chat', 'yoga/generate-program', 'ai/analyze-activity']) else 10
            
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
            "content": "Bu bir test gönderisi! Spor Ötesi API testleri için oluşturuldu. 🏃‍♂️💪",
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

    def test_coach_chat(self):
        """Test AI coach chat functionality"""
        coach_data = {
            "user_id": self.test_user_id,
            "coach_type": "exercise",
            "user_message": "Koşu antrenmanı için tavsiye verir misin?"
        }
        return self.run_test(
            "AI Coach Chat (Exercise)",
            "POST",
            "coach/chat",
            200,
            data=coach_data
        )

    def test_yoga_coach_chat(self):
        """Test yoga coach chat"""
        coach_data = {
            "user_id": self.test_user_id,
            "coach_type": "yoga",
            "user_message": "Başlangıç seviyesi yoga programı önerir misin?"
        }
        return self.run_test(
            "AI Coach Chat (Yoga)",
            "POST",
            "coach/chat",
            200,
            data=coach_data
        )

    def test_nutrition_coach_chat(self):
        """Test nutrition coach chat"""
        coach_data = {
            "user_id": self.test_user_id,
            "coach_type": "nutrition",
            "user_message": "Sağlıklı beslenme için öneriler verir misin?"
        }
        return self.run_test(
            "AI Coach Chat (Nutrition)",
            "POST",
            "coach/chat",
            200,
            data=coach_data
        )

    def test_analysis_coach_chat(self):
        """Test analysis coach chat"""
        coach_data = {
            "user_id": self.test_user_id,
            "coach_type": "match_analysis",
            "user_message": "Futbol maçı analizi yapabilir misin?"
        }
        return self.run_test(
            "AI Coach Chat (Analysis)",
            "POST",
            "coach/chat",
            200,
            data=coach_data
        )

    def test_get_coach_history(self):
        """Test getting coach chat history"""
        return self.run_test(
            "Get Coach History",
            "GET",
            f"coach/history/{self.test_user_id}",
            200
        )

    def test_generate_yoga_program(self):
        """Test yoga program generation"""
        program_data = {
            "user_id": self.test_user_id,
            "program_name": "Sabah Yoga Rutini",
            "duration_minutes": 30,
            "difficulty": "beginner",
            "user_preferences": "Esneklik ve rahatlama odaklı"
        }
        return self.run_test(
            "Generate Yoga Program",
            "POST",
            "yoga/generate-program",
            200,
            data=program_data
        )

    def test_get_yoga_programs(self):
        """Test getting user's yoga programs"""
        return self.run_test(
            "Get User Yoga Programs",
            "GET",
            f"yoga/programs/{self.test_user_id}",
            200
        )

    def test_create_second_user(self):
        """Create second test user for social features"""
        user_data = {
            "firebase_uid": self.test_user_id2,
            "display_name": "Test User 2",
            "email": "test2@example.com",
            "bio": "Second test user for social testing"
        }
        return self.run_test(
            "Create Second User",
            "POST",
            "users",
            200,
            data=user_data
        )

    def test_follow_user(self):
        """Test following a user"""
        return self.run_test(
            "Follow User",
            "POST",
            f"follow/{self.test_user_id2}",
            200,
            params={"follower_id": self.test_user_id}
        )

    def test_check_following(self):
        """Test checking if following a user"""
        return self.run_test(
            "Check Following Status",
            "GET",
            f"follow/check/{self.test_user_id2}",
            200,
            params={"follower_id": self.test_user_id}
        )

    def test_get_followers(self):
        """Test getting followers list"""
        return self.run_test(
            "Get Followers",
            "GET",
            f"followers/{self.test_user_id2}",
            200
        )

    def test_get_following(self):
        """Test getting following list"""
        return self.run_test(
            "Get Following",
            "GET",
            f"following/{self.test_user_id}",
            200
        )

    def test_like_post(self):
        """Test liking a post"""
        if self.created_post_id:
            return self.run_test(
                "Like Post",
                "POST",
                f"posts/{self.created_post_id}/like",
                200,
                params={"user_id": self.test_user_id2}
            )
        else:
            self.log_test("Like Post", False, "No post created to like")
            return False, {}

    def test_check_liked(self):
        """Test checking if post is liked"""
        if self.created_post_id:
            return self.run_test(
                "Check Post Liked",
                "GET",
                f"posts/{self.created_post_id}/liked",
                200,
                params={"user_id": self.test_user_id2}
            )
        else:
            self.log_test("Check Post Liked", False, "No post created to check")
            return False, {}

    def test_create_comment(self):
        """Test creating a comment"""
        if self.created_post_id:
            comment_data = {
                "post_id": self.created_post_id,
                "user_id": self.test_user_id2,
                "user_name": "Test User 2",
                "content": "Great post! Test comment."
            }
            return self.run_test(
                "Create Comment",
                "POST",
                "comments",
                200,
                data=comment_data
            )
        else:
            self.log_test("Create Comment", False, "No post created to comment on")
            return False, {}

    def test_get_comments(self):
        """Test getting comments for a post"""
        if self.created_post_id:
            return self.run_test(
                "Get Comments",
                "GET",
                f"comments/{self.created_post_id}",
                200
            )
        else:
            self.log_test("Get Comments", False, "No post created to get comments for")
            return False, {}

    def test_create_conversation(self):
        """Test creating a conversation"""
        # Fix the API call format based on server.py
        url = f"{self.api_url}/conversations"
        headers = {'Content-Type': 'application/json'}
        params = {
            "participant1_id": self.test_user_id,
            "participant1_name": "Test User",
            "participant1_photo": "",
            "participant2_id": self.test_user_id2,
            "participant2_name": "Test User 2",
            "participant2_photo": ""
        }
        
        print(f"\n🔍 Testing Create Conversation...")
        print(f"   URL: {url}")
        
        try:
            response = requests.post(url, headers=headers, params=params, timeout=10)
            success = response.status_code == 200
            
            if success:
                self.log_test("Create Conversation", True)
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        self.created_conversation_id = response_data['id']
                    return True, response_data
                except:
                    return True, response.text
            else:
                details = f"Expected 200, got {response.status_code}. Response: {response.text[:200]}"
                self.log_test("Create Conversation", False, details)
                return False, {}

        except Exception as e:
            self.log_test("Create Conversation", False, f"Exception: {str(e)}")
            return False, {}

    def test_send_message(self):
        """Test sending a message"""
        if self.created_conversation_id:
            message_data = {
                "conversation_id": self.created_conversation_id,
                "sender_id": self.test_user_id,
                "sender_name": "Test User",
                "content": "Hello! This is a test message."
            }
            return self.run_test(
                "Send Message",
                "POST",
                "messages",
                200,
                data=message_data
            )
        else:
            self.log_test("Send Message", False, "No conversation created")
            return False, {}

    def test_get_conversations(self):
        """Test getting user conversations"""
        return self.run_test(
            "Get Conversations",
            "GET",
            "conversations",
            200,
            params={"user_id": self.test_user_id}
        )

    def test_get_messages(self):
        """Test getting messages from conversation"""
        if self.created_conversation_id:
            return self.run_test(
                "Get Messages",
                "GET",
                f"messages/{self.created_conversation_id}",
                200
            )
        else:
            self.log_test("Get Messages", False, "No conversation created")
            return False, {}

    def test_create_goal(self):
        """Test creating a goal"""
        goal_data = {
            "user_id": self.test_user_id,
            "goal_type": "fitness",
            "title": "Haftalık Koşu Hedefi",
            "description": "Haftada 3 kez koşu yapmak",
            "target_value": 3,
            "unit": "count"
        }
        success, response = self.run_test(
            "Create Goal",
            "POST",
            "goals",
            200,
            data=goal_data
        )
        if success and isinstance(response, dict) and 'id' in response:
            self.created_goal_id = response['id']
        return success, response

    def test_get_goals(self):
        """Test getting user goals"""
        return self.run_test(
            "Get User Goals",
            "GET",
            f"goals/{self.test_user_id}",
            200
        )

    def test_update_goal(self):
        """Test updating goal progress"""
        if self.created_goal_id:
            return self.run_test(
                "Update Goal Progress",
                "PUT",
                f"goals/{self.created_goal_id}",
                200,
                data={"current_value": 2}
            )
        else:
            self.log_test("Update Goal Progress", False, "No goal created")
            return False, {}

    def test_get_achievements(self):
        """Test getting user achievements"""
        return self.run_test(
            "Get User Achievements",
            "GET",
            f"achievements/{self.test_user_id}",
            200
        )

    def test_check_achievements(self):
        """Test checking and awarding achievements"""
        return self.run_test(
            "Check and Award Achievements",
            "POST",
            f"achievements/check/{self.test_user_id}",
            200
        )

    def test_generate_progress_report(self):
        """Test generating progress report"""
        return self.run_test(
            "Generate Progress Report",
            "POST",
            f"reports/generate/{self.test_user_id}",
            200,
            params={"report_type": "weekly"}
        )

    def test_get_reports(self):
        """Test getting user reports"""
        return self.run_test(
            "Get User Reports",
            "GET",
            f"reports/{self.test_user_id}",
            200
        )

    def test_analytics_stats(self):
        """Test getting analytics stats"""
        return self.run_test(
            "Get Analytics Stats",
            "GET",
            "analytics/stats",
            200
        )

    def test_user_analytics(self):
        """Test getting user analytics"""
        return self.run_test(
            "Get User Analytics",
            "GET",
            f"analytics/user/{self.test_user_id}",
            200
        )

    def test_notifications(self):
        """Test notification endpoints"""
        # Test getting notifications (may return 404 for non-existent user, which is expected)
        success, response = self.run_test(
            "Get Notifications",
            "GET",
            f"notifications/{self.test_user_id}",
            200
        )
        return success, response

    def test_notification_preferences(self):
        """Test notification preferences"""
        return self.run_test(
            "Get Notification Preferences",
            "GET",
            f"notifications/preferences/{self.test_user_id}",
            200
        )

    def run_all_tests(self):
        """Run comprehensive API tests for all Spor Ötesi features"""
        print("🚀 Starting Comprehensive Spor Ötesi API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        print(f"🔑 Test User ID: {self.test_user_id}")
        print("=" * 80)

        # 1. Basic API Health Check
        print("\n🏥 BASIC API HEALTH TESTS")
        print("-" * 40)
        self.test_root_endpoint()
        self.test_posts_feed_endpoint()
        
        # 2. Authentication & User Management
        print("\n👤 USER MANAGEMENT TESTS")
        print("-" * 40)
        self.test_create_user()
        self.test_create_second_user()
        success, user_data = self.run_test("Get User by Firebase UID", "GET", f"users/{self.test_user_id}", 200)
        self.test_search_users()
        
        # 3. Social Features (Follow/Unfollow)
        print("\n👥 SOCIAL FEATURES TESTS")
        print("-" * 40)
        self.test_follow_user()
        self.test_check_following()
        self.test_get_followers()
        self.test_get_following()
        
        # 4. Posts & Social Feed
        print("\n📝 POSTS & FEED TESTS")
        print("-" * 40)
        success, post_data = self.test_create_post()
        if success and isinstance(post_data, dict) and 'id' in post_data:
            self.created_post_id = post_data['id']
        
        self.run_test("Get User Posts", "GET", f"posts/user/{self.test_user_id}", 200)
        if self.created_post_id:
            self.run_test("Get Single Post", "GET", f"posts/{self.created_post_id}", 200)
        
        # 5. Likes & Comments
        print("\n❤️ LIKES & COMMENTS TESTS")
        print("-" * 40)
        self.test_like_post()
        self.test_check_liked()
        self.test_create_comment()
        self.test_get_comments()
        
        # 6. Activity Tracking
        print("\n🏃 ACTIVITY TRACKING TESTS")
        print("-" * 40)
        success, activity_data = self.test_create_activity()
        if success and isinstance(activity_data, dict) and 'id' in activity_data:
            self.created_activity_id = activity_data['id']
        
        self.test_get_activities()
        self.test_activity_stats()
        
        # 7. Sleep Tracking
        print("\n😴 SLEEP TRACKING TESTS")
        print("-" * 40)
        self.test_create_sleep_record()
        self.test_get_sleep_records()
        self.test_sleep_stats()
        
        # 8. AI Coach Features
        print("\n🤖 AI COACH TESTS")
        print("-" * 40)
        self.test_coach_chat()
        self.test_yoga_coach_chat()
        self.test_nutrition_coach_chat()
        self.test_analysis_coach_chat()
        self.test_get_coach_history()
        
        # 9. Yoga Program Generation
        print("\n🧘 YOGA PROGRAM TESTS")
        print("-" * 40)
        self.test_generate_yoga_program()
        self.test_get_yoga_programs()
        
        # 10. Messaging System
        print("\n💬 MESSAGING SYSTEM TESTS")
        print("-" * 40)
        self.test_create_conversation()
        self.test_send_message()
        self.test_get_conversations()
        self.test_get_messages()
        
        # 11. Goals & Achievements
        print("\n🎯 GOALS & ACHIEVEMENTS TESTS")
        print("-" * 40)
        self.test_create_goal()
        self.test_get_goals()
        self.test_update_goal()
        self.test_get_achievements()
        self.test_check_achievements()
        
        # 12. Analytics & Reports
        print("\n📊 ANALYTICS & REPORTS TESTS")
        print("-" * 40)
        self.test_generate_progress_report()
        self.test_get_reports()
        self.test_analytics_stats()
        self.test_user_analytics()
        
        # 13. AI Analysis
        print("\n🔍 AI ANALYSIS TESTS")
        print("-" * 40)
        self.test_ai_analysis()
        
        # 14. Notifications
        print("\n🔔 NOTIFICATION TESTS")
        print("-" * 40)
        self.test_notifications()
        self.test_notification_preferences()

        # Print comprehensive summary
        print("\n" + "=" * 80)
        print(f"📊 COMPREHENSIVE TEST SUMMARY")
        print(f"📈 Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"📉 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        print("=" * 80)
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED! Backend is fully functional.")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed. Check details above.")
            return 1

def main():
    tester = SporOtesiAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())