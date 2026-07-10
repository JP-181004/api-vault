import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        setStats(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDashboard();
  }, []);

  if (!stats) {
    return (
      <>
        <Navbar />
        <h1>Loading Dashboard...</h1>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="page">
        <h1>API Vault Dashboard</h1>
        <p>Overview of your saved APIs</p>

        <div className="stats-grid">
          <div className="stat-card">
            <h2>{stats.totalCollections}</h2>
            <p>Total Collections</p>
          </div>

          <div className="stat-card">
            <h2>{stats.totalApis}</h2>
            <p>Total APIs</p>
          </div>

          <div className="stat-card">
            <h2>{stats.recentApis?.length || 0}</h2>
            <p>Recent APIs</p>
          </div>
        </div>

        <h2>Recent APIs</h2>

        <div className="list">
          {stats.recentApis?.length === 0 ? (
            <p>No APIs added yet.</p>
          ) : (
            stats.recentApis.map((apiItem) => (
              <div className="list-card" key={apiItem._id}>
                <strong>{apiItem.title}</strong>
                <span>{apiItem.method}</span>
                <p>{apiItem.url}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;