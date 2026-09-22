"use client";

import React, { useState, useEffect } from "react";
import { Maximize2, X, Check } from "lucide-react";

interface TextFieldModalProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export function TextFieldModal({
  label,
  value,
  onChange,
  placeholder = "Write detail here... Supports paragraphs, bullet points (- or *), and notes.",
  required = false,
  rows = 2,
}: TextFieldModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleOpen = () => {
    setTempValue(value);
    setIsOpen(true);
  };

  const handleSave = () => {
    onChange(tempValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-[#8B8894]">
          {label} {required && <span className="text-[#C9A26D]">*</span>}
        </label>
        <button
          type="button"
          onClick={handleOpen}
          className="text-[11px] text-[#C9A26D] hover:text-[#b8925d] flex items-center gap-1 transition-colors px-1 py-0.5 rounded hover:bg-[#C9A26D]/10"
          title="Expand to full editor"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Expand editor</span>
        </button>
      </div>

      {/* Trigger Field / Preview Box */}
      <div
        onClick={handleOpen}
        className="group relative cursor-pointer bg-[#16151A] border border-[#2A2934] hover:border-[#C9A26D]/60 rounded-[6px] p-2.5 transition-colors min-h-[60px]"
      >
        {value ? (
          <p className="text-xs text-[#EDEAE3] whitespace-pre-wrap line-clamp-3 leading-relaxed font-mono">
            {value}
          </p>
        ) : (
          <p className="text-xs text-[#5C5A66] italic">
            {placeholder} (Click or hit Expand editor to write long text)
          </p>
        )}
        <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-[#C9A26D] bg-[#1D1C22] px-1.5 py-0.5 rounded border border-[#2A2934]">
            Click to edit
          </span>
        </div>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#16151A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#1D1C22] border border-[#2A2934] w-full max-w-3xl rounded-[12px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2934]/60 bg-[#16151A]/50">
              <div>
                <h2 className="text-sm font-display font-medium text-[#EDEAE3] flex items-center gap-2">
                  <span>{label}</span>
                  {required && <span className="text-xs text-[#C9A26D] font-normal">(Required)</span>}
                </h2>
                <p className="text-[11px] text-[#8B8894] mt-0.5">
                  Full text editor — line breaks, paragraphs, and bullet points (- or *) are supported and preserved.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="text-[#8B8894] hover:text-[#EDEAE3] p-1.5 rounded-[6px] hover:bg-[#2A2934]/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 flex flex-col min-h-0 space-y-3">
              <textarea
                autoFocus
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder={placeholder}
                className="w-full flex-1 bg-[#16151A] border border-[#2A2934] rounded-[8px] p-4 text-xs font-mono text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D] leading-relaxed resize-none min-h-[280px]"
              />
              <div className="flex items-center justify-between text-[11px] text-[#5C5A66]">
                <span>{tempValue.length} characters · {tempValue.split("\n").length} lines</span>
                <span>Use Enter for paragraphs · Hyphens (-) or asterisks (*) for list items</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2A2934]/60 bg-[#16151A]/50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-medium text-[#8B8894] hover:text-[#EDEAE3] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium text-xs px-4 py-2 rounded-[6px] transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
