import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  Code2,
  Layers3,
  Menu,
  Search,
  Star,
} from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "./Dashboard.css";

const CHART_COLORS = [
  "#6547e9",
  "#3478ee",
  "#25b968",
  "#ff8a14",
  "#df4387",
  "#55a1b7",
];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        setStats(response.data);
      } catch (requestError) {
        console.error(requestError);
        setError("Unable to load your dashboard.");
      }
    };

    fetchDashboard();
  }, []);

  const chartData = useMemo(() => {
    if (!stats?.methodStats) return [];

    return stats.methodStats.map((item) => ({
      name: item.method || item._id || item.name || "Other",
      value: item.count || item.total || 0,
    }));
  }, [stats]);

  const filteredApis = useMemo(() => {
    const recentApis = stats?.recentApis || [];
    const value = search.trim().toLowerCase();

    if (!value) return recentApis;

    return recentApis.filter(
      (item) =>
        item.title?.toLowerCase().includes(value) ||
        item.url?.toLowerCase().includes(value) ||
        item.method?.toLowerCase().includes(value)
    );
  }, [stats, search]);

  if (error) {
    return (
      <>
        <Navbar />

        <main className="dashboard-main">
          <div className="dashboard-message error-message">
            {error}
          </div>
        </main>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <Navbar />

        <main className="dashboard-main">
          <div className="dashboard-message">
            Loading dashboard...
          </div>
        </main>
      </>
    );
  }

  return (
    <div className="dashboard-shell">
      <Navbar />

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <Menu className="menu-icon" size={24} />

          <div className="dashboard-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search recent APIs..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="user-badge">JP</div>
        </header>

        <section className="dashboard-content">
          <div className="dashboard-heading">
            <h1>Dashboard</h1>
            <p>
              Welcome back! Here’s what’s happening with your APIs.
            </p>
          </div>

          <div className="dashboard-stats">
            <StatCard
              icon={<Boxes />}
              color="purple"
              value={stats.totalCollections || 0}
              label="Total Collections"
            />

            <StatCard
              icon={<Code2 />}
              color="blue"
              value={stats.totalApis || 0}
              label="Total APIs"
            />

            <StatCard
              icon={<Layers3 />}
              color="green"
              value={stats.recentApis?.length || 0}
              label="Recent APIs"
            />

            <StatCard
              icon={<Star />}
              color="orange"
              value={stats.methodStats?.length || 0}
              label="HTTP Methods Used"
            />
          </div>

          <div className="dashboard-panels">
            <section className="dashboard-card recent-card">
              <div className="card-heading">
                <h2>Recent APIs</h2>

                <button onClick={() => navigate("/apis")}>
                  View all
                </button>
              </div>

              <div className="recent-api-list">
                {filteredApis.length === 0 ? (
                  <div className="empty-state">
                    No matching APIs found.
                  </div>
                ) : (
                  filteredApis.map((item) => (
                    <div
                      className="recent-api-row"
                      key={item._id}
                    >
                      <span
                        className={`method-badge method-${item.method?.toLowerCase()}`}
                      >
                        {item.method}
                      </span>

                      <div className="api-information">
                        <strong>{item.title}</strong>
                        <span>{item.url}</span>
                      </div>

                      <span className="collection-name">
                        {item.collection?.name || "No collection"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="dashboard-card chart-card">
              <div className="card-heading">
                <h2>APIs by Method</h2>
              </div>

              {chartData.length === 0 ? (
                <div className="empty-state">
                  No chart data available yet.
                </div>
              ) : (
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={270}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={92}
                        paddingAngle={3}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={
                              CHART_COLORS[
                                index % CHART_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="chart-total">
                    <strong>{stats.totalApis || 0}</strong>
                    <span>Total</span>
                  </div>
                </div>
              )}
            </section>
          </div>

          <section className="dashboard-card overview-card">
            <div className="card-heading">
              <h2>API Overview</h2>

              <button onClick={() => navigate("/apis")}>
                Manage APIs
              </button>
            </div>

            <div className="overview-grid">
              <div>
                <span>Collections</span>
                <strong>{stats.totalCollections || 0}</strong>
              </div>

              <div>
                <span>Saved APIs</span>
                <strong>{stats.totalApis || 0}</strong>
              </div>

              <div>
                <span>Recently added</span>
                <strong>{stats.recentApis?.length || 0}</strong>
              </div>
            </div>
          </section>

          <footer className="dashboard-footer">
            © 2026 API Vault. All rights reserved.
          </footer>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, color, value, label }) {
  return (
    <article className="dashboard-stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        <small>Live overview of your vault</small>
      </div>
    </article>
  );
}

export default Dashboard;