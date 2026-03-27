import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import process from "process";

import App from "./App";

import { Buffer } from "buffer";

window.Buffer = Buffer;

/* 🔥 REQUIRED GLOBALS */
(globalThis as any).Buffer = Buffer;
(globalThis as any).process = process;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);