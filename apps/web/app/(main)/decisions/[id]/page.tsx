"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { RichText } from "@/components/RichText";
import { useToast } from "@/components/Toast";

export default function DecisionWorkbenchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [decisionText, setDecisionText] = useState("");
  const [context, setContext] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [actualOutcome, setActualOutcome] = useState("");
  const [lesson, setLesson] = useState("");
  const [confidence, setConfidence] = useState<number>(7);
  const [date, setDate] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiFetch(`/decisions/${id}`);
        const dec = res.decision;
        if (dec) {
          setTitle(dec.title || "");
          setDecisionText(dec.decision || "");
          setContext(dec.context || "");
          setReasoning(dec.reasoning || "");
          setExpectedOutcome(dec.expectedOutcome || "");
          setActualOutcome(dec.actualOutcome || "");
          setLesson(dec.lesson || "");
          setConfidence(dec.confidence || 7);
          setDate(dec.date ? dec.date.split("T")[0] : "");
        }
      } catch (err: any) {
        toast(err.message || "Failed to load decision log", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast("Decision title is required", "error");
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/decisions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          decision: decisionText,
          context: context || null,
          reasoning: reasoning || null,
          expectedOutcome: expectedOutcome || null,
          actualOutcome: actualOutcome || null,
          lesson: lesson || null,
          confidence: Number(confidence),
          date: date || null,
        }),
      });
      toast("Decision log saved", "success");
    } catch (err: any) {
      toast(err.message || "Failed to save decision", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this decision log?")) return;
    try {
      setSaving(true);
      await apiFetch(`/decisions/${id}`, { method: "DELETE" });
      toast("Decision log deleted", "success");
      router.replace("/decisions");
    } catch (err: any) {
      toast(err.message || "Failed to delete decision", "error");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <p className="text-xs text-[#8B8894] animate-pulse">Loading workbench...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link href="/decisions" className="text-[11px] text-[#8B8894] hover:text-[#EDEAE3] transition-colors">
            ← Decisions
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Decision title"
            className="block w-full mt-1 text-xl font-display font-medium text-[#EDEAE3] bg-transparent border-none outline-none placeholder:text-[#5C5A66] focus:outline-none"
          />
          <div className="flex items-center gap-4 mt-2 text-[11px] text-[#8B8894]">
            <span>Date: {date || "—"}</span>
            <span>Confidence: {confidence}/10</span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2A2934]/40" />

      {/* Core Fields */}
      <div className="space-y-1">
        <FieldCard label="Decision Made" value={decisionText} onChange={setDecisionText} placeholder="Describe the decision in detail..." required />
        <FieldCard label="Context & Constraints" value={context} onChange={setContext} placeholder="Why this decision was necessary..." />
        <FieldCard label="Reasoning / Tradeoffs" value={reasoning} onChange={setReasoning} placeholder="Rationale & options considered..." />
        <FieldCard label="Expected Outcome" value={expectedOutcome} onChange={setExpectedOutcome} placeholder="What success looks like..." />
      </div>

      {/* Controls */}
      <div className="bg-[#1D1C22] border border-[#2A2934]/40 rounded-[8px] p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-[#8B8894] mb-1">Decision Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-1.5 text-xs text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#8B8894] mb-1">Confidence Score (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-1.5 text-xs text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
            />
          </div>
        </div>
      </div>

      {/* Outcome Diagnostics */}
      <section className="space-y-1">
        <h2 className="text-xs font-medium text-[#8B8894] uppercase tracking-wide">Outcome Diagnostics</h2>
        <FieldCard label="Actual Outcome" value={actualOutcome} onChange={setActualOutcome} placeholder="What actually happened after the decision..." />
        <FieldCard label="Extracted Lesson" value={lesson} onChange={setLesson} placeholder="What did you learn about your decision framework?" />
      </section>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#2A2934]/40">
        <button
          type="button"
          onClick={handleDelete}
          className="text-[11px] text-[#B0715A] hover:text-red-400 font-medium transition-colors"
        >
          Delete decision log
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium px-5 py-2 rounded-[6px] text-xs transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

/* ─── Field Card Component ─────────────────────────────── */

function FieldCard({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleOpen = () => {
    setTempValue(value);
    setEditing(true);
  };

  const handleSave = () => {
    onChange(tempValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setEditing(false);
  };

  return (
    <>
      <div
        onClick={handleOpen}
        className="group cursor-pointer bg-[#1D1C22]/50 hover:bg-[#1D1C22] border border-transparent hover:border-[#2A2934]/60 rounded-[8px] px-4 py-3 transition-all"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-[#8B8894]">
            {label} {required && <span className="text-[#C9A26D]">*</span>}
          </span>
          <span className="text-[10px] text-[#5C5A66] opacity-0 group-hover:opacity-100 transition-opacity">
            Click to edit
          </span>
        </div>
        {value ? (
          <RichText text={value} />
        ) : (
          <p className="text-xs text-[#5C5A66] italic">{placeholder || "Click to add..."}</p>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-[#16151A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#1D1C22] border border-[#2A2934] w-full max-w-3xl rounded-[12px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2934]/60 bg-[#16151A]/50">
              <div>
                <h2 className="text-sm font-display font-medium text-[#EDEAE3]">{label}</h2>
                <p className="text-[11px] text-[#8B8894] mt-0.5">
                  Line breaks, paragraphs, and bullet points (- or *) are preserved.
                </p>
              </div>
            </div>
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
                <span>Use - or * for bullets</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2A2934]/60 bg-[#16151A]/50">
              <button onClick={handleCancel} className="px-4 py-2 text-xs font-medium text-[#8B8894] hover:text-[#EDEAE3]">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium text-xs px-4 py-2 rounded-[6px]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
