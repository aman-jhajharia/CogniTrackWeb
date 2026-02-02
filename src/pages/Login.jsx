import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { saveUserProfile } from "../services/userService";
import LoginForm from "../components/LoginForm";
import "../styles/LoginPage.css";

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserProfile(result.user);
    } catch (error) {
      console.error(error);
      alert("Google Sign-In failed");
    }
  };

  return (
    <div className="login-page">
      <h1 className="login-heading">
        CogniTrack: An Tracker for Optimized Future
      </h1>

      <LoginForm onGoogleLogin={handleGoogleLogin} />
    </div>
  );
}
