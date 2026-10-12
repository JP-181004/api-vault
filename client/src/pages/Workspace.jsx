import { useState } from "react";

import api from "../api/axios";

import {

  Send,

  Plus,

  Trash2,

  Clock,

  CheckCircle2,

  AlertCircle,

  Code2,

  FileJson,

  Settings2,

} from "lucide-react";

import Navbar from "../components/Navbar";

import "./Workspace.css";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function Workspace() {

  const [method, setMethod] = useState("GET");

  const [url, setUrl] = useState("");

  const [activeTab, setActiveTab] = useState("Params");

  const [params, setParams] = useState([{ key: "", value: "", enabled: true }]);

  const [headers, setHeaders] = useState([

    { key: "", value: "", enabled: true },

  ]);

  const [body, setBody] = useState(

    JSON.stringify({ message: "Hello API Vault" }, null, 2)

  );

  const [bodyType, setBodyType] = useState("json");

  const [response, setResponse] = useState(null);

  const [requestError, setRequestError] = useState("");

  const [loading, setLoading] = useState(false);

  const updateRow = (setter, rows, index, field, value) => {

    setter(

      rows.map((row, rowIndex) =>

        rowIndex === index ? { ...row, [field]: value } : row

      )

    );

  };

  const addRow = (setter, rows) => {

    setter([...rows, { key: "", value: "", enabled: true }]);

  };

  const removeRow = (setter, rows, index) => {

    setter(rows.filter((_, rowIndex) => rowIndex !== index));

  };

const handleSend = async () => {
    setRequestError("");
    setResponse(null);

    if (!url.trim()) {
      setRequestError("Enter a request URL first.");
      return;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      setRequestError("Enter a valid absolute URL, including https://.");
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setRequestError("Only HTTP and HTTPS URLs are supported.");
      return;
    }

    if (method !== "GET" && method !== "DELETE" && bodyType === "json") {
      try {
        JSON.parse(body);
      } catch {
        setRequestError("The request body contains invalid JSON.");
        return;
      }
    }

    setLoading(true);
    const startedAt = performance.now();

    try {
      const requestUrl = new URL(url.trim());

      params.forEach((param) => {
        if (param.enabled && param.key.trim()) {
          requestUrl.searchParams.append(param.key.trim(), param.value);
        }
      });

      const requestHeaders = {};

      headers.forEach((header) => {
        if (header.enabled && header.key.trim()) {
          requestHeaders[header.key.trim()] = header.value;
        }
      });

      if (
        method !== "GET" &&
        method !== "DELETE" &&
        bodyType === "json" &&
        !Object.keys(requestHeaders).some(
          (key) => key.toLowerCase() === "content-type"
        )
      ) {
        requestHeaders["Content-Type"] = "application/json";
      }

      const requestBody =
        method !== "GET" && method !== "DELETE" && body.trim()
          ? body
          : undefined;

      const result = await api.post("/test", {
        method,
        url: requestUrl.toString(),
        headers: requestHeaders,
        body: requestBody,
      });

      const elapsed = Math.round(performance.now() - startedAt);
      const responseText =
        typeof result.data.body === "string"
          ? result.data.body
          : JSON.stringify(result.data.body ?? "");

      let formattedBody = responseText;

      try {
        formattedBody = JSON.stringify(JSON.parse(responseText), null, 2);
      } catch {
        // Keep non-JSON responses as plain text.
      }

      setResponse({
        status: result.data.status,
        statusText: result.data.statusText,
        time: elapsed,
        size: result.data.size ?? new Blob([responseText]).size,
        body: formattedBody,
        headers: Object.entries(result.data.headers || {}),
      });
    } catch (error) {
      setRequestError(
        error.response?.data?.message ||
          error.message ||
          "The request failed. Check the URL and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="workspace-shell">

      <Navbar />

      <main className="workspace-main">

        <header className="workspace-topbar">

          <div>

            <span className="workspace-eyebrow">API VAULT / WORKSPACE</span>

            <h1>API Testing</h1>

            <p>Build requests, inspect responses, and debug your APIs.</p>

          </div>

          <div className="workspace-status">

            <span className="status-dot" />

            Request workspace

          </div>

        </header>

        <section className="request-card">

          <div className="request-card-heading">

            <div className="request-title">

              <Code2 size={19} />

              <span>New Request</span>

            </div>

            <span className="request-badge">HTTP</span>

          </div>

          <div className="request-url-row">

            <select

              value={method}

              onChange={(event) => setMethod(event.target.value)}

              className={`method-select method-${method.toLowerCase()}`}

              aria-label="HTTP method"

            >

              {METHODS.map((item) => (

                <option key={item} value={item}>

                  {item}

                </option>

              ))}

            </select>

            <input

              className="url-input"

              type="url"

              placeholder="https://api.example.com/users"

              value={url}

              onChange={(event) => setUrl(event.target.value)}

              onKeyDown={(event) => {

                if (event.key === "Enter") handleSend();

              }}

              aria-label="Request URL"

            />

            <button

              className="send-button"

              onClick={handleSend}

              disabled={loading}

            >

              <Send size={16} />

              {loading ? "Sending..." : "Send"}

            </button>

          </div>

          <div className="request-tabs" role="tablist">

            {[

              { name: "Params", icon: <Settings2 size={15} /> },

              { name: "Headers", icon: <Settings2 size={15} /> },

              { name: "Body", icon: <FileJson size={15} /> },

            ].map((tab) => (

              <button

                key={tab.name}

                className={`request-tab ${

                  activeTab === tab.name ? "active" : ""

                }`}

                onClick={() => setActiveTab(tab.name)}

                role="tab"

                aria-selected={activeTab === tab.name}

              >

                {tab.icon}

                {tab.name}

                {tab.name === "Params" && params.some((p) => p.key) && (

                  <span className="tab-count">

                    {params.filter((p) => p.key.trim() && p.enabled).length}

                  </span>

                )}

                {tab.name === "Headers" &&

                  headers.some((h) => h.key) && (

                    <span className="tab-count">

                      {

                        headers.filter((h) => h.key.trim() && h.enabled)

                          .length

                      }

                    </span>

                  )}

              </button>

            ))}

          </div>

          <div className="request-editor">

            {activeTab === "Params" && (

              <KeyValueEditor

                title="Query Parameters"

                rows={params}

                onChange={(index, field, value) =>

                  updateRow(setParams, params, index, field, value)

                }

                onAdd={() => addRow(setParams, params)}

                onRemove={(index) => removeRow(setParams, params, index)}

              />

            )}

            {activeTab === "Headers" && (

              <KeyValueEditor

                title="Request Headers"

                rows={headers}

                onChange={(index, field, value) =>

                  updateRow(setHeaders, headers, index, field, value)

                }

                onAdd={() => addRow(setHeaders, headers)}

                onRemove={(index) => removeRow(setHeaders, headers, index)}

              />

            )}

            {activeTab === "Body" && (

              <div className="body-editor">

                <div className="editor-toolbar">

                  <span>Request Body</span>

                  <select

                    value={bodyType}

                    onChange={(event) => setBodyType(event.target.value)}

                    aria-label="Body type"

                  >

                    <option value="json">JSON</option>

                    <option value="text">Plain text</option>

                  </select>

                </div>

                <textarea

                  className="body-textarea"

                  value={body}

                  onChange={(event) => setBody(event.target.value)}

                  spellCheck="false"

                  aria-label="Request body"

                />

                <p className="editor-hint">

                  {method === "GET" || method === "DELETE"

                    ? `${method} requests typically do not use a request body.`

                    : "Check your body format and headers before sending."}

                </p>

              </div>

            )}

          </div>

        </section>

        <section className="response-card">

          <div className="response-heading">

            <div className="request-title">

              <FileJson size={19} />

              <span>Response</span>

            </div>

            {response && (

              <div className="response-meta">

                <span

                  className={`response-status ${

                    response.status >= 200 && response.status < 300

                      ? "success"

                      : "failure"

                  }`}

                >

                  {response.status >= 200 && response.status < 300 ? (

                    <CheckCircle2 size={14} />

                  ) : (

                    <AlertCircle size={14} />

                  )}

                  {response.status} {response.statusText}

                </span>

                <span className="response-meta-item">

                  <Clock size={14} />

                  {response.time} ms

                </span>

                <span className="response-meta-item">

                  {(response.size / 1024).toFixed(2)} KB

                </span>

              </div>

            )}

          </div>

          {requestError && (

            <div className="request-error">

              <AlertCircle size={18} />

              <span>{requestError}</span>

            </div>

          )}

          {!response && !requestError && (

            <div className="response-empty">

              <div className="response-empty-icon">

                <Send size={24} />

              </div>

              <h3>Your response will appear here</h3>

              <p>

                Enter an API URL, configure your request, and click Send.

              </p>

            </div>

          )}

          {response && (

            <>

              <div className="response-tabs">

                <span className="active">Body</span>

                <span>Headers ({response.headers.length})</span>

              </div>

              <pre className="response-body">{response.body || "(empty response)"}</pre>

              <details className="response-header-details">

                <summary>View response headers</summary>

                <pre>

                  {response.headers

                    .map(([key, value]) => `${key}: ${value}`)

                    .join("\n") || "No readable response headers"}

                </pre>

              </details>

            </>

          )}

        </section>

        <footer className="workspace-footer">

          API Vault · API Testing Workspace

        </footer>

      </main>

    </div>

  );

}

function KeyValueEditor({

  title,

  rows,

  onChange,

  onAdd,

  onRemove,

}) {

  return (

    <div className="key-value-editor">

      <div className="editor-toolbar">

        <span>{title}</span>

        <button className="add-row-button" onClick={onAdd}>

          <Plus size={15} />

          Add row

        </button>

      </div>

      <div className="key-value-table">

        <div className="key-value-table-heading">

          <span>Enabled</span>

          <span>Key</span>

          <span>Value</span>

          <span>Action</span>

        </div>

        {rows.map((row, index) => (

          <div className="key-value-row" key={index}>

            <label className="checkbox-cell">

              <input

                type="checkbox"

                checked={row.enabled}

                onChange={(event) =>

                  onChange(index, "enabled", event.target.checked)

                }

                aria-label={`Enable row ${index + 1}`}

              />

            </label>

            <input

              value={row.key}

              onChange={(event) => onChange(index, "key", event.target.value)}

              placeholder="Key"

              aria-label={`${title} key ${index + 1}`}

            />

            <input

              value={row.value}

              onChange={(event) =>

                onChange(index, "value", event.target.value)

              }

              placeholder="Value"

              aria-label={`${title} value ${index + 1}`}

            />

            <button

              className="remove-row-button"

              onClick={() => onRemove(index)}

              aria-label={`Remove row ${index + 1}`}

              title="Remove row"

            >

              <Trash2 size={15} />

            </button>

          </div>

        ))}

      </div>

      <p className="editor-hint">

        Only enabled rows with a key will be included in the request.

      </p>

    </div>

  );

}

export default Workspace;
