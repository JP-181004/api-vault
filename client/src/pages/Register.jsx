import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Code2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import api from "../api/axios";
import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      navigate("/login");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <Link to="/login" className="auth-logo">
            <ShieldCheck size={38} />
            <span>API Vault</span>
          </Link>

          <div className="auth-introduction">
            <div className="auth-feature-icon">
              <Code2 size={35} />
            </div>

            <h1>Build your personal API workspace.</h1>

            <p>
              Create your account and start saving, organizing and
              managing your API endpoints securely in one place.
            </p>

            <div className="auth-feature-list">
              <div>
                <span>01</span>
                Create organized API collections
              </div>

              <div>
                <span>02</span>
                Save and manage useful endpoints
              </div>

              <div>
                <span>03</span>
                Monitor everything from your dashboard
              </div>
            </div>
          </div>

          <small>© 2026 API Vault</small>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="modern-auth-card">
          <div className="mobile-auth-logo">
            <ShieldCheck size={32} />
            <span>API Vault</span>
          </div>

          <div className="auth-card-heading">
            <span className="auth-eyebrow">GET STARTED</span>
            <h2>Create your account</h2>
            <p>
              Enter your details to create your personal API Vault.
            </p>
          </div>

          {error && <div className="modern-auth-error">{error}</div>}

          <form className="modern-auth-form" onSubmit={handleRegister}>
            <label>
              <span>Full name</span>

              <div className="auth-input-wrapper">
                <User size={19} />

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </label>

            <label>
              <span>Email address</span>

              <div className="auth-input-wrapper">
                <Mail size={19} />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label>
              <span>Password</span>

              <div className="auth-input-wrapper">
                <Lock size={19} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </label>

            <button
              className="modern-login-button"
              type="submit"
              disabled={submitting}
            >
              <span>
                {submitting ? "Creating account..." : "Create account"}
              </span>

              {!submitting && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="auth-register-link">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </div>

          <div className="auth-security-note">
            <ShieldCheck size={17} />
            Your password is securely encrypted before storage.
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;