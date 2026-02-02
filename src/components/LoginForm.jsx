import "../styles/Login.css";

export default function LoginForm({ onGoogleLogin }) {
  return (
    <div className="container">
      <div className="card">
        <img
          className="CogniTrack_logo"
          src="/src/images/CogniTrack_logo.png"
          alt="CogniTrack logo"
        />

        <h1 className="CogniTrack_title">CogniTrack</h1>
        <h2>Sign in to continue</h2>

        <button
          className="google-btn"
          type="button"
          onClick={onGoogleLogin}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
          />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}
