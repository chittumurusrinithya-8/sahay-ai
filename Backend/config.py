import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ================= MONGODB =================
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError("❌ MONGO_URI not found. Please check your .env file.")

# ================= EMAIL CONFIG =================
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
    raise RuntimeError("❌ EMAIL credentials not found. Please check your .env file.")

# Optional: Print confirmation (useful for debugging)
print("Environment variables loaded successfully")
