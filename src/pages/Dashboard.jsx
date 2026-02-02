import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "40px" }}>
        <h2>Dashboard</h2>

        {user && (
          <>
            <p>Name: {user.displayName}</p>
            <p>Email: {user.email}</p>
          </>
        )}

        <br />
        <button onClick={handleLogout}>Logout</button>
      </div>
    </>
  );
}
