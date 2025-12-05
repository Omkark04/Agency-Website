import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
// import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Services from "./pages/Services";
import Media from "./pages/Media";
import Tasks from "./pages/Tasks";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/services" element={<Services />} />
        <Route path="/media" element={<Media />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/users" element={<Users />} />
        <Route path="/analytics" element={<Analytics />} />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
