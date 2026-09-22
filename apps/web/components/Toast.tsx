"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(t.id), 4000);
    return () => clearTimeout(timer);
  }, [t.id, onDismiss]);

  const icon = {
    success: <CheckCircle className="w-4 h-4 text-[#7A9B7E] shrink-0" />,
    error: <AlertTriangle className="w-4 h-4 text-[#B0715A] shrink-0" />,
    info: <Info className="w-4 h-4 text-[#C9A26D] shrink-0" />,
  }[t.type];

  const borderColor = {
    success: "border-[#7A9B7E]",
    error: "border-[#B0715A]",
    info: "border-[#C9A26D]",
  }[t.type];

  return (
    <div
      className={`flex items-start gap-2.5 bg-[#1D1C22] border-l-2 ${borderColor} border border-[#2A2934] rounded-r-[8px] px-4 py-3 shadow-xl animate-in slide-in-from-right-5 fade-in duration-300 max-w-sm`}
    >
      {icon}
      <p className="text-xs text-[#EDEAE3] leading-relaxed flex-1">{t.message}</p>
      <button
        onClick={() => onDismiss(t.id)}
        className="text-[#5C5A66] hover:text-[#EDEAE3] transition-colors shrink-0 p-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
