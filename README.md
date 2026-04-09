# 🚀 Sahaay AI – Smart Grievance Redressal System

##Overview

**Sahaay AI** is an intelligent, AI-powered grievance redressal system designed to simplify the process of reporting, categorizing, and tracking public complaints. The system leverages Natural Language Processing (NLP), geolocation, and automation to route complaints to the appropriate departments efficiently.

---

##  Problem Statement

Traditional complaint systems are:

* Manual and slow
* Lack proper categorization
* Do not support multilingual input
* Provide poor tracking and transparency

---

##  Proposed Solution

Sahaay AI solves these issues by:

* Automatically analyzing complaints using AI
* Assigning them to the correct department
* Capturing user location for better resolution
* Providing real-time tracking and updates

---

## ✨ Key Features

###  AI-Based Complaint Classification

* Uses NLP to understand complaint text
* Automatically assigns department (Water, Road, Electricity, etc.)

###  Multilingual Support

* Supports Telugu and English
* Automatically translates complaints to English

###  Location Tracking

* Captures latitude and longitude using Geolocation API
* Helps authorities locate issues precisely

###  Voice Input Support

* Users can submit complaints using speech

###  Admin Dashboard

* View all complaints
* Monitor status and department-wise data

###  Department Pages

* Each department sees only relevant complaints

###  Complaint History

* Users can track their submitted complaints

###  Email Notifications

* Sends confirmation emails after complaint submission

---

##  System Architecture

Frontend → Backend → Database
User → React UI → Flask API → MongoDB

---

##  Tech Stack

### Frontend

* React.js
* HTML, CSS, JavaScript

### Backend

* Flask (Python)
* REST APIs

### Database

* MongoDB Atlas

### AI & NLP

* Text processing & rule-based classification

### Other Tools

* Google Maps API (location)
* Speech-to-Text API
* SMTP (Email service)

---

##  Installation & Setup

### 1️ Clone the Repository

```bash
git clone https://github.com/your-username/sahay-ai.git
cd sahay-ai
```

---

### 2️⃣ Backend Setup

```bash
cd Backend
pip install -r requirements.txt
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_uri
EMAIL_ADDRESS=your_email
EMAIL_PASSWORD=your_password
OPENAI_API_KEY=your_openai_key
```

Run backend:

```bash
python app.py
```

---

### 3️⃣ Frontend Setup

```bash
cd Frontend
npm install
npm start
```

---

##  API Endpoints (Core)

| Endpoint     | Method | Description      |
| ------------ | ------ | ---------------- |
| `/signup`    | POST   | Register user    |
| `/login`     | POST   | Login user       |
| `/complaint` | POST   | Submit complaint |

---

##  Workflow

1. User submits complaint (text/voice)
2. System processes and translates input
3. AI predicts department
4. Complaint stored in database
5. Email sent to user
6. Admin & departments view complaints

---
<img width="1919" height="1017" alt="Screenshot 2026-03-27 202147" src="https://github.com/user-attachments/assets/446e6360-86f7-4f05-a836-e9967e6c15d5" />
<img width="1918" height="1012" alt="Screenshot 2026-03-27 202454" src="https://github.com/user-attachments/assets/eb9231f4-c1a1-4316-9176-c5c060414073" />

---

##  Deployment

* Backend:  Render
* Frontend: Vercel 
* Database: MongoDB Atlas

---

##  Security Practices

* API keys stored in `.env`
* `.env` excluded using `.gitignore`
* Passwords hashed using bcrypt

---

##  Future Enhancements

* Real-time complaint tracking
* Mobile app integration
* Advanced AI model (BERT)
* Priority-based complaint handling
* SMS notifications

---

##  Author

**Sri Nithya Chittumuru**
B.E CSE (Data Science)

---

##  Achievements

* AI-based real-world problem solving
* Full-stack implementation
* Integration of multiple technologies (AI + Web + Cloud)

---

##  Conclusion

Sahaay AI improves public service systems by making complaint handling faster, smarter, and more transparent using AI and modern web technologies.

---

⭐ *If you like this project, give it a star on GitHub!*
