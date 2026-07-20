import { useEffect, useMemo, useState } from "react";
import {
  Code2,
  ExternalLink,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "./Apis.css";

function Apis() {
  const [apis, setApis] = useState([]);
  const [collections, setCollections] = useState([]);

  const [title, setTitle] = useState("");
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [collection, setCollection] = useState("");
  const [description, setDescription] = useState("");

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [collectionFilter, setCollectionFilter] = useState("ALL");
  const [favoriteFilter, setFavoriteFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(
    window.location.hash === "#add-api"
  );

  const fetchApis = async () => {
    try {
      setError("");
      const response = await api.get("/apis");
      setApis(response.data);
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to load APIs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await api.get("/collections");
      setCollections(response.data);

      if (response.data.length > 0) {
        setCollection((current) => current || response.data[0]._id);
      }
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to load collections.");
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
    window.history.replaceState(null, "", "/apis#add-api");
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    window.history.replaceState(null, "", "/apis");
  };

  const createApi = async (event) => {
    event.preventDefault();

    if (!collection) {
      setError("Create a collection before adding an API.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post("/apis", {
        title: title.trim(),
        method,
        url: url.trim(),
        collection,
        description: description.trim(),
      });

      setTitle("");
      setMethod("GET");
      setUrl("");
      setDescription("");

      await fetchApis();
      closeAddModal();
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to add this API.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteApi = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this API?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/apis/${id}`);
      await fetchApis();
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to delete this API.");
    }
  };

  const toggleFavorite = async (apiItem) => {
    try {
      await api.put(`/apis/${apiItem._id}`, {
        isFavorite: !apiItem.isFavorite,
      });

      setApis((currentApis) =>
        currentApis.map((item) =>
          item._id === apiItem._id
            ? { ...item, isFavorite: !item.isFavorite }
            : item
        )
      );
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to update favourite.");
    }
  };

  useEffect(() => {
    fetchApis();
    fetchCollections();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setShowAddModal(window.location.hash === "#add-api");
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const filteredApis = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return apis
      .filter(
        (item) =>
          !searchValue ||
          item.title?.toLowerCase().includes(searchValue) ||
          item.url?.toLowerCase().includes(searchValue) ||
          item.method?.toLowerCase().includes(searchValue)
      )
      .filter(
        (item) => methodFilter === "ALL" || item.method === methodFilter
      )
      .filter(
        (item) =>
          collectionFilter === "ALL" ||
          item.collection?._id === collectionFilter
      )
      .filter(
        (item) =>
          favoriteFilter === "ALL" || item.isFavorite === true
      );
  }, [
    apis,
    search,
    methodFilter,
    collectionFilter,
    favoriteFilter,
  ]);

  return (
    <div className="apis-shell">
      <Navbar />

      <main className="apis-main">
        <section className="apis-content">
          <header className="apis-header">
            <div>
              <h1>API Endpoints</h1>
              <p>Save, organize and manage your API endpoints.</p>
            </div>

            <div className="apis-header-actions">
              <div className="api-total">
                <Code2 size={20} />
                <span>{apis.length} APIs</span>
              </div>

              <button
                className="open-api-modal-button"
                onClick={openAddModal}
              >
                <Plus size={18} />
                Add API
              </button>
            </div>
          </header>

          {error && <div className="apis-error">{error}</div>}

          <section className="api-list-section">
            <div className="api-list-heading">
              <div>
                <h2>Your APIs</h2>
                <p>{filteredApis.length} endpoints found</p>
              </div>
            </div>

            <div className="api-filters">
              <div className="api-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search title, URL or method..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                value={methodFilter}
                onChange={(event) =>
                  setMethodFilter(event.target.value)
                }
              >
                <option value="ALL">All methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>

              <select
                value={collectionFilter}
                onChange={(event) =>
                  setCollectionFilter(event.target.value)
                }
              >
                <option value="ALL">All collections</option>

                {collections.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                value={favoriteFilter}
                onChange={(event) =>
                  setFavoriteFilter(event.target.value)
                }
              >
                <option value="ALL">All APIs</option>
                <option value="FAVORITE">Favourites only</option>
              </select>
            </div>

            {loading ? (
              <div className="apis-empty">Loading APIs...</div>
            ) : filteredApis.length === 0 ? (
              <div className="apis-empty">
                <Code2 size={44} />
                <h3>No APIs found</h3>
                <p>Add an API or change the selected filters.</p>
              </div>
            ) : (
              <div className="api-card-grid">
                {filteredApis.map((apiItem) => (
                  <article
                    className="api-endpoint-card"
                    key={apiItem._id}
                  >
                    <div className="endpoint-card-top">
                      <span
                        className={`endpoint-method method-${apiItem.method?.toLowerCase()}`}
                      >
                        {apiItem.method}
                      </span>

                      <div className="endpoint-actions">
                        <button
                          className={`favorite-api-button ${
                            apiItem.isFavorite ? "selected" : ""
                          }`}
                          onClick={() => toggleFavorite(apiItem)}
                          title="Toggle favourite"
                        >
                          <Star
                            size={18}
                            fill={
                              apiItem.isFavorite
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>

                        <button
                          className="delete-api-button"
                          onClick={() => deleteApi(apiItem._id)}
                          title="Delete API"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <h3>{apiItem.title}</h3>

                    <a
                      href={apiItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="endpoint-url"
                    >
                      <span>{apiItem.url}</span>
                      <ExternalLink size={15} />
                    </a>

                    {apiItem.description && (
                      <p className="endpoint-description">
                        {apiItem.description}
                      </p>
                    )}

                    <div className="endpoint-collection">
                      <span>Collection</span>
                      <strong>
                        {apiItem.collection?.name || "No collection"}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>

      {showAddModal && (
        <div
          className="api-modal-overlay"
          onMouseDown={closeAddModal}
        >
          <section
            className="add-api-card api-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="close-api-modal"
              onClick={closeAddModal}
              title="Close"
            >
              <X size={21} />
            </button>

            <div className="add-api-heading">
              <div className="add-api-icon">
                <Plus size={22} />
              </div>

              <div>
                <h2>Add a new API</h2>
                <p>Store a new endpoint inside your API Vault.</p>
              </div>
            </div>

            {collections.length === 0 && (
              <div className="api-warning">
                Create a collection before adding your first API.
              </div>
            )}

            <form className="new-api-form" onSubmit={createApi}>
              <label>
                <span>API title</span>
                <input
                  type="text"
                  placeholder="Example: Get all users"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </label>

              <label>
                <span>HTTP method</span>
                <select
                  value={method}
                  onChange={(event) => setMethod(event.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </label>

              <label>
                <span>API URL</span>
                <input
                  type="url"
                  placeholder="https://api.example.com/users"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  required
                />
              </label>

              <label>
                <span>Collection</span>
                <select
                  value={collection}
                  onChange={(event) =>
                    setCollection(event.target.value)
                  }
                  required
                >
                  {collections.length === 0 ? (
                    <option value="">
                      No collections available
                    </option>
                  ) : (
                    collections.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="description-field">
                <span>Description</span>
                <textarea
                  placeholder="Write a short description of this endpoint..."
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />
              </label>

              <button
                className="add-api-button"
                type="submit"
                disabled={submitting || collections.length === 0}
              >
                <Plus size={19} />
                {submitting ? "Adding API..." : "Add API"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Apis;