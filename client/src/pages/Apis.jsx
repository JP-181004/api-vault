import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../api/axios";

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

  const fetchApis = async () => {
    try {
      const res = await api.get("/apis");
      setApis(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await api.get("/collections");
      setCollections(res.data);

      if (res.data.length > 0) {
        setCollection(res.data[0]._id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createApi = async (e) => {
    e.preventDefault();

    try {
      await api.post("/apis", {
        title,
        method,
        url,
        collection,
        description,
      });

      setTitle("");
      setMethod("GET");
      setUrl("");
      setDescription("");

      fetchApis();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteApi = async (id) => {
    try {
      await api.delete(`/apis/${id}`);
      fetchApis();
    } catch (error) {
      console.log(error);
    }
  };

  const toggleFavorite = async (apiItem) => {
    try {
      await api.put(`/apis/${apiItem._id}`, {
        isFavorite: !apiItem.isFavorite,
      });

      fetchApis();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchApis();
    fetchCollections();
  }, []);

  return (
    <>
      <Navbar />

      <div className="page">
        <h1>APIs</h1>
        <p>Manage your saved API endpoints</p>

        <form className="api-form" onSubmit={createApi}>
          <input
            type="text"
            placeholder="API title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          <input
            type="text"
            placeholder="API URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />

          <select
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            required
          >
            {collections.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit">Add API</button>
        </form>

        <input
          type="text"
          placeholder="Search APIs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="ALL">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>

        <select
          value={collectionFilter}
          onChange={(e) => setCollectionFilter(e.target.value)}
        >
          <option value="ALL">All Collections</option>
          {collections.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={favoriteFilter}
          onChange={(e) => setFavoriteFilter(e.target.value)}
        >
          <option value="ALL">All APIs</option>
          <option value="FAVORITE">Favorites Only</option>
        </select>

        <div className="list">
          {apis.length === 0 ? (
            <p>No APIs added yet.</p>
          ) : (
            apis
              .filter(
                (apiItem) =>
                  apiItem.title.toLowerCase().includes(search.toLowerCase()) ||
                  apiItem.url.toLowerCase().includes(search.toLowerCase()) ||
                  apiItem.method.toLowerCase().includes(search.toLowerCase())
              )
              .filter(
                (apiItem) =>
                  methodFilter === "ALL" || apiItem.method === methodFilter
              )
              .filter(
                (apiItem) =>
                  collectionFilter === "ALL" ||
                  apiItem.collection?._id === collectionFilter
              )
              .filter(
                (apiItem) =>
                  favoriteFilter === "ALL" || apiItem.isFavorite === true
              )
              .map((apiItem) => (
                <div className="list-card" key={apiItem._id}>
                  <div>
                    <strong>{apiItem.title}</strong>{" "}
                    <span>{apiItem.method}</span>

                    <p>{apiItem.url}</p>

                    <small>{apiItem.collection?.name}</small>

                    <br />
                    <br />

                    <button onClick={() => toggleFavorite(apiItem)}>
                      {apiItem.isFavorite ? "⭐ Favorite" : "☆ Mark Favorite"}
                    </button>

                    <button
                      onClick={() => deleteApi(apiItem._id)}
                      style={{ marginLeft: "10px" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </>
  );
}

export default Apis;