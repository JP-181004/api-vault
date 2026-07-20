import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Code2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import api from "../api/axios";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Login failed. Please check your details."
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

            <h1>Your APIs, organized and always accessible.</h1>

            <p>
              Save endpoints, organize collections, track favourites
              and manage your API workspace from one secure dashboard.
            </p>

            <div className="auth-feature-list">
              <div>
                <span>01</span>
                Organize APIs into collections
              </div>

              <div>
                <span>02</span>
                Search and filter endpoints instantly
              </div>

              <div>
                <span>03</span>
                View useful dashboard statistics
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
            <span className="auth-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your vault</h2>
            <p>Enter your credentials to continue to your dashboard.</p>
          </div>

          {error && <div className="modern-auth-error">{error}</div>}

          <form className="modern-auth-form" onSubmit={handleLogin}>
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
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
              <span>{submitting ? "Signing in..." : "Sign in"}</span>
              {!submitting && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="auth-register-link">
            <span>Don’t have an account?</span>
            <Link to="/register">Create an account</Link>
          </div>

          <div className="auth-security-note">
            <ShieldCheck size={17} />
            Your login is protected with secure authentication.
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;