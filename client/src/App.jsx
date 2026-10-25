
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "./ThemeContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Collections from "./pages/Collections";
import Apis from "./pages/Apis";
import Workspace from "./pages/Workspace";
import Environments from "./pages/Environments";
import MockServers from "./pages/MockServers";
import Vault from "./pages/Vault";
import ApiTroubleshooter from "./pages/ApiTroubleshooter";
import AuditLogs from "./pages/AuditLogs";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/apis" element={<Apis />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/environments" element={<Environments />} />
          <Route path="/mock-servers" element={<MockServers />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/troubleshooter" element={<ApiTroubleshooter />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
