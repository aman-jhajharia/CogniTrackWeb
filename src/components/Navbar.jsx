import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { NavLink } from "react-router-dom";
import { Activity, LogOut, User } from "lucide-react";
import "../styles/Navbar.css";

export default function Navbar() {
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">
        <div className="nav-brand-icon">
          <Activity size={24} color="#ffffff" />
        </div>
        CogniTrack
      </NavLink>

      {user && (
        <>
          <div className="nav-links">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Dashboard
            </NavLink>
            <NavLink to="/time-tracker" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Time Tracker
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Analytics
            </NavLink>
            <NavLink to="/expense-tracker" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Expense Tracker
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Tasks
            </NavLink>
            <NavLink to="/productivity" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Productivity
            </NavLink>
            <NavLink to="/todo" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              To-Do List
            </NavLink>
          </div>

          <div className="nav-right">
            <div className="nav-profile">
              <div className="nav-profile-info">
                <span className="nav-profile-name">{user.displayName || "User"}</span>
                {/* <span className="nav-profile-plan">Pro Plan</span> */}
              </div>
              <div className="nav-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" />
                ) : (
                  <User size={20} color="#6a1b9a" />
                )}
              </div>
            </div>

            <button className="nav-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
