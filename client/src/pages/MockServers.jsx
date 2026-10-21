import { useState, useEffect, useCallback } from "react";
import {
  Server,
  Plus,
  Trash2,
  Play,
  Globe,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Navbar from "../components/Navbar";
import "./MockServers.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const MOCK_ENDPOINTS_URL = `${API_BASE_URL}/api/mock-endpoints`;

function getAuthToken() {
  // Check common token keys used by the existing application.
  const possibleKeys = ["token", "authToken", "accessToken"];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  // Also support applications that store the token inside a user object.
  for (const key of ["user", "auth", "authUser"]) {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "null");
      const token = stored?.token || stored?.accessToken;

      if (token) return token;
    } catch {
      // Ignore values that aren't JSON.
    }
  }

  return null;
}

async function apiRequest(url, options = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Authentication token not found. Please log out and log in again."
    );
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function MockServers() {
  const [servers, setServers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [serverName, setServerName] = useState("");
  const [endpoint, setEndpoint] = useState("/api/users");
  const [method, setMethod] = useState("GET");
  const [statusCode, setStatusCode] = useState("200");

  const [responseBody, setResponseBody] = useState(
    JSON.stringify(
      {
        id: 1,
        name: "Rahul",
        email: "rahul@example.com",
      },
      null,
      2
    )
  );

  const loadServers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(MOCK_ENDPOINTS_URL);

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response while loading mock endpoints.");
      }

      setServers(data);
    } catch (err) {
      setError(err.message || "Failed to load mock endpoints.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServers();
  }, [loadServers]);

  const createServer = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    let parsedBody;

    try {
      parsedBody = JSON.parse(responseBody);
    } catch {
      setError("Please enter a valid JSON response body.");
      return;
    }

    const normalizedPath = endpoint.trim();

    if (!serverName.trim()) {
      setError("Please enter an endpoint name.");
      return;
    }

    if (
      !normalizedPath.startsWith("/") ||
      normalizedPath.includes("?") ||
      normalizedPath.includes("#")
    ) {
      setError(
        "The endpoint path must start with / and must not contain query parameters or fragments."
      );
      return;
    }

    setSaving(true);

    try {
      const data = await apiRequest(MOCK_ENDPOINTS_URL, {
        method: "POST",
        body: JSON.stringify({
          name: serverName.trim(),
          method,
          path: normalizedPath,
          statusCode: Number(statusCode),
          responseBody: parsedBody,
        }),
      });

      if (!data.mockEndpoint) {
        throw new Error("The server did not return the created endpoint.");
      }

      setServers((previous) => [
        data.mockEndpoint,
        ...previous.filter(
          (item) => item._id !== data.mockEndpoint._id
        ),
      ]);

      setServerName("");
      setShowForm(false);
      setNotice("Mock endpoint saved successfully to MongoDB.");
    } catch (err) {
      setError(err.message || "Failed to create mock endpoint.");
    } finally {
      setSaving(false);
    }
  };

  const deleteServer = async (id) => {
    if (!window.confirm("Delete this mock endpoint permanently?")) {
      return;
    }

    setError("");
    setNotice("");
    setDeletingId(id);

    try {
      await apiRequest(`${MOCK_ENDPOINTS_URL}/${id}`, {
        method: "DELETE",
      });

      setServers((previous) =>
        previous.filter((server) => server._id !== id)
      );

      setNotice("Mock endpoint deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete mock endpoint.");
    } finally {
      setDeletingId(null);
    }
  };

  const getPublicUrl = (server) => {
    if (!server.publicId) return null;

    const basePath = `/mock/${encodeURIComponent(server.publicId)}`;
    const endpointPath = server.path
      .split("/")
      .filter(Boolean)
      .map(encodeURIComponent)
      .join("/");

    return `${API_BASE_URL}${basePath}/${endpointPath}`;
  };

  const copyText = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(message);
      setError("");
    } catch {
      setError("Could not copy to clipboard. Please copy the text manually.");
    }
  };

  const copyResponse = (server) =>
    copyText(
      JSON.stringify(server.responseBody, null, 2),
      "Response JSON copied."
    );

  const testEndpoint = (server) => {
    const url = getPublicUrl(server);

    if (!url) {
      setError(
        "This endpoint has no public ID yet. Recreate it after updating the backend model."
      );
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mock-servers-layout">
      <Navbar />

      <main className="mock-servers-main">
        <header className="mock-servers-header">
          <div>
            <div className="mock-servers-title">
              <Server size={28} />
              <h1>Mock Servers</h1>
            </div>

            <p>
              Create simulated API endpoints and test your applications
              without a real backend.
            </p>
          </div>

          <button
            className="mock-create-button"
            onClick={() => {
              setShowForm((previous) => !previous);
              setError("");
              setNotice("");
            }}
          >
            <Plus size={18} />
            Create Mock Endpoint
          </button>
        </header>

        <section className="mock-info-card">
          <div className="mock-info-icon">
            <Globe size={24} />
          </div>

          <div>
            <h3>What is a Mock Server?</h3>
            <p>
              A mock server returns predefined responses for API requests.
              Use it to test frontend applications before your actual
              backend is ready.
            </p>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            style={{
              margin: "16px 0",
              padding: "12px 16px",
              color: "#b42318",
              background: "#fef3f2",
              border: "1px solid #fecdca",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            style={{
              margin: "16px 0",
              padding: "12px 16px",
              color: "#067647",
              background: "#ecfdf3",
              border: "1px solid #abefc6",
              borderRadius: "8px",
            }}
          >
            {notice}
          </div>
        )}

        {showForm && (
          <section className="mock-form-card">
            <h2>Create Mock Endpoint</h2>

            <form onSubmit={createServer}>
              <label>
                Endpoint Name
                <input
                  type="text"
                  placeholder="e.g. Get Users"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  maxLength={100}
                  required
                />
              </label>

              <div className="mock-form-row">
                <label>
                  HTTP Method
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>PATCH</option>
                    <option>DELETE</option>
                  </select>
                </label>

                <label>
                  Status Code
                  <select
                    value={statusCode}
                    onChange={(e) => setStatusCode(e.target.value)}
                  >
                    <option value="200">200 OK</option>
                    <option value="201">201 Created</option>
                    <option value="400">400 Bad Request</option>
                    <option value="401">401 Unauthorized</option>
                    <option value="404">404 Not Found</option>
                    <option value="500">500 Server Error</option>
                  </select>
                </label>
              </div>

              <label>
                Endpoint Path
                <input
                  type="text"
                  placeholder="/api/users"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  required
                />
              </label>

              <label>
                Response Body (JSON)
                <textarea
                  rows={8}
                  value={responseBody}
                  onChange={(e) => setResponseBody(e.target.value)}
                  spellCheck={false}
                  required
                />
              </label>

              <div className="mock-form-actions">
                <button
                  type="button"
                  className="mock-cancel-button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="mock-create-button"
                  disabled={saving}
                >
                  <Plus size={18} />
                  {saving ? "Saving..." : "Create Endpoint"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mock-endpoints-section">
          <div className="mock-section-heading">
            <h2>Your Mock Endpoints</h2>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span>{servers.length} endpoints</span>

              <button
                type="button"
                onClick={loadServers}
                disabled={loading}
                title="Refresh endpoints"
                aria-label="Refresh endpoints"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mock-empty-state">
              <p>Loading mock endpoints from MongoDB...</p>
            </div>
          ) : servers.length === 0 ? (
            <div className="mock-empty-state">
              <Server size={42} />
              <h3>No mock endpoints yet</h3>
              <p>Create your first mock endpoint to get started.</p>

              <button
                className="mock-create-button"
                onClick={() => setShowForm(true)}
              >
                <Plus size={18} />
                Create Your First Endpoint
              </button>
            </div>
          ) : (
            <div className="mock-endpoints-list">
              {servers.map((server) => {
                const publicUrl = getPublicUrl(server);

                return (
                  <article
                    className="mock-endpoint-card"
                    key={server._id}
                  >
                    <div className="mock-endpoint-top">
                      <div>
                        <h3>{server.name}</h3>

                        <div className="mock-endpoint-url">
                          <span className="mock-method">
                            {server.method}
                          </span>

                          <code>{server.path}</code>
                        </div>
                      </div>

                      <span className="mock-status-badge">
                        {server.statusCode}
                      </span>
                    </div>

                    <div className="mock-response-preview">
                      <div className="mock-response-heading">
                        <span>Response Preview</span>

                        <button
                          type="button"
                          onClick={() => copyResponse(server)}
                          title="Copy response JSON"
                        >
                          <Copy size={15} />
                          Copy JSON
                        </button>
                      </div>

                      <pre>
                        {JSON.stringify(server.responseBody, null, 2)}
                      </pre>
                    </div>

                    {publicUrl && (
                      <div style={{ marginTop: 16 }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: 8,
                            fontWeight: 600,
                          }}
                        >
                          Public Mock URL
                        </label>

                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <input
                            aria-label="Public mock URL"
                            readOnly
                            value={publicUrl}
                            onFocus={(e) => e.target.select()}
                            style={{
                              flex: "1 1 300px",
                              minWidth: 0,
                              padding: "10px 12px",
                            }}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              copyText(publicUrl, "Public URL copied.")
                            }
                          >
                            <Copy size={15} />
                            Copy URL
                          </button>

                          <button
                            type="button"
                            onClick={() => testEndpoint(server)}
                          >
                            <ExternalLink size={15} />
                            Test URL
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mock-endpoint-actions">
                      <span className="mock-local-label">
                        <Play size={14} />
                        Saved in MongoDB
                      </span>

                      <button
                        type="button"
                        className="mock-delete-button"
                        onClick={() => deleteServer(server._id)}
                        disabled={deletingId === server._id}
                      >
                        <Trash2 size={16} />
                        {deletingId === server._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MockServers;