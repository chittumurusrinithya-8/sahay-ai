from openai import OpenAI
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
import torch
from transformers import BertTokenizer, BertForSequenceClassification
import pickle
from deep_translator import GoogleTranslator

from config import MONGO_URI, EMAIL_ADDRESS, EMAIL_PASSWORD

# =========================================================
# APP SETUP
# =========================================================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client_ai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# =========================================================
# DATABASE
# =========================================================
client = MongoClient(MONGO_URI)
db = client["sahayDB"]

users_col = db["users"]
complaints_col = db["complaints"]

print("✅ MongoDB connected successfully")

# =========================================================
# MODEL
# =========================================================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

tokenizer = BertTokenizer.from_pretrained("./bert_department_model")
model = BertForSequenceClassification.from_pretrained("./bert_department_model")

model.to(device)
model.eval()

with open("label_encoder.pkl", "rb") as f:
    label_encoder = pickle.load(f)

print("✅ BERT model loaded successfully")

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

def predict_department(text):
    try:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)

        predicted_class_id = torch.argmax(outputs.logits, dim=1).item()
        return label_encoder.inverse_transform([predicted_class_id])[0]
    except:
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

        # ✅ Convert lat/lng safely
        lat = float(lat) if lat not in [None, "", "null"] else None
        lng = float(lng) if lng not in [None, "", "null"] else None

        if not username or not input_text:
            return jsonify({"error": "Missing complaint fields"}), 400

        # ✅ Translation
        processed_text = translate_to_english(input_text) if language == "te-IN" else input_text

        # ✅ Department prediction
        department = predict_department(processed_text)
        normalized_dept = normalize_department(department)

        complaint_id = f"CMP-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

        # ✅ Store complaint
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

        # =====================================================
        # ✅ SEND EMAIL ON REGISTRATION (FIX ADDED)
        # =====================================================
        user = users_col.find_one({"username": username})

        if user and user.get("email"):
            send_email(
                user["email"],
                "Complaint Registered Successfully",
                f"""
Hello {username},

Your complaint has been successfully registered.

Complaint ID: {complaint_id}
Department: {department}
Status: Pending

We will update you once the issue is resolved.

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
# UPDATE STATUS + EMAIL 🔥
# =========================================================
@app.route("/complaint/update", methods=["PUT"])
def update_complaint_status():
    try:
        data = request.get_json()

        complaint_id = data.get("complaintId")
        new_status = data.get("status")

        complaint = complaints_col.find_one({"complaintId": complaint_id})

        if not complaint:
            return jsonify({"error": "Complaint not found"}), 404

        complaints_col.update_one(
            {"complaintId": complaint_id},
            {"$set": {"status": new_status}}
        )

        username = complaint.get("username")
        user = users_col.find_one({"username": username})

        if user and user.get("email"):
            send_email(
                user["email"],
                "Complaint Status Updated",
                f"""
Hello {username},

Your complaint status has been updated.

Complaint ID: {complaint_id}

Issue:
{complaint.get("original_text")}

New Status: {new_status}

Thank you,
SahayAI
"""
            )

        return jsonify({"message": "Status updated"}), 200

    except Exception as e:
        print("❌ Update error:", e)
        return jsonify({"error": str(e)}), 500

# =========================================================
# USER COMPLAINTS
# =========================================================
@app.route("/complaints/user/<username>", methods=["GET"])
def get_user_complaints(username):
    complaints = list(
        complaints_col.find({"username": username}, {"_id": 0})
    )
    return jsonify(complaints)

# =========================================================
# DEPARTMENT COMPLAINTS
# =========================================================
@app.route("/complaints/department/<dept>", methods=["GET"])
def get_department_complaints(dept):
    dept = dept.strip().lower()

    complaints = list(
        complaints_col.find(
            {"department_normalized": dept},
            {"_id": 0}
        ).sort("time", -1)
    )

    return jsonify(complaints)
@app.route("/admin/stats", methods=["GET"])
def get_admin_stats():
    try:
        total_filing = complaints_col.count_documents({})
        pending_review = complaints_col.count_documents({"status": "Pending"})
        resolved_cases = complaints_col.count_documents({"status": "Resolved"})
        
        # Calculate cases submitted today
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        live_today = complaints_col.count_documents({"time": {"$gte": today_start}})

        return jsonify({
            "total": total_filing,
            "pending": pending_review,
            "resolved": resolved_cases,
            "today": live_today
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# =========================================================
# RUN
# =========================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)