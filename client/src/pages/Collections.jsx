import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../api/axios";

function Collections() {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState("");

  const fetchCollections = async () => {
    try {
      const res = await api.get("/collections");
      setCollections(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const createCollection = async (e) => {
    e.preventDefault();

    try {
      await api.post("/collections", { name });
      setName("");
      fetchCollections();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCollection = async (id) => {
    try {
      await api.delete(`/collections/${id}`);
      fetchCollections();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <>
      <Navbar />

      <div className="page">
        <h1>Collections</h1>
        <p>Organize your APIs into collections</p>

        <form className="inline-form" onSubmit={createCollection}>
          <input
            type="text"
            placeholder="Collection name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit">Add Collection</button>
        </form>

        <div className="list">
          {collections.length === 0 ? (
            <p>No collections yet.</p>
          ) : (
            collections.map((collection) => (
              <div className="list-card" key={collection._id}>
                <strong>{collection.name}</strong>
                <button onClick={() => deleteCollection(collection._id)}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Collections;