import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "No",
  isSubmitting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 rounded-[2rem] max-w-sm w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-800 relative overflow-hidden">
        {/* Decorative Top Scrim/Highlight */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-1.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4.5 py-2 border border-slate-200 hover:border-slate-350 active:scale-98 rounded-xl text-slate-655 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white active:scale-98 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
