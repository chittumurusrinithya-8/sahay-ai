from dotenv import load_dotenv
import os

# =========================================================
# LOAD ENV VARIABLES
# =========================================================
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
SPEECH_API_KEY = os.getenv("SPEECH_API_KEY")

# =========================================================
# IMPORTS
# =========================================================
from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from deep_translator import GoogleTranslator

# =========================================================
# APP SETUP
# =========================================================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client_ai = OpenAI(api_key=OPENAI_API_KEY)

# =========================================================
# DATABASE
# =========================================================
client = MongoClient(MONGO_URI)
db = client["sahayDB"]

users_col = db["users"]
complaints_col = db["complaints"]

print("✅ MongoDB connected successfully")

# =========================================================
# TRANSLATION
# =========================================================
def translate_to_english(text):
    try:
        return GoogleTranslator(source='auto', target='en').translate(text)
    except:
        return text

# =========================================================
# HELPERS
# =========================================================
def normalize_department(name):
    return name.strip().lower().replace("department", "").strip()

# 🔥 SIMPLE FALLBACK MODEL (NO BERT)
def predict_department(text):
    text = text.lower()

    if "water" in text:
        return "Water Department"
    elif "road" in text or "pothole" in text:
        return "Road Department"
    elif "electric" in text or "power" in text:
        return "Electricity Department"
    else:
        return "General"

# =========================================================
# EMAIL FUNCTION
# =========================================================
def send_email(to_email, subject, body):
    try:
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = to_email

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, to_email, msg.as_string())

        print("📧 Email sent successfully")

    except Exception as e:
        print("❌ Email error:", e)

# =========================================================
# HEALTH CHECK
# =========================================================
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Backend is running ✅"})

# =========================================================
# SIGNUP
# =========================================================
@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()

        username = data.get("username")
        password = data.get("password")
        mobile = data.get("mobile")
        location = data.get("location")
        email = data.get("email")

        if not all([username, password, mobile, location, email]):
            return jsonify({"error": "Missing fields"}), 400

        if users_col.find_one({"username": username}):
            return jsonify({"error": "User already exists"}), 400

        hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

        users_col.insert_one({
            "username": username,
            "password": hashed_pw,
            "mobile": mobile,
            "location": location,
            "email": email,
            "role": "user"
        })

        return jsonify({"message": "Signup successful"}), 201

    except Exception as e:
        print("❌ Signup error:", e)
        return jsonify({"error": "Signup failed"}), 500

# =========================================================
# LOGIN
# =========================================================
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        username = data.get("username")
        password = data.get("password")
        role = data.get("role")

        user = users_col.find_one({"username": username, "role": role})

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.checkpw(password.encode(), user["password"]):
            return jsonify({"error": "Incorrect password"}), 401

        return jsonify({
            "message": "Login successful",
            "username": username,
            "role": role
        })

    except Exception as e:
        print("❌ Login error:", e)
        return jsonify({"error": "Login failed"}), 500

# =========================================================
# SUBMIT COMPLAINT
# =========================================================
@app.route("/complaint", methods=["POST"])
def submit_complaint():
    try:
        data = request.get_json(silent=True) or request.form

        username = data.get("username")
        input_text = data.get("text")
        language = data.get("language", "en")

        lat = data.get("lat")
        lng = data.get("lng")
        location = data.get("location")

        lat = float(lat) if lat not in [None, "", "null"] else None
        lng = float(lng) if lng not in [None, "", "null"] else None

        if not username or not input_text:
            return jsonify({"error": "Missing complaint fields"}), 400

        processed_text = translate_to_english(input_text) if language == "te-IN" else input_text

        department = predict_department(processed_text)
        normalized_dept = normalize_department(department)

        complaint_id = f"CMP-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

        complaints_col.insert_one({
            "complaintId": complaint_id,
            "username": username,
            "original_text": input_text,
            "text": processed_text,
            "language": language,
            "lat": lat,
            "lng": lng,
            "location": location,
            "department": department,
            "department_normalized": normalized_dept,
            "status": "Pending",
            "time": datetime.utcnow()
        })

        user = users_col.find_one({"username": username})

        if user and user.get("email"):
            send_email(
                user["email"],
                "Complaint Registered Successfully",
                f"""
Hello {username},

Complaint ID: {complaint_id}
Department: {department}
Status: Pending

Thank you,
Sahay Team
"""
            )

        return jsonify({
            "message": "Complaint submitted successfully",
            "complaintId": complaint_id
        }), 201

    except Exception as e:
        print("❌ Complaint error:", e)
        return jsonify({"error": str(e)}), 500

# =========================================================
# RUN
# =========================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)