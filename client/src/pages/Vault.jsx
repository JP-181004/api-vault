
import { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  CalendarClock,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import Navbar from "../components/Navbar";
import "./Vault.css";

const API_URL = "http://localhost:5000/api/secrets";

const emptyForm = {
  serviceName: "",
  project: "",
  environment: "Development",
  apiKey: "",
  expiresAt: "",
};

function Vault() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [secrets, setSecrets] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const getToken = () => localStorage.getItem("token");

  const apiRequest = async (path = "", options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error("Please log in again. Your login token is missing.");
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Your login session is invalid or expired. Please log in again.");
      }
      throw new Error(data.message || "The request failed.");
    }

    return data;
  };

  const loadSecrets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest();
      setSecrets(Array.isArray(data.secrets) ? data.secrets : []);
    } catch (err) {
      setError(err.message || "Could not load secrets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSecrets();
  }, [loadSecrets]);

  const filteredSecrets = secrets.filter((secret) =>
    `${secret.serviceName} ${secret.project} ${secret.environment}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const activeCount = secrets.filter(
    (secret) => !secret.expiresAt || new Date(secret.expiresAt) >= new Date()
  ).length;

  const expiringCount = secrets.filter((secret) => {
    if (!secret.expiresAt) return false;
    const days =
      (new Date(secret.expiresAt) - new Date()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  }).length;

  async function createSecret(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.serviceName.trim() || !form.project.trim() || !form.apiKey) {
      setError("Service, project, and API key are required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt || null,
      };

      const data = await apiRequest("", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setForm(emptyForm);
      setShowForm(false);
      setNotice(data.message || "Secret encrypted and saved successfully.");
      await loadSecrets();
    } catch (err) {
      setError(err.message || "Could not save the secret.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleReveal(secret) {
    setError("");
    setNotice("");

    if (revealed[secret._id]) {
      setRevealed((current) => {
        const next = { ...current };
        delete next[secret._id];
        return next;
      });
      return;
    }

    setBusyId(secret._id);

    try {
      const data = await apiRequest(`/${secret._id}/reveal`, {
        method: "POST",
      });

      setRevealed((current) => ({
        ...current,
        [secret._id]: data.apiKey,
      }));
    } catch (err) {
      setError(err.message || "Could not reveal this secret.");
    } finally {
      setBusyId("");
    }
  }

  async function copySecret(secret) {
    let value = revealed[secret._id];

    if (!value) {
      setBusyId(secret._id);
      setError("");

      try {
        const data = await apiRequest(`/${secret._id}/reveal`, {
          method: "POST",
        });
        value = data.apiKey;
      } catch (err) {
        setError(err.message || "Could not retrieve this secret.");
        setBusyId("");
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(value);
      setNotice("Secret copied to clipboard.");
    } catch {
      setError("Copy failed. Check browser clipboard permissions.");
    } finally {
      setBusyId("");
    }
  }

  async function deleteSecret(secret) {
    if (!window.confirm(`Delete the secret for "${secret.serviceName}"?`)) {
      return;
    }

    setError("");
    setNotice("");
    setBusyId(secret._id);

    try {
      const data = await apiRequest(`/${secret._id}`, {
        method: "DELETE",
      });

      setSecrets((current) =>
        current.filter((item) => item._id !== secret._id)
      );

      setRevealed((current) => {
        const next = { ...current };
        delete next[secret._id];
        return next;
      });

      setNotice(data.message || "Secret deleted.");
    } catch (err) {
      setError(err.message || "Could not delete the secret.");
    } finally {
      setBusyId("");
    }
  }

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="workspace-shell">
      <Navbar />

      <main className="workspace-main vault-page">
        <header className="workspace-topbar vault-topbar">
          <div>
            <span className="workspace-eyebrow">API VAULT / SECURITY</span>
            <h1>Secrets Vault</h1>
            <p>Securely organize and manage your API credentials.</p>
          </div>

          <button
            className="send-button"
            onClick={() => {
              setShowForm((current) => !current);
              setError("");
              setNotice("");
            }}
          >
            <Plus size={17} />
            Add Secret
          </button>
        </header>

        {error && (
          <div className="vault-message vault-error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="vault-message vault-success" role="status">
            {notice}
          </div>
        )}

        <section className="vault-summary">
          <article className="vault-stat-card">
            <div className="vault-stat-icon"><KeyRound size={21} /></div>
            <span>Total Secrets</span>
            <strong>{secrets.length}</strong>
          </article>

          <article className="vault-stat-card">
            <div className="vault-stat-icon"><ShieldCheck size={21} /></div>
            <span>Active Credentials</span>
            <strong>{activeCount}</strong>
          </article>

          <article className="vault-stat-card">
            <div className="vault-stat-icon"><CalendarClock size={21} /></div>
            <span>Expiring Soon</span>
            <strong>{expiringCount}</strong>
          </article>
        </section>

        {showForm && (
          <section className="response-card vault-form-card">
            <div className="response-heading">
              <div className="request-title">
                <LockKeyhole size={19} />
                <span>Add an encrypted secret</span>
              </div>
            </div>

            <form className="vault-form" onSubmit={createSecret}>
              <label>
                Service name
                <input
                  name="serviceName"
                  value={form.serviceName}
                  onChange={updateForm}
                  placeholder="e.g. Weather API"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Project
                <input
                  name="project"
                  value={form.project}
                  onChange={updateForm}
                  placeholder="e.g. College Project"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Environment
                <select
                  name="environment"
                  value={form.environment}
                  onChange={updateForm}
                >
                  <option>Development</option>
                  <option>Staging</option>
                  <option>Production</option>
                </select>
              </label>

              <label>
                API key / secret value
                <input
                  name="apiKey"
                  type="password"
                  value={form.apiKey}
                  onChange={updateForm}
                  placeholder="Enter your secret"
                  autoComplete="off"
                  required
                />
              </label>

              <label>
                Expiry date (optional)
                <input
                  name="expiresAt"
                  type="date"
                  value={form.expiresAt}
                  onChange={updateForm}
                />
              </label>

              <div className="vault-form-actions">
                <button
                  className="send-button"
                  type="submit"
                  disabled={saving}
                >
                  <LockKeyhole size={16} />
                  {saving ? "Encrypting..." : "Encrypt & Save"}
                </button>

                <button
                  className="add-row-button"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>

            <p className="editor-hint">
              The secret is sent to the backend for encryption. The list
              endpoint does not return the original secret value.
            </p>
          </section>
        )}

        <section className="response-card vault-table-card">
          <div className="vault-table-heading">
            <div>
              <h2>Your credentials</h2>
              <p>Credentials stay masked until you explicitly reveal them.</p>
            </div>

            <label className="vault-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search credentials..."
                aria-label="Search credentials"
              />
            </label>
          </div>

          {loading ? (
            <div className="vault-empty-state">
              <RefreshCw size={25} />
              <p>Loading encrypted secrets...</p>
            </div>
          ) : filteredSecrets.length === 0 ? (
            <div className="vault-empty-state">
              <div className="vault-empty-icon"><KeyRound size={29} /></div>
              <h3>{search ? "No matching secrets" : "No secrets yet"}</h3>
              <p>
                {search
                  ? "Try another search term."
                  : "Add a credential to start using your encrypted vault."}
              </p>
              {!search && (
                <button
                  className="send-button"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={17} />
                  Add your first secret
                </button>
              )}
            </div>
          ) : (
            <div className="vault-table-scroll">
              <table className="vault-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Project</th>
                    <th>Environment</th>
                    <th>Credential</th>
                    <th>Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSecrets.map((secret) => (
                    <tr key={secret._id}>
                      <td>{secret.serviceName}</td>
                      <td>{secret.project}</td>
                      <td>{secret.environment}</td>
                      <td>
                        <span className="vault-masked-value">
                          {revealed[secret._id]
                            ? revealed[secret._id]
                            : "••••••••••••"}
                        </span>
                        <button
                          className="vault-icon-button"
                          title={revealed[secret._id] ? "Hide" : "Reveal"}
                          aria-label={revealed[secret._id] ? "Hide secret" : "Reveal secret"}
                          disabled={busyId === secret._id}
                          onClick={() => toggleReveal(secret)}
                        >
                          {revealed[secret._id] ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </td>
                      <td>
                        {secret.expiresAt
                          ? new Date(secret.expiresAt).toLocaleDateString()
                          : "No expiry"}
                      </td>
                      <td>
                        <button
                          className="vault-icon-button"
                          title="Copy"
                          aria-label="Copy secret"
                          disabled={busyId === secret._id}
                          onClick={() => copySecret(secret)}
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          className="vault-icon-button"
                          title="Delete"
                          aria-label="Delete secret"
                          disabled={busyId === secret._id}
                          onClick={() => deleteSecret(secret)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="workspace-footer">
          API Vault · Encrypted Secrets Manager
        </footer>
      </main>
    </div>
  );
}

export default Vault;
