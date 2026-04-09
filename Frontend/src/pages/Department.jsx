import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function Department() {
  const departmentKeyRaw = localStorage.getItem("department") || "";
  const departmentKey = departmentKeyRaw
    .toLowerCase()
    .replace("_dept", "")
    .replace("department", "")
    .trim();

  const [complaints, setComplaints] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All"); 
  const [activeId, setActiveId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const fetchComplaints = useCallback(async () => {
    if (!departmentKey) return;
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/complaints/department/${departmentKey}`
      );
      setComplaints(res.data || []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  }, [departmentKey]);

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 5000);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const updateStatus = async (complaintId, newStatus) => {
    setLoadingId(complaintId);
    try {
      await axios.put("http://127.0.0.1:5000/complaint/update", {
        complaintId: complaintId,
        status: newStatus,
      });
      await fetchComplaints(); 
    } catch (err) {
      alert("Error: Could not update status.");
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredComplaints = complaints.filter((c) =>
    activeFilter === "All" ? true : c.status === activeFilter
  );

  const getStatusColor = (status) => {
    if (status === "Pending") return "#ef4444";
    if (status === "In Progress") return "#3b82f6";
    return "#22c55e";
  };

  // ✅ FINAL FIXED MAP FUNCTION
  const openMaps = (e, lat, lng, location) => {
    e.stopPropagation();

    console.log("MAP DATA:", lat, lng, location);

    // ✅ Strict GPS validation
    if (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng)
    ) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    } 
    // ✅ Fallback using location text
    else if (location) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
        "_blank"
      );
    } 
    else {
      alert("No GPS coordinates available for this complaint.");
    }
  };

  return (
    <div style={styles.appContainer}>
      <nav style={styles.sidebar}>
        <div style={styles.sidebarBrand}>ADMIN PANEL</div>
        <p style={styles.deptLabel}>{departmentKeyRaw.toUpperCase()}</p>
        <div style={styles.navGroup}>
          {["All", "Pending", "In Progress", "Resolved"].map((f) => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)} 
              style={{
                ...styles.navItem,
                backgroundColor: activeFilter === f ? "#eff6ff" : "transparent",
                color: activeFilter === f ? "#3b82f6" : "#64748b"
              }}
            >
              {f} Complaints
            </button>
          ))}
        </div>
      </nav>

      <main style={styles.mainContent}>
        <header style={styles.topHeader}>
          <div>
            <h2 style={styles.pageTitle}>Complaints Dashboard</h2>
            <span style={styles.filterTag}>Viewing: {activeFilter}</span>
          </div>
          <div style={styles.stats}>Total: {filteredComplaints.length}</div>
        </header>

        <div style={styles.cardGrid}>
          {filteredComplaints.length === 0 ? (
            <div style={styles.empty}>
              No {activeFilter.toLowerCase()} complaints available.
            </div>
          ) : (
            filteredComplaints.map((c) => (
              <div 
                key={c.complaintId} 
                style={{
                  ...styles.card,
                  borderTop: `5px solid ${getStatusColor(c.status)}`
                }}
                onClick={() =>
                  setActiveId(activeId === c.complaintId ? null : c.complaintId)
                }
              >
                <div style={styles.cardHead}>
                  <span style={styles.idTag}>
                    ID: #{c.complaintId.slice(-5)}
                  </span>
                  <span
                    style={{
                      ...styles.statusBadge,
                      color: getStatusColor(c.status)
                    }}
                  >
                    ● {c.status}
                  </span>
                </div>

                <h4 style={styles.complaintText}>
                  {c.text || c.original_text}
                </h4>

                <div style={styles.cardFooter}>
                  <span>
                    📅{" "}
                    {c.time
                      ? new Date(c.time).toLocaleDateString()
                      : "No Date"}
                  </span>

                  {/* ✅ FINAL FIXED LOCATION CLICK */}
                  <span 
                    onClick={(e) => openMaps(e, c.lat, c.lng, c.location)}
                    style={{
                      ...styles.locationLink,
                      cursor:
                        (typeof c.lat === "number" && typeof c.lng === "number") ||
                        c.location
                          ? "pointer"
                          : "not-allowed"
                    }}
                    title={
                      (typeof c.lat === "number" && typeof c.lng === "number")
                        ? "Click to view exact location"
                        : (c.location ? "Open approximate location" : "No GPS data")
                    }
                  >
                    📍{" "}
                    {c.location
                      ? (c.location.length > 15
                          ? c.location.substring(0, 15) + "..."
                          : c.location)
                      : "View Map"}
                  </span>
                </div>

                {activeId === c.complaintId && (
                  <div
                    style={styles.expanded}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p style={styles.fullDesc}>
                      {c.text || c.original_text}
                    </p>

                    {/* ✅ FINAL FIXED CONDITION */}
                    {(typeof c.lat === "number" && typeof c.lng === "number") && (
                      <div
                        style={styles.mapPrompt}
                        onClick={(e) => openMaps(e, c.lat, c.lng, c.location)}
                      >
                        🗺️ Click here for Precise GPS Location
                      </div>
                    )}

                    {activeFilter === "All" && (
                      <div style={styles.actionButtons}>
                        <button 
                          disabled={
                            c.status !== "Pending" ||
                            loadingId === c.complaintId
                          }
                          style={{
                            ...styles.btn,
                            ...styles.btnInprogress,
                            opacity: c.status !== "Pending" ? 0.5 : 1
                          }}
                          onClick={() =>
                            updateStatus(c.complaintId, "In Progress")
                          }
                        >
                          {loadingId === c.complaintId
                            ? "..."
                            : "Start Work"}
                        </button>

                        <button 
                          disabled={
                            c.status === "Resolved" ||
                            loadingId === c.complaintId
                          }
                          style={{
                            ...styles.btn,
                            ...styles.btnResolve,
                            opacity: c.status === "Resolved" ? 0.5 : 1
                          }}
                          onClick={() =>
                            updateStatus(c.complaintId, "Resolved")
                          }
                        >
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  appContainer: { display: "flex", height: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: "280px", backgroundColor: "#ffffff", borderRight: "1px solid #e2e8f0", padding: "40px 20px", display: "flex", flexDirection: "column" },
  sidebarBrand: { fontSize: "22px", fontWeight: "800", color: "#1e293b", marginBottom: "5px" },
  deptLabel: { fontSize: "12px", color: "#94a3b8", fontWeight: "bold", marginBottom: "30px" },
  navGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  navItem: { border: "none", textAlign: "left", padding: "14px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "15px", transition: "0.2s" },
  mainContent: { flex: 1, padding: "40px", overflowY: "auto" },
  topHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" },
  pageTitle: { margin: 0, fontSize: "26px", color: "#1e293b", fontWeight: "700" },
  filterTag: { fontSize: "13px", color: "#64748b" },
  stats: { backgroundColor: "#1e293b", color: "#fff", padding: "8px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "600" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" },
  card: { backgroundColor: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", cursor: "pointer", transition: "0.2s" },
  cardHead: { display: "flex", justifyContent: "space-between", marginBottom: "15px" },
  idTag: { color: "#94a3b8", fontSize: "12px", fontWeight: "bold" },
  statusBadge: { fontSize: "12px", fontWeight: "800", textTransform: "uppercase" },
  complaintText: { color: "#334155", fontSize: "17px", fontWeight: "600", margin: "0 0 15px 0", lineHeight: "1.4" },
  cardFooter: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" },
  locationLink: { color: "#3b82f6", fontWeight: "bold", textDecoration: "underline" },
  expanded: { marginTop: "20px", padding: "15px", backgroundColor: "#fbfcfd", borderRadius: "12px", border: "1px solid #f1f5f9" },
  fullDesc: { fontSize: "14px", color: "#475569", lineHeight: "1.6" },
  mapPrompt: { marginTop: "10px", padding: "8px", backgroundColor: "#eff6ff", color: "#1d4ed8", borderRadius: "6px", fontSize: "13px", fontWeight: "700", textAlign: "center", cursor: "pointer" },
  actionButtons: { display: "flex", gap: "10px", marginTop: "15px" },
  btn: { flex: 1, padding: "12px", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  btnInprogress: { backgroundColor: "#3b82f6", color: "#fff" },
  btnResolve: { backgroundColor: "#22c55e", color: "#fff" },
  empty: { gridColumn: "1/-1", textAlign: "center", padding: "100px", color: "#94a3b8" }
};

export default Department;