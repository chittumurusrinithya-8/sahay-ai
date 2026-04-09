import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Square, Paperclip, Send, CheckCircle, 
  MapPin, Loader2, LayoutDashboard, History, User, Bot 
} from "lucide-react";

function SubmitComplaint() {
  const navigate = useNavigate();

  // State Management
  const [username] = useState(localStorage.getItem("username") || "Citizen");
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Fetching GPS...");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [detectedLanguage, setDetectedLanguage] = useState("en-IN");
  
  // Chat History
  const [messages, setMessages] = useState([
    { id: 1, text: `Hello ${username}, I am SahaayAI. Describe your grievance below. You can chat to refine it, then click 'Submit' below when ready.`, sender: "ai" }
  ]);

  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null); // This was missing its target!
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Capture Location on Mount
  useEffect(() => {
    if (!username) { navigate("/login"); return; }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationStatus("Location captured");
        },
        (error) => {
          console.error(error);
          setLocationStatus("Location denied/unavailable");
        }
      );
    }
  }, [navigate, username]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      setInput((prev) => (prev + " " + transcript).trim());
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (listening) { recognitionRef.current?.stop(); } 
    else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = detectedLanguage;
        recognitionRef.current.start();
        setListening(true);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Add a visual indicator to the chat that a file was attached
      const fileMsg = { 
        id: Date.now(), 
        text: `📎 Attachment added: ${file.name}`, 
        sender: "user" 
      };
      setMessages(prev => [...prev, fileMsg]);
    }
  };

  const handleChatAction = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    // Clear input after adding to chat if you want it to feel like a real messenger, 
    // but based on your logic, we keep it so 'Submit' can use it.
  };

  const handleFinalSubmit = async () => {
    if (!input.trim()) {
      alert("Please type your grievance in the box before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:5000/complaint", {
        username: username,
        text: input,
        language: detectedLanguage,
        lat: coords.lat,
        lng: coords.lng,
        location: locationStatus
      });

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `OFFICIAL SUBMISSION SUCCESSFUL! Reference ID: ${res.data.complaintId}.`,
        sender: "ai",
        isFinal: true
      }]);

      setInput("");
      localStorage.setItem("refreshHistory", Date.now());

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>S</div>
          <h2 style={styles.logoText}>SahaayAI</h2>
        </div>
        <nav style={styles.nav}>
          <button style={styles.navItem} onClick={() => navigate("/Dashboard")}><LayoutDashboard size={20} /> Dashboard</button>
          <button style={{...styles.navItem, ...styles.navActive}}><Mic size={20} /> Register Grievance</button>
          <button style={styles.navItem} onClick={() => navigate("/status")}><History size={20} /> History</button>
        </nav>
        <div style={styles.userProfile}>
           <div style={styles.avatar}><User size={20}/></div>
           <div style={styles.userInfo}>
             <p style={styles.userName}>{username}</p>
             <p style={styles.userRole}>Citizen Account</p>
           </div>
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.topNav}>
          <div>
            <h1 style={styles.pageTitle}>Grievance Registration</h1>
            <p style={styles.subTitle}>
              <span style={{color: locationStatus === "Location captured" ? "#4CAF50" : "#F44336"}}>●</span> {locationStatus}
            </p>
          </div>
          <div style={styles.langSwitch}>
            <button onClick={() => setDetectedLanguage("en-IN")} style={{...styles.langBtn, ...(detectedLanguage === 'en-IN' ? styles.langActive : {})}}>ENGLISH</button>
            <button onClick={() => setDetectedLanguage("te-IN")} style={{...styles.langBtn, ...(detectedLanguage === 'te-IN' ? styles.langActive : {})}}>తెలుగు</button>
          </div>
        </header>

        <div style={styles.contentWrapper}>
          <div style={styles.chatCard}>
            <div style={styles.chatHeader}>
              <div style={styles.aiBadge}>
                <MapPin size={14}/> 
                {coords.lat ? `GPS Locked: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Waiting for GPS...'}
              </div>
            </div>

            <div style={styles.chatBody}>
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      ...styles.messageRow,
                      flexDirection: msg.sender === 'user' ? 'row' : 'row-reverse'
                    }}
                  >
                    <div style={{
                      ...styles.bubble,
                      backgroundColor: msg.sender === 'user' ? '#fff' : (msg.isFinal ? '#059669' : '#2563EB'),
                      color: msg.sender === 'user' ? '#1E293B' : '#fff',
                      border: msg.sender === 'user' ? '1px solid #E2E8F0' : 'none',
                      borderBottomLeftRadius: msg.sender === 'user' ? '4px' : '16px',
                      borderBottomRightRadius: msg.sender === 'ai' ? '4px' : '16px',
                    }}>
                      {msg.text}
                    </div>
                    <div style={styles.msgIcon}>
                      {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea}>
              <div style={styles.controls}>
                {/* Fixed: File input button now has an actual input to click */}
                <button onClick={() => fileInputRef.current?.click()} style={styles.iconBtn} title="Attach">
                  <Paperclip size={22} />
                </button>
                
                {/* THE MISSING PIECE: Hidden file input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: "none" }} 
                  onChange={handleFileChange}
                />

                <textarea 
                  style={styles.mainInput}
                  placeholder="Type your issue here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) handleChatAction(e); }}
                />
                
                <button 
                  onClick={toggleListening} 
                  style={{...styles.micBtn, backgroundColor: listening ? "#EF4444" : "#2563EB"}}
                  className={listening ? "pulse" : ""}
                >
                  {listening ? <Square size={20} fill="white" /> : <Mic size={22} />}
                </button>
                
                <button 
                  style={{...styles.sendBtn, opacity: input.trim() ? 1 : 0.5}} 
                  onClick={handleChatAction}
                  disabled={!input.trim()}
                >
                  <Send size={24} />
                </button>
              </div>

              <div style={styles.submitRow}>
                <button 
                  style={{...styles.finalSubmitBtn, opacity: input.trim() ? 1 : 0.6}} 
                  onClick={handleFinalSubmit}
                  disabled={loading || !input.trim()}
                >
                  {loading ? <Loader2 className="spin" size={18} /> : <CheckCircle size={18} />}
                  {loading ? "Registering..." : "Submit Official Complaint"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        .pulse { animation: pulse 1.5s infinite; }
      `}</style>
    </div>
  );
}

const styles = {
  appContainer: { display: 'flex', height: '100vh', backgroundColor: '#F8FAFC', fontFamily: "'Inter', sans-serif" },
  sidebar: { width: '260px', backgroundColor: '#fff', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', padding: '24px' },
  logoSection: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' },
  logoIcon: { width: '40px', height: '40px', backgroundColor: '#2563EB', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' },
  logoText: { fontSize: '20px', fontWeight: '800', color: '#1E293B', margin: 0 },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: 'none', backgroundColor: 'transparent', color: '#64748B', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: '0.2s' },
  navActive: { backgroundColor: '#F1F5F9', color: '#2563EB' },
  userProfile: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px' },
  avatar: { width: '40px', height: '40px', backgroundColor: '#E2E8F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' },
  userName: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E293B' },
  userRole: { margin: 0, fontSize: '12px', color: '#94A3B8' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topNav: { height: '80px', backgroundColor: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' },
  pageTitle: { fontSize: '18px', fontWeight: '700', margin: 0, color: '#1E293B' },
  subTitle: { fontSize: '12px', color: '#94A3B8', margin: '4px 0 0' },
  langSwitch: { display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' },
  langBtn: { padding: '6px 16px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', backgroundColor: 'transparent', color: '#64748B' },
  langActive: { backgroundColor: '#fff', color: '#2563EB', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  contentWrapper: { flex: 1, padding: '32px', display: 'flex', justifyContent: 'center' },
  chatCard: { width: '100%', maxWidth: '850px', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' },
  chatHeader: { padding: '16px 24px', borderBottom: '1px solid #F1F5F9' },
  aiBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  chatBody: { flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  messageRow: { display: 'flex', gap: '12px', alignItems: 'flex-end', width: '100%' },
  bubble: { maxWidth: '70%', padding: '12px 16px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.5' },
  msgIcon: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', flexShrink: 0 },
  inputArea: { padding: '20px 24px', borderTop: '1px solid #F1F5F9', backgroundColor: '#fff' },
  controls: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#F8FAFC', padding: '8px', borderRadius: '16px', border: '1px solid #E2E8F0' },
  mainInput: { flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '10px', fontSize: '14px', resize: 'none', height: '42px', color: '#1E293B' },
  iconBtn: { background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '8px' },
  micBtn: { width: '44px', height: '44px', borderRadius: '12px', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' },
  sendBtn: { background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  submitRow: { display: 'flex', justifyContent: 'center', marginTop: '15px' },
  finalSubmitBtn: {
    width: '100%',
    backgroundColor: '#059669',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)',
    transition: '0.2s'
  }
};

export default SubmitComplaint;