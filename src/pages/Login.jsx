import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { saveUserProfile } from "../services/userService";

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
    <div style={{ padding: "40px" }}>
      <h1>CogniTrack</h1>
      <p>Sign in to continue</p>

      <button onClick={handleGoogleLogin}>
        Sign in with Google
      </button>
    </div>
  );
}
