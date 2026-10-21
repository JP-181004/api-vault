
import { NavLink, useNavigate } from "react-router-dom";
import {
  Boxes,
  Code2,
  KeyRound,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShieldCheck,
  FlaskConical,
  Settings2,
  Server,
  Bug,
} from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="sidebar-logo">
        <ShieldCheck size={34} />
        <span>API Vault</span>
      </NavLink>

      <nav className="sidebar-navigation">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink to="/collections" className={linkClass}>
          <Boxes size={20} />
          Collections
        </NavLink>

        <NavLink to="/apis" className={linkClass}>
          <Code2 size={20} />
          APIs
        </NavLink>

        <NavLink to="/workspace" className={linkClass}>
          <FlaskConical size={20} />
          API Testing
        </NavLink>

        <NavLink to="/troubleshooter" className={linkClass}>
          <Bug size={20} />
          API Troubleshooter
        </NavLink>

        <NavLink to="/environments" className={linkClass}>
          <Settings2 size={20} />
          Environments
        </NavLink>

        <NavLink to="/mock-servers" className={linkClass}>
          <Server size={20} />
          Mock Servers
        </NavLink>

        <NavLink to="/vault" className={linkClass}>
          <KeyRound size={20} />
          Secrets Vault
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
