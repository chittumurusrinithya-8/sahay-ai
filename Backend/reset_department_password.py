from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["sahayDB"]
users_col = db["users"]

# Standard password for all depts
DEPT_PASSWORD = "dept123"
hashed_pw = bcrypt.hashpw(DEPT_PASSWORD.encode('utf-8'), bcrypt.gensalt())

# List of your specific usernames from the image
departments = [
    "veterinary_dept", 
    "engineering_dept", 
    "electrical_dept", 
    "food_safety_dept", 
    "sanitation_dept", 
    "town_planning_dept", 
    "disaster_dept"
]

for dept in departments:
    users_col.update_one(
        {"username": dept},
        {"$set": {
            "password": hashed_pw, # This will now store as a standard string/binary hash
            "role": "department",
            "active": True
        }}
    )
    print(f"✅ Reset: {dept}")