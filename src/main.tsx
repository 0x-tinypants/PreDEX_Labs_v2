import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import process from "process";
import { Buffer } from "buffer";

import App from "./App";

/* ✅ REQUIRED GLOBALS (clean) */
(globalThis as any).Buffer = Buffer;
(globalThis as any).process = process;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);