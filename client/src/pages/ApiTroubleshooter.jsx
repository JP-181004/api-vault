
import { useEffect, useState } from "react";
import {
  Bug,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Code2,
  Clock3,
  ShieldAlert,
  Info,
  Activity,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";
import "./ApiTroubleshooter.css";

function CheckIcon({ status }) {
  if (status === "passed") return <CheckCircle2 size={21} />;
  if (status === "failed") return <AlertCircle size={21} />;
  return <Info size={21} />;
}

function StatusBadge({ status }) {
  const labels = {
    passed: "Passed",
    failed: "Failed",
    review: "Review",
  };

  return (
    <span className={`tr-status-badge tr-status-${status}`}>
      {labels[status] || "Review"}
    </span>
  );
}

function ApiTroubleshooter() {
  const [apis, setApis] = useState([]);
  const [selectedApiId, setSelectedApiId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApis = async () => {
      try {
        setError("");
        const response = await api.get("/apis");
        const savedApis = response.data;

        setApis(savedApis);

        if (savedApis.length > 0) {
          setSelectedApiId(savedApis[0]._id);
        }
      } catch (err) {
        console.error("Failed to load saved APIs:", err);
        setError("Unable to load saved APIs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchApis();
  }, []);

  const runTroubleshooting = async () => {
    if (!selectedApiId) {
      setError("Please select a saved API first.");
      return;
    }

    try {
      setRunning(true);
      setError("");
      setReport(null);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:5000/api/troubleshooter/${selectedApiId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Diagnostic request failed (${response.status}).`
        );
      }

      if (!data.report) {
        throw new Error("The server did not return a diagnostic report.");
      }

      setReport(data.report);
    } catch (err) {
      console.error("Troubleshooting failed:", err);
      setError(err.message || "Unable to complete diagnostics.");
    } finally {
      setRunning(false);
    }
  };

  const selectedApi = apis.find(
    (item) => item._id === selectedApiId
  );

  const checks = report?.checks || [];
  const passedCount = checks.filter(
    (check) => check.status === "passed"
  ).length;
  const failedCount = checks.filter(
    (check) => check.status === "failed"
  ).length;
  const reviewCount = checks.filter(
    (check) => check.status === "review"
  ).length;

  const overallStatus = report?.overallStatus;
  const isPassed = overallStatus === "passed";
  const needsReview = overallStatus === "review";

  const overallTitle = isPassed
    ? "All checks passed"
    : needsReview
      ? "Review recommended"
      : "Issues found";

  const overallDescription = isPassed
    ? "Your API passed all diagnostic checks. No failing checks were reported."
    : needsReview
      ? "Some checks need your attention. Review the findings below."
      : "One or more checks failed. Review the recommended actions below.";

  return (
    <div className="troubleshooter-layout">
      <Navbar />

      <main className="troubleshooter-main">
        <header className="troubleshooter-header">
          <span className="troubleshooter-breadcrumb">
            API VAULT / TROUBLESHOOTING
          </span>
          <h1>API Troubleshooter</h1>
          <p>
            Diagnose API failures and discover actionable fixes.
          </p>
        </header>

        <section className="troubleshooter-panel">
          <div className="troubleshooter-panel-heading">
            <div className="troubleshooter-heading-icon">
              <Bug size={24} />
            </div>
            <div>
              <h2>Run diagnostics</h2>
              <p>
                Select a saved endpoint to investigate its configuration
                and connectivity.
              </p>
            </div>
          </div>

          <label className="troubleshooter-label" htmlFor="saved-api">
            Select saved API
          </label>

          <select
            id="saved-api"
            className="troubleshooter-select"
            value={selectedApiId}
            onChange={(event) => {
              setSelectedApiId(event.target.value);
              setReport(null);
              setError("");
            }}
            disabled={loading || running || apis.length === 0}
          >
            {loading ? (
              <option value="">Loading saved APIs...</option>
            ) : apis.length === 0 ? (
              <option value="">No saved APIs found</option>
            ) : (
              apis.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.method} — {item.title}
                </option>
              ))
            )}
          </select>

          {selectedApi && (
            <div className="troubleshooter-selected-api">
              <Code2 size={19} />
              <div>
                <strong>{selectedApi.title}</strong>
                <span>{selectedApi.url}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="troubleshooter-run-button"
            onClick={runTroubleshooting}
            disabled={loading || running || !selectedApiId}
          >
            {running ? (
              <>
                <LoaderCircle
                  size={18}
                  className="troubleshooter-spinner"
                />
                Running diagnostics...
              </>
            ) : (
              <>
                <Play size={18} />
                Run Troubleshooting
              </>
            )}
          </button>

          {error && (
            <div className="troubleshooter-error" role="alert">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </section>

        {report && (
          <section className="troubleshooter-results">
            <div className="troubleshooter-results-heading">
              <div>
                <span className="troubleshooter-breadcrumb">
                  LATEST DIAGNOSTIC
                </span>
                <h2>Diagnostic Report</h2>
                <p>
                  Results for {report.requestTitle || selectedApi?.title}
                </p>
              </div>

              <button
                type="button"
                className="troubleshooter-rerun-button"
                onClick={runTroubleshooting}
                disabled={running}
              >
                <RefreshCw size={16} />
                Run again
              </button>
            </div>

            <div
              className={`tr-overall-card ${
                isPassed
                  ? "tr-overall-passed"
                  : needsReview
                    ? "tr-overall-review"
                    : "tr-overall-failed"
              }`}
            >
              <div className="tr-overall-icon">
                {isPassed ? (
                  <CheckCircle2 size={30} />
                ) : needsReview ? (
                  <Info size={30} />
                ) : (
                  <ShieldAlert size={30} />
                )}
              </div>

              <div className="tr-overall-copy">
                <h3>{overallTitle}</h3>
                <p>{overallDescription}</p>
              </div>

              <span className="tr-overall-count">
                {passedCount}/{checks.length} passed
              </span>
            </div>

            <div className="tr-stat-grid">
              <div className="tr-stat-card">
                <div className="tr-stat-icon tr-icon-green">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span>Passed</span>
                  <strong>{passedCount}</strong>
                </div>
              </div>

              <div className="tr-stat-card">
                <div className="tr-stat-icon tr-icon-red">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <span>Failed</span>
                  <strong>{failedCount}</strong>
                </div>
              </div>

              <div className="tr-stat-card">
                <div className="tr-stat-icon tr-icon-amber">
                  <Info size={20} />
                </div>
                <div>
                  <span>Review</span>
                  <strong>{reviewCount}</strong>
                </div>
              </div>

              <div className="tr-stat-card">
                <div className="tr-stat-icon tr-icon-purple">
                  <Activity size={20} />
                </div>
                <div>
                  <span>HTTP status</span>
                  <strong>{report.responseStatus ?? "—"}</strong>
                </div>
              </div>
            </div>

            <div className="tr-checks-heading">
              <div>
                <h3>Diagnostic checks</h3>
                <p>Detailed results for this endpoint</p>
              </div>
              <span>{checks.length} checks</span>
            </div>

            <div className="tr-check-list">
              {checks.map((check, index) => (
                <article
                  className={`tr-check-card tr-check-${check.status}`}
                  key={`${check.name}-${index}`}
                >
                  <div className="tr-check-icon">
                    <CheckIcon status={check.status} />
                  </div>

                  <div className="tr-check-content">
                    <div className="tr-check-title">
                      <h4>{check.name}</h4>
                      <StatusBadge status={check.status} />
                    </div>

                    <p className="tr-check-message">{check.message}</p>

                    {check.recommendation && (
                      <div className="tr-recommendation">
                        <strong>Recommended action</strong>
                        <p>{check.recommendation}</p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="tr-report-footer">
              <div>
                <Clock3 size={17} />
                <span>Execution time</span>
                <strong>
                  {report.durationMs != null
                    ? `${report.durationMs} ms`
                    : "Not measured"}
                </strong>
              </div>
              <div className="tr-report-note">
                Report saved successfully
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default ApiTroubleshooter;
