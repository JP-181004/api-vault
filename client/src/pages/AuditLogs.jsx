
import { useCallback, useEffect, useState } from "react";
import {
  History,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  LockKeyhole,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import "./AuditLogs.css";

const API_URL = "http://localhost:5000/api/audit-logs";

const ACTION_INFO = {
  SECRET_CREATED: {
    label: "Secret created",
    icon: KeyRound,
    className: "audit-created",
  },
  SECRET_REVEALED: {
    label: "Secret revealed",
    icon: Eye,
    className: "audit-revealed",
  },
  SECRET_COPIED: {
    label: "Secret copied",
    icon: KeyRound,
    className: "audit-copied",
  },
  SECRET_DELETED: {
    label: "Secret deleted",
    icon: Trash2,
    className: "audit-deleted",
  },
  TEXT_ENCRYPTED: {
    label: "Text encrypted",
    icon: LockKeyhole,
    className: "audit-encrypted",
  },
  TEXT_DECRYPTED: {
    label: "Text decrypted",
    icon: ShieldCheck,
    className: "audit-decrypted",
  },
};

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again to view audit logs.");
      }

      const response = await fetch(
        `${API_URL}?page=${page}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load audit logs."
        );
      }

      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setPagination(
        data.pagination || {
          page,
          limit: 20,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      setError(err.message || "Unable to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="workspace-shell">
      <Navbar />

      <main className="workspace-main audit-page">
        <header className="workspace-topbar audit-topbar">
          <div>
            <span className="workspace-eyebrow">
              API VAULT / SECURITY
            </span>
            <h1>Audit Logs</h1>
            <p>
              Review security-related activity in your Secrets Vault.
            </p>
          </div>

          <button
            className="send-button"
            onClick={loadLogs}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        <section className="audit-summary">
          <article className="audit-summary-card">
            <div className="audit-summary-icon">
              <History size={21} />
            </div>
            <div>
              <span>Total recorded events</span>
              <strong>{pagination.total}</strong>
            </div>
          </article>

          <article className="audit-summary-card">
            <div className="audit-summary-icon">
              <ShieldCheck size={21} />
            </div>
            <div>
              <span>Current page</span>
              <strong>
                {pagination.totalPages
                  ? `${pagination.page} / ${pagination.totalPages}`
                  : "—"}
              </strong>
            </div>
          </article>
        </section>

        <section className="response-card audit-card">
          <div className="audit-card-heading">
            <div>
              <h2>Activity history</h2>
              <p>
                Events are listed newest first. Secret values and
                decrypted text should never appear in this history.
              </p>
            </div>
          </div>

          {error && (
            <div className="audit-message audit-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="audit-empty">
              <RefreshCw size={25} />
              <p>Loading audit history...</p>
            </div>
          ) : !error && logs.length === 0 ? (
            <div className="audit-empty">
              <History size={30} />
              <h3>No activity recorded yet</h3>
              <p>
                Create, reveal, or delete a secret to see activity
                appear here.
              </p>
            </div>
          ) : !error ? (
            <>
              <div className="audit-table-wrap">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Resource</th>
                      <th>Details</th>
                      <th>Date and time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {logs.map((log) => {
                      const info =
                        ACTION_INFO[log.action] || {
                          label: String(log.action || "Activity")
                            .replaceAll("_", " ")
                            .toLowerCase(),
                          icon: History,
                          className: "audit-default",
                        };

                      const Icon = info.icon;

                      return (
                        <tr key={log._id}>
                          <td>
                            <span
                              className={`audit-action ${info.className}`}
                            >
                              <Icon size={15} />
                              {info.label}
                            </span>
                          </td>

                          <td>
                            <span className="audit-resource">
                              {log.resourceType === "crypto_workspace"
                                ? "Crypto workspace"
                                : "Secret"}
                            </span>
                          </td>

                          <td className="audit-details">
                            {log.details || "—"}
                          </td>

                          <td className="audit-date">
                            {formatDate(log.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="audit-pagination">
                <span>
                  {pagination.total === 0
                    ? "No events"
                    : `Showing ${(page - 1) * pagination.limit + 1}–${Math.min(
                        page * pagination.limit,
                        pagination.total
                      )} of ${pagination.total}`}
                </span>

                <div className="audit-pagination-buttons">
                  <button
                    type="button"
                    className="audit-page-button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((current) => current - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <button
                    type="button"
                    className="audit-page-button"
                    disabled={
                      loading ||
                      !pagination.totalPages ||
                      page >= pagination.totalPages
                    }
                    onClick={() => setPage((current) => current + 1)}
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </section>

        <div className="audit-security-note">
          <ShieldCheck size={19} />
          <p>
            <strong>Security note:</strong> audit logs should contain
            action metadata only. Never store API keys, plaintext,
            encryption keys, or decrypted output in log details.
          </p>
        </div>

        <footer className="workspace-footer">
          API Vault · Security Audit History
        </footer>
      </main>
    </div>
  );
}

export default AuditLogs;
