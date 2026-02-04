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
      alert("Google Sign-In Successful");
      alert("Google Sign-In Successful");
    } catch (error) {
      console.error(error);
      alert("Google Sign-In failed");
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* LEFT – WHITE */}
        <div className="login-left">
          <LoginForm onGoogleLogin={handleGoogleLogin} />
        </div>

        {/* RIGHT – PURPLE */}
        <div className="login-right">
          <div className="login-right-content">
            <h4 className="login-right-title">
             T̷r̷a̷c̷k̷i̷n̷g̷  Taking Control of Your Life!
            </h4>
            <p className="login-right-text">
              Live a healthier, more organized life by effortlessly.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
