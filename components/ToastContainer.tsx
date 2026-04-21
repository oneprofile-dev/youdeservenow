"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Global toast state (simple singleton pattern)
let toastId = 0;
let listeners: Set<(toast: Toast | null) => void> = new Set();

export function showToast(message: string, type: ToastType = "info", duration = 3000) {
  const id = `toast-${++toastId}`;
  const toast: Toast = { id, message, type, duration };

  listeners.forEach((listener) => listener(toast));

  if (duration > 0) {
    setTimeout(() => {
      listeners.forEach((listener) => listener(null));
    }, duration);
  }

  return id;
}

/**
 * Toast notification display
 */
export function ToastContainer() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    listeners.add(setToast);
    return () => {
      listeners.delete(setToast);
    };
  }, []);

  if (!toast) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  }[toast.type];

  const icon = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  }[toast.type];

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-pop">
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm`}
      >
        <span className="text-lg font-bold">{icon}</span>
        <span className="text-sm">{toast.message}</span>
      </div>
    </div>
  );
}
