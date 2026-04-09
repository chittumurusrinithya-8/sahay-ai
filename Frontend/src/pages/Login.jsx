import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Lock, ShieldCheck, Building2, ChevronRight } from "lucide-react";
import logo from "./Logo.jpeg";

function Login() {
  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setUsername("");
    setPassword("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:5000/login", {
        username: username.trim(),
        password,
        role
      });

      const data = res.data;
      localStorage.clear();
      sessionStorage.clear();

      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      if (data.role === "department") {
        const dept = data.department || data.username;
        localStorage.setItem("department", dept);
        navigate("/department");
      } 
      else if (data.role === "admin") {
        navigate("/admin");
      } 
      else {
        navigate("/submit");
      }

    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Check credentials.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        /* ✅ CRITICAL FIX: Stops inputs from going out of bounds */
        .login-wrapper * {
          box-sizing: border-box;
        }

        :root {
          --bg: #f8fafc;
          --card: #ffffff;
          --primary: #2563eb;
          --text-dark: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
        }

        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg);
          background-image: radial-gradient(#cbd5e1 0.5px, transparent 0.5px);
          background-size: 24px 24px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 20px;
        }

        .login-card {
          background: var(--card);
          padding: 40px;
          border-radius: 28px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--border);
          text-align: center;
        }

        .logo-box {
          width: 75px;
          height: 75px;
          margin: 0 auto 16px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          box-shadow: 0 6px 14px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .logo-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .brand-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-dark);
          margin: 0;
        }

        .brand-tagline {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 24px;
          margin-top: 5px;
        }

        .role-tabs {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
          margin-bottom: 24px;
          width: 100%;
        }

        .role-tabs button {
          flex: 1;
          border: none;
          background: none;
          padding: 10px 5px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          border-radius: 9px;
          transition: 0.2s;
        }

        .role-tabs button.active {
          background: white;
          color: var(--primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .input-box {
          position: relative;
          margin-bottom: 16px;
          width: 100%;
          text-align: left;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-box input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          border-radius: 14px;
          border: 1px solid var(--border);
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-box input:focus {
          border-color: var(--primary);
        }

        .btn-submit {
          width: 100%;
          padding: 14px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s;
        }

        .btn-submit:hover {
          opacity: 0.9;
        }

        .btn-submit:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .signup-prompt {
          margin-top: 24px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .signup-link {
          color: var(--primary);
          font-weight: 700;
          cursor: pointer;
          margin-left: 5px;
        }

        .signup-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="login-card">
        <div className="logo-box">
          <img src={logo} alt="logo" />
        </div>

        <h1 className="brand-title">SahaayAI</h1>
        <p className="brand-tagline">Login to continue</p>

        <div className="role-tabs">
          <button className={role === "user" ? "active" : ""} onClick={() => handleRoleChange("user")}>
            <User size={14} /> User
          </button>
          <button className={role === "department" ? "active" : ""} onClick={() => handleRoleChange("department")}>
            <Building2 size={14} /> Dept
          </button>
          <button className={role === "admin" ? "active" : ""} onClick={() => handleRoleChange("admin")}>
            <ShieldCheck size={14} /> Admin
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-box">
            <div className="input-icon"><User size={18} /></div>
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div className="input-box">
            <div className="input-icon"><Lock size={18} /></div>
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Sign In"}
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>

        {role === "user" && (
          <div className="signup-prompt">
            Don't have an account?
            <span className="signup-link" onClick={() => navigate("/signup")}>
              Create one
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;