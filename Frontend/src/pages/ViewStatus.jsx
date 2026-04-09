import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ViewStatus() {
  const navigate = useNavigate();

  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [complaints, setComplaints] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH FUNCTION =================
  const fetchComplaints = useCallback(async () => {
    if (!username) return;

    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/complaints/user/${username}`
      );
      setComplaints(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [username]);

  // ================= MAIN EFFECT =================
  useEffect(() => {
    fetchComplaints();

    const interval = setInterval(() => {
      fetchComplaints();
    }, 5000);

    // ✅ Listen when new complaint is submitted
    const handleStorage = () => fetchComplaints();
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchComplaints]);

  const toggleComplaint = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>👤</div>
            <div>
              <div style={styles.title}>{username}</div>
              <div style={styles.subtitle}>Your Complaints</div>
            </div>
          </div>

          <button
            style={styles.backBtn}
            onClick={() => navigate("/submit")}
          >
            Back
          </button>
        </div>

        {/* BODY */}
        <div style={styles.body}>
          {loading && <p>Loading complaints...</p>}

          {!loading && complaints.length === 0 && (
            <p>No complaints submitted yet.</p>
          )}

          {complaints.map((c) => (
            <div
              key={c.complaintId}
              style={styles.complaintBox}
              onClick={() => toggleComplaint(c.complaintId)}
            >
              <div style={styles.row}>
                <div>
                  <strong>{c.department}</strong>
                  <div style={styles.id}>ID: {c.complaintId}</div>
                </div>

                <span
                  style={{
                    ...styles.status,
                    background:
                      c.status === "Resolved"
                        ? "#e3f2fd"
                        : c.status === "In Progress"
                        ? "#bbdefb"
                        : "#fff3cd",
                    color:
                      c.status === "Resolved"
                        ? "#0d47a1"
                        : c.status === "In Progress"
                        ? "#1565c0"
                        : "#ef6c00",
                  }}
                >
                  {c.status}
                </span>
              </div>

              <p style={styles.shortText}>
                {(c.text || "").slice(0, 70)}
                {c.text?.length > 70 && "..."}
              </p>

              {openId === c.complaintId && (
                <div style={styles.fullText}>
                  <p><strong>Complaint:</strong> {c.text}</p>
                  <p><strong>Department:</strong> {c.department}</p>
                  <p><strong>Status:</strong> {c.status}</p>
                  <p><strong>Time:</strong> {c.time}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewStatus;
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
    display: "flex",
    justifyContent: "center",
    padding: 30,
    fontFamily: "Inter, sans-serif",
  },
  card: {
    width: "900px",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  header: {
    padding: "18px 24px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    background: "#e3f2fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
  },
  title: {
    fontWeight: 600,
    fontSize: 18,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
  },
  backBtn: {
    background: "#1565c0",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },
  body: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  complaintBox: {
    border: "1px solid #dbeafe",
    borderRadius: 14,
    padding: 16,
    cursor: "pointer",
    background: "#f8fbff",
    transition: "0.2s",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  id: {
    fontSize: 12,
    color: "#666",
  },
  status: {
    padding: "5px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  shortText: {
    fontSize: 14,
    margin: 0,
  },
  fullText: {
    marginTop: 12,
    fontSize: 14,
    color: "#333",
    background: "#eef5ff",
    padding: 14,
    borderRadius: 10,
    lineHeight: 1.6,
  },
};