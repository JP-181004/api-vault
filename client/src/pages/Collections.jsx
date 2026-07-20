import { useEffect, useState } from "react";
import { Folder, Plus, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "./Collections.css";

function Collections() {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchCollections = async () => {
    try {
      setError("");
      const response = await api.get("/collections");
      setCollections(response.data);
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to load collections.");
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (event) => {
    event.preventDefault();

    if (!name.trim()) return;

    try {
      setSubmitting(true);
      setError("");

      await api.post("/collections", {
        name: name.trim(),
      });

      setName("");
      await fetchCollections();
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to create collection.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCollection = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this collection?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/collections/${id}`);
      await fetchCollections();
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to delete collection.");
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <div className="collections-shell">
      <Navbar />

      <main className="collections-main">
        <section className="collections-content">
          <div className="collections-header">
            <div>
              <h1>Collections</h1>
              <p>Organize your saved APIs into collections.</p>
            </div>

            <div className="collection-count">
              <Folder size={20} />
              <span>{collections.length} collections</span>
            </div>
          </div>

          <section className="collection-form-card">
            <div className="collection-form-heading">
              <div className="collection-form-icon">
                <Plus size={22} />
              </div>

              <div>
                <h2>Create a collection</h2>
                <p>Give your collection a clear and descriptive name.</p>
              </div>
            </div>

            <form className="collection-form" onSubmit={createCollection}>
              <input
                type="text"
                placeholder="Example: Authentication APIs"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />

              <button type="submit" disabled={submitting}>
                <Plus size={18} />
                {submitting ? "Adding..." : "Add Collection"}
              </button>
            </form>
          </section>

          {error && <div className="collections-error">{error}</div>}

          <section className="collections-list-card">
            <div className="collections-list-heading">
              <h2>Your Collections</h2>
              <span>{collections.length} total</span>
            </div>

            {loading ? (
              <div className="collections-empty">Loading collections...</div>
            ) : collections.length === 0 ? (
              <div className="collections-empty">
                <Folder size={44} />
                <h3>No collections yet</h3>
                <p>Create your first collection using the form above.</p>
              </div>
            ) : (
              <div className="collections-grid">
                {collections.map((collection) => (
                  <article
                    className="collection-item"
                    key={collection._id}
                  >
                    <div className="collection-item-icon">
                      <Folder size={24} />
                    </div>

                    <div className="collection-item-information">
                      <strong>{collection.name}</strong>
                      <span>
                        Created{" "}
                        {collection.createdAt
                          ? new Date(collection.createdAt).toLocaleDateString()
                          : "recently"}
                      </span>
                    </div>

                    <button
                      className="collection-delete-button"
                      onClick={() => deleteCollection(collection._id)}
                      title="Delete collection"
                    >
                      <Trash2 size={18} />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default Collections;