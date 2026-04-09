import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle, 
  ShieldCheck,
  Building2,
  ChevronRight,
  Activity,
  Calendar,
  History,
  Layers
} from "lucide-react";

import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

function Admin() {
  const location = useLocation();
  const navigate = useNavigate();
  const adminName = location.state?.adminName || "Admin";

  const [departments, setDepartments] = useState([
    { name: "Electrical Department", key: "electrical", color: "#FFF3E0", icon: "⚡", count: 0 },
    { name: "Food Safety Department", key: "food safety", color: "#E3F2FD", icon: "🍲", count: 0 },
    { name: "Veterinary Department", key: "veterinary", color: "#E8F5E9", icon: "🐾", count: 0 },
    { name: "Sanitation Department", key: "sanitation", color: "#FCE4EC", icon: "🧹", count: 0 },
    { name: "Town Planning Department", key: "town planning", color: "#EDE7F6", icon: "🏗️", count: 0 },
    { name: "Engineering Department", key: "engineering", color: "#FFEBEE", icon: "⚙️", count: 0 },
    { name: "Disaster Management", key: "disaster management", color: "#E0F2F1", icon: "🆘", count: 0 }
  ]);

  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, today: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const updated = await Promise.all(
          departments.map(async (dept) => {
            const res = await axios.get(`http://localhost:5000/complaints/department/${encodeURIComponent(dept.key)}`);
            return { ...dept, count: res.data.length };
          })
        );
        setDepartments(updated);
        const sRes = await axios.get("http://localhost:5000/admin/stats");
        setStats(sRes.data);
        const rRes = await axios.get("http://localhost:5000/complaints/recent");
        setRecentComplaints(rRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const openDepartment = (dept) => {
    navigate("/department", {
      state: { department: dept.key, departmentName: dept.name }
    });
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <div style={styles.commandTag}><ShieldCheck size={14} /> SAHAY AI COMMAND CENTER</div>
            <h2 style={styles.title}>System Oversight: {adminName}</h2>
          </div>
          <div style={styles.headerUser}>
             <div style={{textAlign: 'right'}}><p style={styles.statusLabel}>SERVER STATUS</p><p style={styles.statusText}>● Operational</p></div>
             <div style={styles.avatar}><Users size={20} color="white" /></div>
          </div>
        </div>
      </header>

      <div style={styles.body}>
        <h3 style={styles.sectionTitle}><Activity size={18} style={{marginRight: '8px'}}/> System Overview</h3>
        <div style={styles.statsGrid}>
          {[
            { label: "Total Filing", val: stats.total, icon: BarChart3, color: "#3b82f6", bg: "#eff6ff" },
            { label: "Pending Review", val: stats.pending, icon: Clock, color: "#f59e0b", bg: "#fffbeb" },
            { label: "Resolved Case", val: stats.resolved, icon: CheckCircle, color: "#10b981", bg: "#f0fdf4" },
            { label: "Live Today", val: stats.today, icon: Calendar, color: "#8b5cf6", bg: "#f5f3ff" }
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ ...styles.statIconBox, backgroundColor: s.bg, color: s.color }}><s.icon size={24} /></div>
              <p style={styles.statLabelText}>{s.label}</p>
              <h2 style={styles.statValueText}>{s.val}</h2>
            </div>
          ))}
        </div>

        <h3 style={styles.sectionTitle}><Building2 size={18} style={{marginRight: '8px'}}/> Service Sectors</h3>
        <div style={styles.grid}>
          {departments.map((dept, index) => (
            <div 
              key={index} 
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ 
                ...styles.card, 
                backgroundColor: dept.color,
                transform: hoveredIndex === index ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: hoveredIndex === index ? '0 12px 24px rgba(0,0,0,0.1)' : styles.card.boxShadow
              }} 
              onClick={() => openDepartment(dept)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={styles.deptIcon}>{dept.icon}</div>
                <div>
                  <div style={styles.deptName}>{dept.name}</div>
                  <div style={styles.count}>{dept.count} Active Cases</div>
                </div>
              </div>
              <ChevronRight size={18} color="#64748b" />
            </div>
          ))}
        </div>

        <div style={styles.chartLayout}>
          <div style={styles.chartCard}>
            <h4 style={styles.chartTitle}><BarChart3 size={16} color="#3b82f6"/> CASE DISTRIBUTION BY SECTOR</h4>
            <div style={styles.chartBox}>
              <Bar data={{
                labels: departments.map(d => d.name.split(' ')[0]),
                datasets: [{ 
                    label: 'Cases',
                    data: departments.map(d => d.count), 
                    backgroundColor: 'rgba(59, 130, 246, 0.8)', 
                    borderRadius: 8,
                    hoverBackgroundColor: '#3b82f6'
                }]
              }} options={chartOptions} />
            </div>
          </div>
          
          <div style={styles.chartCard}>
            <h4 style={styles.chartTitle}><Layers size={16} color="#3b82f6"/> DEPARTMENTAL LOAD</h4>
            <div style={{height: '220px'}}>
              <Doughnut data={{
                labels: departments.map(d => d.name.split(' ')[0]),
                datasets: [{ 
                    data: departments.map(d => d.count), 
                    backgroundColor: ["#FFCC80", "#90CAF9", "#A5D6A7", "#F48FB1", "#CE93D8", "#EF9A9A", "#80CBC4"],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
              }} options={{ ...chartOptions, cutout: '70%', plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
            </div>
          </div>
        </div>

        <h3 style={styles.sectionTitle}><History size={18} style={{marginRight: '8px'}}/> Real-time Grievance Feed</h3>
        <table style={styles.table}>
          <thead style={styles.tableHead}>
            <tr>
              <th style={styles.th}>CASE ID</th>
              <th style={styles.th}>DEPARTMENT</th>
              <th style={{...styles.th, textAlign: 'center'}}>STATUS</th>
              <th style={styles.th}>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {recentComplaints.length === 0 ? (
              <tr><td colSpan="4" style={styles.noData}>No recent traffic detected...</td></tr>
            ) : (
              recentComplaints.map((c, i) => (
                <tr key={i} style={styles.tableRow}>
                  <td style={styles.tdId}>#{c.complaintId}</td>
                  <td style={styles.tdDept}>{c.department}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ ...styles.statusBadge, ...(c.status === "Pending" ? styles.pending : c.status === "In Progress" ? styles.inprogress : styles.resolved) }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={styles.tdTime}>{c.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" },
  header: { height: 110, background: "linear-gradient(135deg, #0f172a, #1e293b)", display: "flex", alignItems: "center", padding: "0 60px", color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" },
  headerInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1400px', margin: '0 auto' },
  commandTag: { display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd', fontSize: '10px', fontWeight: '900', letterSpacing: '2px', marginBottom: '4px' },
  title: { margin: 0, fontSize: 26, fontWeight: 900 },
  headerUser: { display: 'flex', alignItems: 'center', gap: '15px' },
  statusLabel: { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', margin: 0 },
  statusText: { fontSize: '12px', color: '#4ade80', margin: 0 },
  avatar: { width: '45px', height: '45px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  body: { padding: "40px 60px", maxWidth: '1400px', margin: '0 auto' },
  sectionTitle: { marginTop: 40, marginBottom: 20, fontSize: 13, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center' },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 },
  statCard: { background: "#fff", padding: 30, borderRadius: 24, border: '1px solid #f1f5f9', boxShadow: "0 4px 20px rgba(0,0,0,0.02)" },
  statIconBox: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' },
  statLabelText: { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' },
  statValueText: { fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: '5px 0' },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 15 },
  card: { height: 90, borderRadius: 20, padding: "0 25px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.3s ease' },
  deptIcon: { fontSize: '24px' },
  deptName: { fontSize: 15, fontWeight: 800, color: "#1e293b" },
  count: { fontSize: 12, fontWeight: 600, color: "#64748b" },
  chartLayout: { display: 'grid', gridTemplateColumns: '2.5fr 1.5fr', gap: '30px', marginTop: '30px' },
  chartCard: { background: "#fff", padding: 30, borderRadius: 32, border: '1px solid #f1f5f9', boxShadow: "0 4px 20px rgba(0,0,0,0.02)" },
  chartTitle: { fontWeight: '900', fontSize: '11px', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' },
  chartBox: { height: 220 },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 32, overflow: "hidden", border: '1px solid #f1f5f9', marginTop: '10px' },
  tableHead: { background: "#f8fafc", textAlign: "left" },
  th: { padding: '18px 25px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' },
  tableRow: { borderBottom: "1px solid #f1f5f9" },
  tdId: { padding: '20px 25px', fontWeight: '800', color: '#334155' },
  tdDept: { padding: '20px 25px', color: '#64748b', fontWeight: '500' },
  tdTime: { padding: '20px 25px', color: '#94a3b8', fontSize: '12px' },
  noData: { textAlign: "center", padding: "40px", color: "#94a3b8" },
  statusBadge: { padding: "6px 14px", borderRadius: "100px", fontSize: "10px", fontWeight: "900", textTransform: 'uppercase' },
  pending: { background: "#fffbeb", color: "#b45309" },
  inprogress: { background: "#eff6ff", color: "#1d4ed8" },
  resolved: { background: "#f0fdf4", color: "#15803d" }
};

export default Admin;