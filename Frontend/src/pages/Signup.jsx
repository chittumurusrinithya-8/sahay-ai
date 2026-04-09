import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Mail, Phone, MapPin, Lock, UserPlus, ArrowLeft, ChevronRight } from "lucide-react";
import logo from "./Logo.jpeg";   // ✅ ADDED (correct path)

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    mobile: "",
    email: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.mobile.length !== 10) return alert("Mobile must be 10 digits");
    if (formData.password !== formData.confirmPassword) return alert("Passwords do not match");

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:5000/signup", {
        username: formData.username,
        mobile: formData.mobile,
        email: formData.email,
        location: formData.location,
        password: formData.password,
      });
      alert(res.data.message || "Signup successful!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --primary: #2563eb;
          --primary-hover: #1d4ed8;
          --bg: #f8fafc;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --white: #ffffff;
          --border: #e2e8f0;
          --inner-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.04);
        }

        .signup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg);
          background-image: radial-gradient(#cbd5e1 0.7px, transparent 0.7px);
          background-size: 30px 30px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 20px;
        }

        .signup-card {
          background: var(--white);
          width: 100%;
          max-width: 480px;
          padding: 40px;
          border-radius: 32px;
          border: 1px solid var(--border);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .back-btn {
          position: absolute;
          top: 25px;
          left: 25px;
          background: white;
          border: 1px solid var(--border);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .back-btn:hover {
          color: var(--primary);
          transform: translateX(-3px);
          border-color: var(--primary);
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-box {
          width: 60px;
          height: 60px;
          margin: 0 auto 15px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .logo-box img { width: 35px; }

        .title { font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin: 0; }
        .subtitle { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

        .input-group {
          position: relative;
          margin-bottom: 18px;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-group input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 14px;
          font-size: 0.95rem;
          color: var(--text-main);
          box-shadow: var(--inner-shadow);
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .footer-text {
          text-align: center;
          margin-top: 25px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .footer-text span {
          color: var(--primary);
          font-weight: 700;
          cursor: pointer;
          margin-left: 5px;
        }
      `}</style>

      <div className="signup-card">
        <button className="back-btn" onClick={() => navigate("/login")}>
          <ArrowLeft size={20} />
        </button>

        <div className="header">
          <div className="logo-box">
            <img src={logo} alt="SahaayAI" />   {/* ✅ FIXED */}
          </div>
          <h1 className="title">SahaayAI</h1>
          <p className="subtitle">Create your secure account</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <div className="input-icon"><User size={19} /></div>
            <input name="username" type="text" placeholder="Username" value={formData.username} onChange={handleChange} required />
          </div>

          <div className="input-row">
            <div className="input-group">
              <div className="input-icon"><Phone size={19} /></div>
              <input name="mobile" type="tel" placeholder="Mobile" value={formData.mobile} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <div className="input-icon"><MapPin size={19} /></div>
              <input name="location" type="text" placeholder="Location" value={formData.location} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon"><Mail size={19} /></div>
            <input name="email" type="email" placeholder="Email ID (Optional)" value={formData.email} onChange={handleChange} />
          </div>

          <div className="input-group">
            <div className="input-icon"><Lock size={19} /></div>
            <input name="password" type="password" placeholder="Set Password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <div className="input-icon"><Lock size={19} /></div>
            <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
            {!loading && <ChevronRight size={20} />}
          </button>
        </form>

        <p className="footer-text">
          Already have an account? 
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;