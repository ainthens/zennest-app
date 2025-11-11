import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { initConsoleManager } from "./utils/consoleManager";
import "./index.css"; // <- ensure this is present

// Initialize console manager to control logging in production
initConsoleManager();

const root = document.getElementById("root");

if (!root) {
  console.error("Root element not found!");
} else {
  try {
    createRoot(root).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to render app:", error);
    root.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1 style="color: red;">Failed to load application</h1>
        <p>${error.message}</p>
        <button onclick="window.location.reload()">Reload Page</button>
      </div>
    `;
  }
}
