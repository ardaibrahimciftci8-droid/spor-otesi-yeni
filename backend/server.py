from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import cloudinary
import cloudinary.uploader
import aiohttp

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ===================== MODELS =====================

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    firebase_uid: str
    display_name: str
    email: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = ""
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfileCreate(BaseModel):
    firebase_uid: str
    display_name: str
    email: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = ""

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None

class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_photo: Optional[str] = None
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    likes_count: int = 0
    comments_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PostCreate(BaseModel):
    user_id: str
    user_name: str
    user_photo: Optional[str] = None
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None

class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    user_id: str
    user_name: str
    user_photo: Optional[str] = None
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommentCreate(BaseModel):
    post_id: str
    user_id: str
    user_name: str
    user_photo: Optional[str] = None
    content: str

class Follow(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    follower_id: str
    following_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Like(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    participants: List[str]
    participant_names: List[str]
    participant_photos: List[str]
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_photo: Optional[str] = None
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(BaseModel):
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_photo: Optional[str] = None
    content: str

class Activity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    activity_type: str
    duration_minutes: int
    distance_km: Optional[float] = None
    speed_kmh: Optional[float] = None
    calories_burned: Optional[int] = None
    notes: Optional[str] = None
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActivityCreate(BaseModel):
    user_id: str
    activity_type: str
    duration_minutes: int
    distance_km: Optional[float] = None
    speed_kmh: Optional[float] = None
    calories_burned: Optional[int] = None
    notes: Optional[str] = None
    date: Optional[datetime] = None

class SleepRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    sleep_start: datetime
    sleep_end: datetime
    duration_hours: float
    quality: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SleepRecordCreate(BaseModel):
    user_id: str
    sleep_start: datetime
    sleep_end: datetime
    quality: Optional[int] = None
    notes: Optional[str] = None

# ===================== HELPER FUNCTIONS =====================

def serialize_doc(doc):
    if doc is None:
        return None
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

# ===================== AI HELPER =====================

async def ask_ai(prompt: str) -> str:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'https://text.pollinations.ai/',
                json={
                    "messages": [
                        {"role": "system", "content": "Sen yardimci bir spor ve saglik asistanisin. Turkce cevap ver."},
                        {"role": "user", "content": prompt}
                    ],
                    "model": "openai",
                    "seed": 42
                },
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    return await response.text()
                return "AI servisi su anda kullanilamiyor."
    except Exception as e:
        logging.error(f"AI Error: {e}")
        return "AI baglanti hatasi olustu."

# ===================== ROUTES =====================

@api_router.get("/")
async def root():
    return {"message": "Spor Otesi API v1.0"}

# =============== USER ROUTES ===============

@api_router.post("/users", response_model=UserProfile)
async def create_or_update_user(user: UserProfileCreate):
    existing = await db.users.find_one({"firebase_uid": user.firebase_uid})
    
    if existing:
        await db.users.update_one(
            {"firebase_uid": user.firebase_uid},
            {"$set": {
                "display_name": user.display_name,
                "email": user.email,
                "photo_url": user.photo_url,
            }}
        )
        updated = await db.users.find_one({"firebase_uid": user.firebase_uid}, {"_id": 0})
        return serialize_doc(updated)
    
    user_obj = UserProfile(**user.model_dump())
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    return user_obj

@api_router.get("/users/{firebase_uid}")
async def get_user(firebase_uid: str):
    user = await db.users.find_one({"firebase_uid": firebase_uid}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_doc(user)

@api_router.get("/users/id/{user_id}")
async def get_user_by_id(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_doc(user)

@api_router.put("/users/{firebase_uid}")
async def update_user(firebase_uid: str, update: UserProfileUpdate):
    update_dict = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.users.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.users.find_one({"firebase_uid": firebase_uid}, {"_id": 0})
    return serialize_doc(user)

@api_router.get("/users/search/query")
async def search_users(q: str = Query(..., min_length=1)):
    users = await db.users.find(
        {"display_name": {"$regex": q, "$options": "i"}},
        {"_id": 0}
    ).limit(20).to_list(20)
    return [serialize_doc(u) for u in users]

# =============== FOLLOW ROUTES ===============

@api_router.post("/follow/{following_id}")
async def follow_user(following_id: str, follower_id: str = Query(...)):
    if follower_id == following_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    existing = await db.follows.find_one({
        "follower_id": follower_id,
        "following_id": following_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already following")
    
    follow = Follow(follower_id=follower_id, following_id=following_id)
    doc = follow.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.follows.insert_one(doc)
    
    await db.users.update_one({"firebase_uid": follower_id}, {"$inc": {"following_count": 1}})
    await db.users.update_one({"firebase_uid": following_id}, {"$inc": {"followers_count": 1}})
    
    return {"message": "Followed successfully"}

@api_router.delete("/follow/{following_id}")
async def unfollow_user(following_id: str, follower_id: str = Query(...)):
    result = await db.follows.delete_one({
        "follower_id": follower_id,
        "following_id": following_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not following this user")
    
    await db.users.update_one({"firebase_uid": follower_id}, {"$inc": {"following_count": -1}})
    await db.users.update_one({"firebase_uid": following_id}, {"$inc": {"followers_count": -1}})
    
    return {"message": "Unfollowed successfully"}

@api_router.get("/follow/check/{following_id}")
async def check_following(following_id: str, follower_id: str = Query(...)):
    existing = await db.follows.find_one({
        "follower_id": follower_id,
        "following_id": following_id
    })
    return {"is_following": existing is not None}

@api_router.get("/followers/{user_id}")
async def get_followers(user_id: str):
    follows = await db.follows.find({"following_id": user_id}, {"_id": 0}).to_list(1000)
    follower_ids = [f["follower_id"] for f in follows]
    followers = await db.users.find({"firebase_uid": {"$in": follower_ids}}, {"_id": 0}).to_list(1000)
    return [serialize_doc(f) for f in followers]

@api_router.get("/following/{user_id}")
async def get_following(user_id: str):
    follows = await db.follows.find({"follower_id": user_id}, {"_id": 0}).to_list(1000)
    following_ids = [f["following_id"] for f in follows]
    following = await db.users.find({"firebase_uid": {"$in": following_ids}}, {"_id": 0}).to_list(1000)
    return [serialize_doc(f) for f in following]

# =============== POST ROUTES ===============

@api_router.post("/posts", response_model=Post)
async def create_post(post: PostCreate):
    post_obj = Post(**post.model_dump())
    doc = post_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.posts.insert_one(doc)
    
    await db.users.update_one({"firebase_uid": post.user_id}, {"$inc": {"posts_count": 1}})
    
    return post_obj

@api_router.get("/posts/feed")
async def get_feed(user_id: str = Query(None), skip: int = 0, limit: int = 20):
    if user_id:
        follows = await db.follows.find({"follower_id": user_id}).to_list(1000)
        following_ids = [f["following_id"] for f in follows]
        following_ids.append(user_id)
        
        posts = await db.posts.find(
            {"user_id": {"$in": following_ids}},
            {"_id": 0}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    else:
        posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return [serialize_doc(p) for p in posts]

@api_router.get("/posts/user/{user_id}")
async def get_user_posts(user_id: str, skip: int = 0, limit: int = 20):
    posts = await db.posts.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [serialize_doc(p) for p in posts]

@api_router.get("/posts/{post_id}")
async def get_post(post_id: str):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return serialize_doc(post)

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user_id: str = Query(...)):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.posts.delete_one({"id": post_id})
    await db.users.update_one({"firebase_uid": user_id}, {"$inc": {"posts_count": -1}})
    
    return {"message": "Post deleted"}

# =============== LIKE ROUTES ===============

@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, user_id: str = Query(...)):
    existing = await db.likes.find_one({"post_id": post_id, "user_id": user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Already liked")
    
    like = Like(post_id=post_id, user_id=user_id)
    doc = like.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.likes.insert_one(doc)
    
    await db.posts.update_one({"id": post_id}, {"$inc": {"likes_count": 1}})
    
    return {"message": "Liked"}

@api_router.delete("/posts/{post_id}/like")
async def unlike_post(post_id: str, user_id: str = Query(...)):
    result = await db.likes.delete_one({"post_id": post_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Like not found")
    
    await db.posts.update_one({"id": post_id}, {"$inc": {"likes_count": -1}})
    
    return {"message": "Unliked"}

@api_router.get("/posts/{post_id}/liked")
async def check_liked(post_id: str, user_id: str = Query(...)):
    existing = await db.likes.find_one({"post_id": post_id, "user_id": user_id})
    return {"is_liked": existing is not None}

# =============== COMMENT ROUTES ===============

@api_router.post("/comments", response_model=Comment)
async def create_comment(comment: CommentCreate):
    comment_obj = Comment(**comment.model_dump())
    doc = comment_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.comments.insert_one(doc)
    
    await db.posts.update_one({"id": comment.post_id}, {"$inc": {"comments_count": 1}})
    
    return comment_obj

@api_router.get("/comments/{post_id}")
async def get_comments(post_id: str, skip: int = 0, limit: int = 50):
    comments = await db.comments.find(
        {"post_id": post_id},
        {"_id": 0}
    ).sort("created_at", 1).skip(skip).limit(limit).to_list(limit)
    return [serialize_doc(c) for c in comments]

# =============== CONVERSATION/MESSAGING ROUTES ===============

@api_router.post("/conversations")
async def create_or_get_conversation(participant1_id: str, participant1_name: str, participant1_photo: str = "", 
                                      participant2_id: str = Query(...), participant2_name: str = Query(...), 
                                      participant2_photo: str = Query("")):
    existing = await db.conversations.find_one({
        "participants": {"$all": [participant1_id, participant2_id]}
    }, {"_id": 0})
    
    if existing:
        return serialize_doc(existing)
    
    conv = Conversation(
        participants=[participant1_id, participant2_id],
        participant_names=[participant1_name, participant2_name],
        participant_photos=[participant1_photo, participant2_photo]
    )
    doc = conv.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc['last_message_time']:
        doc['last_message_time'] = doc['last_message_time'].isoformat()
    await db.conversations.insert_one(doc)
    
    return conv.model_dump()

@api_router.get("/conversations")
async def get_conversations(user_id: str = Query(...)):
    conversations = await db.conversations.find(
        {"participants": user_id},
        {"_id": 0}
    ).sort("last_message_time", -1).to_list(100)
    return [serialize_doc(c) for c in conversations]

@api_router.post("/messages", response_model=Message)
async def send_message(message: MessageCreate):
    msg_obj = Message(**message.model_dump())
    doc = msg_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.messages.insert_one(doc)
    
    await db.conversations.update_one(
        {"id": message.conversation_id},
        {"$set": {
            "last_message": message.content[:50],
            "last_message_time": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return msg_obj

@api_router.get("/messages/{conversation_id}")
async def get_messages(conversation_id: str, skip: int = 0, limit: int = 100):
    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("created_at", 1).skip(skip).limit(limit).to_list(limit)
    return [serialize_doc(m) for m in messages]

# =============== ACTIVITY TRACKING ROUTES ===============

@api_router.post("/activities", response_model=Activity)
async def create_activity(activity: ActivityCreate):
    activity_dict = activity.model_dump()
    if activity_dict.get('date') is None:
        activity_dict['date'] = datetime.now(timezone.utc)
    
    activity_obj = Activity(**activity_dict)
    doc = activity_obj.model_dump()
    doc['date'] = doc['date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.activities.insert_one(doc)
    
    return activity_obj

@api_router.get("/activities/{user_id}")
async def get_activities(user_id: str, skip: int = 0, limit: int = 50):
    activities = await db.activities.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("date", -1).skip(skip).limit(limit).to_list(limit)
    return [serialize_doc(a) for a in activities]

@api_router.get("/activities/{user_id}/stats")
async def get_activity_stats(user_id: str, days: int = 7):
    from datetime import timedelta
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    activities = await db.activities.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(1000)
    
    recent_activities = []
    for a in activities:
        if isinstance(a.get('date'), str):
            activity_date = datetime.fromisoformat(a['date'].replace('Z', '+00:00'))
        else:
            activity_date = a.get('date', datetime.now(timezone.utc))
        if activity_date >= cutoff_date:
            recent_activities.append(a)
    
    total_duration = sum(a.get('duration_minutes', 0) for a in recent_activities)
    total_distance = sum(a.get('distance_km', 0) or 0 for a in recent_activities)
    total_calories = sum(a.get('calories_burned', 0) or 0 for a in recent_activities)
    
    return {
        "period_days": days,
        "total_activities": len(recent_activities),
        "total_duration_minutes": total_duration,
        "total_distance_km": round(total_distance, 2),
        "total_calories_burned": total_calories,
        "activities_by_type": {}
    }

@api_router.delete("/activities/{activity_id}")
async def delete_activity(activity_id: str, user_id: str = Query(...)):
    activity = await db.activities.find_one({"id": activity_id})
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    if activity["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.activities.delete_one({"id": activity_id})
    return {"message": "Activity deleted"}

# =============== SLEEP TRACKING ROUTES ===============

@api_router.post("/sleep", response_model=SleepRecord)
async def create_sleep_record(record: SleepRecordCreate):
    duration = (record.sleep_end - record.sleep_start).total_seconds() / 3600
    
    sleep_obj = SleepRecord(
        **record.model_dump(),
        duration_hours=round(duration, 2)
    )
    doc = sleep_obj.model_dump()
    doc['sleep_start'] = doc['sleep_start'].isoformat()
    doc['sleep_end'] = doc['sleep_end'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.sleep_records.insert_one(doc)
    
    return sleep_obj

@api_router.get("/sleep/{user_id}")
async def get_sleep_records(user_id: str, skip: int = 0, limit: int = 30):
    records = await db.sleep_records.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("sleep_start", -1).skip(skip).limit(limit).to_list(limit)
    return [serialize_doc(r) for r in records]

@api_router.get("/sleep/{user_id}/stats")
async def get_sleep_stats(user_id: str, days: int = 7):
    from datetime import timedelta
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    records = await db.sleep_records.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(1000)
    
    recent_records = []
    for r in records:
        if isinstance(r.get('sleep_start'), str):
            sleep_date = datetime.fromisoformat(r['sleep_start'].replace('Z', '+00:00'))
        else:
            sleep_date = r.get('sleep_start', datetime.now(timezone.utc))
        if sleep_date >= cutoff_date:
            recent_records.append(r)
    
    if not recent_records:
        return {
            "period_days": days,
            "total_records": 0,
            "average_duration_hours": 0,
            "average_quality": 0
        }
    
    total_duration = sum(r.get('duration_hours', 0) for r in recent_records)
    qualities = [r.get('quality', 0) for r in recent_records if r.get('quality')]
    
    return {
        "period_days": days,
        "total_records": len(recent_records),
        "average_duration_hours": round(total_duration / len(recent_records), 2),
        "average_quality": round(sum(qualities) / len(qualities), 1) if qualities else 0
    }

# =============== AI ANALYSIS ROUTES ===============

@api_router.post("/ai/analyze-activity")
async def analyze_activity(user_id: str = Query(...)):
    activities = await db.activities.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("date", -1).limit(20).to_list(20)
    
    sleep_records = await db.sleep_records.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("sleep_start", -1).limit(10).to_list(10)
    
    if not activities and not sleep_records:
        return {"analysis": "Henuz yeterli veri yok. Aktivitelerinizi ve uyku duzeninizi kaydetmeye baslayin!"}
    
    activity_summary = []
    for a in activities[:10]:
        activity_summary.append(f"- {a.get('activity_type', 'Aktivite')}: {a.get('duration_minutes', 0)} dk, {a.get('distance_km', 0)} km")
    
    sleep_summary = []
    for s in sleep_records[:7]:
        sleep_summary.append(f"- {s.get('duration_hours', 0)} saat uyku, kalite: {s.get('quality', 'belirtilmemis')}/5")
    
    prompt = f"""
    Bir spor ve saglik uzmani olarak, asagidaki verileri analiz et ve kisiye ozel oneriler sun:
    
    Son Aktiviteler:
    {chr(10).join(activity_summary) if activity_summary else 'Aktivite kaydi yok'}
    
    Son Uyku Kayitlari:
    {chr(10).join(sleep_summary) if sleep_summary else 'Uyku kaydi yok'}
    
    Lutfen sunlari degerlendir:
    1. Genel aktivite duzeyi
    2. Uyku kalitesi ve suresi
    3. Iyilestirme onerileri
    4. Motivasyon mesaji
    
    Turkce ve samimi bir dille yaz.
    """
    
    analysis = await ask_ai(prompt)
    return {"analysis": analysis}

# =============== UPLOAD ROUTES ===============

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = cloudinary.uploader.upload(
            contents,
            folder="sporotesi",
            resource_type="image"
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }
    except Exception as e:
        logging.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/upload/video")
async def upload_video(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = cloudinary.uploader.upload(
            contents,
            folder="sporotesi",
            resource_type="video"
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }
    except Exception as e:
        logging.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
