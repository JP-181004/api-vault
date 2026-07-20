import { NavLink, useNavigate } from "react-router-dom";
import {
  Boxes,
  Code2,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="sidebar-logo">
        <ShieldCheck size={34} />
        <span>API Vault</span>
      </NavLink>

      <nav className="sidebar-navigation">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/collections"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <Boxes size={20} />
          Collections
        </NavLink>

        <NavLink
          to="/apis"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <Code2 size={20} />
          APIs
        </NavLink>

        <a href="/apis#add-api" className="sidebar-link">
          <PlusCircle size={20} />
          Add API
        </a>
      </nav>

      <div className="sidebar-bottom">
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Navbar;