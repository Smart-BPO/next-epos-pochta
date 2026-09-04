"use client";

import { ToastContainer } from "react-toastify";

export function AppToaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="light"
      style={{ zIndex: 100 }}
    />
  );
}
