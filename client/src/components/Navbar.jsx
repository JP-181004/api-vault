import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#a78bfa" : "white",
    textDecoration: "none",
    fontWeight: isActive ? "700" : "500",
  });

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 40px",
        backgroundColor: "#202637",
        marginBottom: "30px",
      }}
    >
      <NavLink
        to="/dashboard"
        style={{
          textDecoration: "none",
          color: "white",
        }}
      >
        <h2 style={{ margin: 0 }}>API Vault</h2>
      </NavLink>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "28px",
        }}
      >
        <NavLink to="/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>

        <NavLink to="/collections" style={linkStyle}>
          Collections
        </NavLink>

        <NavLink to="/apis" style={linkStyle}>
          APIs
        </NavLink>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "#7c3aed",
            color: "white",
            fontWeight: "600",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;