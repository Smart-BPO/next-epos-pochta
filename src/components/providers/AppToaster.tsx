"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Single app-wide toast host. Do not mount another ToastContainer
 * (e.g. in dashboard chrome) — dual containers break autoClose/dismiss.
 */
export function AppToaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3200}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      pauseOnFocusLoss={false}
      draggable
      limit={3}
      theme="light"
      style={{ zIndex: 10000 }}
    />
  );
}
