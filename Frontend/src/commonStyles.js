const styles = {
  page: {
    minHeight: "100vh",
    background: "#eef7ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    fontFamily: "Inter, sans-serif",
  },

  card: {
    width: "900px",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },

  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 10,
    background: "#eef5ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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

  body: {
    padding: "20px",
  },

  item: {
    padding: "12px 14px",
    marginBottom: 10,
    background: "#f6f9ff",
    border: "1px solid #dce7ff",
    borderRadius: 8,
  },

  primaryBtn: {
    background: "#0b93f6",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default styles;
