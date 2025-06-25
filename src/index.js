import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext"; // ✅ Correct path
import './index.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider> {/* ✅ This makes useAuth() work */}
      <App />
    </AuthProvider>
  </BrowserRouter>
);
