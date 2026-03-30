import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import process from "process";
import { Buffer } from "buffer";

import App from "./App";

/* ✅ SAFE GLOBAL POLYFILLS */
if (!(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}

if (!(globalThis as any).process) {
  (globalThis as any).process = process;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);