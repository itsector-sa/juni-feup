import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import { AppProviders } from "./app/providers";
import "./index.css";

async function enableMsw() {
  // if (import.meta.env.DEV) {
  const { worker } = await import("./lib/msw/browser");
  await worker.start({
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
    onUnhandledRequest: "warn",
  });
  // }
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

enableMsw().then(() => {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </React.StrictMode>
  );
});
