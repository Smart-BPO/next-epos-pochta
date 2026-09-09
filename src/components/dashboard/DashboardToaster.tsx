"use client";

import { ToastContainer } from "react-toastify";

export function DashboardToaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={2800}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="light"
      style={{ zIndex: 10000 }}
    />
  );
}
