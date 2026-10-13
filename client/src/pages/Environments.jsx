import { useState } from "react";
import { Plus, Trash2, Settings2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Environments.css";

const DEFAULT_ENVIRONMENTS = [
  {
    id: "development",
    name: "Development",
    variables: [
      {
        key: "BASE_URL",
        value: "https://jsonplaceholder.typicode.com",
        enabled: true,
      },
    ],
  },
  {
    id: "staging",
    name: "Staging",
    variables: [],
  },
  {
    id: "production",
    name: "Production",
    variables: [],
  },
];

function readEnvironments() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("apiVaultEnvironments") || "null"
    );

    return Array.isArray(stored) && stored.length
      ? stored
      : DEFAULT_ENVIRONMENTS;
  } catch {
    return DEFAULT_ENVIRONMENTS;
  }
}

function Environments() {
  const navigate = useNavigate();

  const [environments, setEnvironments] = useState(readEnvironments);
  const [activeEnvironmentId, setActiveEnvironmentId] = useState(
    () => localStorage.getItem("apiVaultActiveEnvironment") || "development"
  );
  const [newEnvironmentName, setNewEnvironmentName] = useState("");

  const activeEnvironment =
    environments.find((environment) => environment.id === activeEnvironmentId) ||
    environments[0];

  function persistEnvironments(updated) {
    setEnvironments(updated);
    localStorage.setItem("apiVaultEnvironments", JSON.stringify(updated));
  }

  function createEnvironment(event) {
    event.preventDefault();

    const name = newEnvironmentName.trim();

    if (!name) return;

    if (
      environments.some(
        (environment) => environment.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      window.alert("An environment with this name already exists.");
      return;
    }

    const environment = {
      id: `env-${Date.now()}`,
      name,
      variables: [],
    };

    persistEnvironments([...environments, environment]);
    setActiveEnvironmentId(environment.id);
    localStorage.setItem("apiVaultActiveEnvironment", environment.id);
    setNewEnvironmentName("");
  }

  function renameEnvironment(id, name) {
    persistEnvironments(
      environments.map((environment) =>
        environment.id === id ? { ...environment, name } : environment
      )
    );
  }

  function deleteEnvironment(environment) {
    if (environments.length === 1) {
      window.alert("At least one environment must remain.");
      return;
    }

    if (!window.confirm(`Delete "${environment.name}" and all its variables?`)) {
      return;
    }

    const updated = environments.filter((item) => item.id !== environment.id);

    persistEnvironments(updated);

    if (activeEnvironmentId === environment.id) {
      setActiveEnvironmentId(updated[0].id);
      localStorage.setItem("apiVaultActiveEnvironment", updated[0].id);
    }
  }

  function updateVariable(environmentId, index, field, value) {
    persistEnvironments(
      environments.map((environment) =>
        environment.id === environmentId
          ? {
              ...environment,
              variables: environment.variables.map((variable, i) =>
                i === index ? { ...variable, [field]: value } : variable
              ),
            }
          : environment
      )
    );
  }

  function addVariable(environmentId) {
    const environment = environments.find((item) => item.id === environmentId);

    if (!environment) return;

    persistEnvironments(
      environments.map((item) =>
        item.id === environmentId
          ? {
              ...item,
              variables: [
                ...item.variables,
                { key: "", value: "", enabled: true },
              ],
            }
          : item
      )
    );
  }

  function deleteVariable(environmentId, index) {
    persistEnvironments(
      environments.map((environment) =>
        environment.id === environmentId
          ? {
              ...environment,
              variables: environment.variables.filter((_, i) => i !== index),
            }
          : environment
      )
    );
  }

  return (
    <div className="workspace-shell">
      <Navbar />

      <main className="workspace-main environments-page">
        <header className="workspace-topbar">
          <div>
            <span className="workspace-eyebrow">API VAULT / WORKSPACE</span>
            <h1>Environments</h1>
            <p>Manage variables for development, staging, and production APIs.</p>
          </div>

          <button className="send-button" onClick={() => navigate("/workspace")}>
            <ArrowLeft size={16} />
            Back to API Testing
          </button>
        </header>

        <section className="response-card">
          <div className="response-heading">
            <div className="request-title">
              <Settings2 size={19} />
              <span>Active Environment</span>
            </div>
          </div>

          <div className="environment-selector">
            <label htmlFor="active-environment">Select environment</label>

            <select
              id="active-environment"
              value={activeEnvironment?.id || ""}
              onChange={(event) => {
                setActiveEnvironmentId(event.target.value);
                localStorage.setItem(
                  "apiVaultActiveEnvironment",
                  event.target.value
                );
              }}
            >
              {environments.map((environment) => (
                <option key={environment.id} value={environment.id}>
                  {environment.name}
                </option>
              ))}
            </select>

            <span className="environment-variable-count">
              {activeEnvironment?.variables.filter(
                (variable) => variable.enabled && variable.key.trim()
              ).length || 0}{" "}
              enabled variables
            </span>
          </div>
        </section>

        <section className="response-card">
          <div className="response-heading">
            <div className="request-title">
              <Settings2 size={19} />
              <span>Manage Environments</span>
            </div>
          </div>

          <form className="environment-create-form" onSubmit={createEnvironment}>
            <input
              value={newEnvironmentName}
              onChange={(event) => setNewEnvironmentName(event.target.value)}
              placeholder="Enter environment name"
              aria-label="New environment name"
            />

            <button className="send-button" type="submit">
              <Plus size={16} />
              Create Environment
            </button>
          </form>

          {environments.map((environment) => (
            <div className="environment-manager-item" key={environment.id}>
              <div className="environment-manager-heading">
                <input
                  value={environment.name}
                  aria-label={`Environment name: ${environment.id}`}
                  onChange={(event) =>
                    renameEnvironment(environment.id, event.target.value)
                  }
                />

                <button
                  className="remove-row-button"
                  onClick={() => deleteEnvironment(environment)}
                  title="Delete environment"
                  aria-label={`Delete ${environment.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="environment-variables-heading">
                <strong>Environment Variables</strong>

                <button
                  className="add-row-button"
                  onClick={() => addVariable(environment.id)}
                  type="button"
                >
                  <Plus size={15} />
                  Add Variable
                </button>
              </div>

              {environment.variables.length === 0 && (
                <p className="editor-hint">
                  No variables configured for this environment.
                </p>
              )}

              {environment.variables.map((variable, index) => (
                <div
                  className="environment-variable-row"
                  key={`${environment.id}-${index}`}
                >
                  <input
                    type="checkbox"
                    checked={variable.enabled}
                    aria-label={`Enable variable ${index + 1}`}
                    onChange={(event) =>
                      updateVariable(
                        environment.id,
                        index,
                        "enabled",
                        event.target.checked
                      )
                    }
                  />

                  <input
                    value={variable.key}
                    placeholder="Variable name (e.g. BASE_URL)"
                    aria-label={`Variable name ${index + 1}`}
                    onChange={(event) =>
                      updateVariable(
                        environment.id,
                        index,
                        "key",
                        event.target.value
                      )
                    }
                  />

                  <input
                    value={variable.value}
                    placeholder="Variable value"
                    aria-label={`Variable value ${index + 1}`}
                    onChange={(event) =>
                      updateVariable(
                        environment.id,
                        index,
                        "value",
                        event.target.value
                      )
                    }
                  />

                  <button
                    className="remove-row-button"
                    onClick={() => deleteVariable(environment.id, index)}
                    type="button"
                    title="Delete variable"
                    aria-label={`Delete variable ${index + 1}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              <p className="editor-hint">
                Use variables in requests with double curly braces, for example{" "}
                <code>{"{{BASE_URL}}"}</code>.
              </p>
            </div>
          ))}
        </section>

        <footer className="workspace-footer">
          API Vault · Environment Manager
        </footer>
      </main>
    </div>
  );
}

export default Environments;