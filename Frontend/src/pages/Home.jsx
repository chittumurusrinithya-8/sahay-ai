import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./Logo.jpeg";   // ✅ FIXED PATH

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        
        {/* ✅ LOGO */}
        <img src={logo} alt="logo" style={styles.logo} className="fade-in" />

        <h1 style={styles.title} className="fade-in">
          SahaayAI
        </h1>

        <p style={styles.quote} className="slide-up">
          “Empowering citizens through intelligent grievance redressal”
        </p>
      </div>

      <style>{`
        .fade-in {
          animation: fadeIn 2s ease-in-out;
        }

        .slide-up {
          animation: slideUp 2s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: "url('/home_bg.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, sans-serif",
  },
  overlay: {
    background: "rgba(0, 0, 0, 0.55)",
    padding: "60px 80px",
    borderRadius: 16,
    textAlign: "center",
    color: "#fff",
    backdropFilter: "blur(6px)",
  },
  logo: {
    width: "90px",
    height: "90px",
    objectFit: "cover",
    borderRadius: "20px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "48px",
    fontWeight: "700",
    marginBottom: "16px",
  },
  quote: {
    fontSize: "20px",
    fontStyle: "italic",
    opacity: 0.95,
  },
};

export default Home;