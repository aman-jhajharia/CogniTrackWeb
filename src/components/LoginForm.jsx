import "../styles/Login.css";

export default function LoginForm({ onGoogleLogin }) {
  return (
    <div className="login-form">

      <img
        className="CogniTrack_logo"
        src="/src/images/CogniTrack_logo.png"
        alt="CogniTrack logo"
      />

      <h2 className="login-subtitle">Please sign in to continue</h2>

      <button
        className="google-btn"
        type="button"
        onClick={onGoogleLogin}
      >
        <img
          src="/src/images/google_logo.png"
          alt="Google logo"
        />
        <span>Sign in with Google</span>
      </button>

    </div>
  );
}
