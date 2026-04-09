import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Existing Pages in your /pages folder
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SubmitComplaint from "./pages/SubmitComplaint";
import ViewStatus from "./pages/ViewStatus";
import Admin from "./pages/Admin";
import Department from "./pages/Department";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* User Grievance Pages */}
        <Route path="/submit" element={<SubmitComplaint />} />
        <Route path="/status" element={<ViewStatus />} />

        {/* Admin & Dept */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/department" element={<Department />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;