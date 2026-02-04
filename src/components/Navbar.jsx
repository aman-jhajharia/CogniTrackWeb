import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <h3>CogniTracK</h3>

      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
    <NavLink to="/time-tracker" style={{ marginRight: 12, textDecoration: "none" }}>
      Time Tracker
    </NavLink>
          <span>{user.displayName}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}
