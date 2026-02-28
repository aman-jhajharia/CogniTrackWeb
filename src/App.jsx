import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TimeTracker from "./pages/TimeTracker";
import Analytics from "./pages/Analytics";
import ExpenseTracker from "./pages/ExpenseTracker";
import Navbar from "./components/Navbar";
import PersonalChatbot from "./components/PersonalChatbot";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p style={{ padding: 40 }}>Loading...</p>;
  }

  return (
    <BrowserRouter>
      {user && (
        <>
          <Navbar />
          <PersonalChatbot />
        </>
      )}

      <Routes>
        {!user ? (
          <Route path="*" element={<Login />} />
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/time-tracker" element={<TimeTracker />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/expense-tracker" element={<ExpenseTracker />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
