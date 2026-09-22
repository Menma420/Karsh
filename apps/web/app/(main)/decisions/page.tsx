"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { TextFieldModal } from "@/components/TextFieldModal";
import { useToast } from "@/components/Toast";

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [decisionText, setDecisionText] = useState("");
  const [context, setContext] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [confidence, setConfidence] = useState(7);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadDecisions();
  }, []);

  async function loadDecisions() {
    try {
      setLoading(true);
      const res = await apiFetch("/decisions");
      setDecisions(res.decisions || []);
    } catch (err: any) {
      toast(err.message || "Failed to load decisions", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast("Decision title is required", "error");
      return;
    }
    try {
      await apiFetch("/decisions", {
        method: "POST",
        body: JSON.stringify({
          date,
          title: title.trim(),
          decision: decisionText,
          context: context || null,
          reasoning: reasoning || null,
          expectedOutcome: expectedOutcome || null,
          confidence: Number(confidence),
        }),
      });
      setShowModal(false);
      setTitle("");
      setDecisionText("");
      setContext("");
      setReasoning("");
      setExpectedOutcome("");
      toast("Decision logged successfully", "success");
      loadDecisions();
    } catch (err: any) {
      toast(err.message || "Error creating decision record", "error");
    }
  };

  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#2A2934]/40 pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-[#EDEAE3]">
            Decisions
          </h1>
          <p className="text-xs text-[#8B8894] mt-1">
            Capture decisions, assumptions, and confidence before outcome bias sets in.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium text-xs px-3.5 py-1.5 rounded-[6px] transition-colors self-start sm:self-auto"
        >
          + New decision
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#16151A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1D1C22] border border-[#2A2934] w-full max-w-xl rounded-[10px] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-display font-medium text-[#EDEAE3]">Record decision log</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#8B8894] mb-1">
                  Decision Title <span className="text-[#C9A26D]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Postgres DB Migration"
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <TextFieldModal
                label="Decision made"
                value={decisionText}
                onChange={setDecisionText}
                placeholder="Describe the exact decision taken in full detail..."
                required
              />

              <TextFieldModal
                label="Context & constraints"
                value={context}
                onChange={setContext}
                placeholder="Why this decision was necessary, key constraints..."
              />

              <TextFieldModal
                label="Reasoning / tradeoffs"
                value={reasoning}
                onChange={setReasoning}
                placeholder="Rationale, alternatives considered and rejected..."
              />

              <TextFieldModal
                label="Expected outcome"
                value={expectedOutcome}
                onChange={setExpectedOutcome}
                placeholder="What success looks like, expected metrics..."
              />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-medium text-[#8B8894] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#8B8894] mb-1">Confidence (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#2A2934]/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-[#8B8894] hover:text-[#EDEAE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium px-4 py-1.5 rounded-[6px]"
                >
                  Save decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-[#5C5A66]">Loading decision logs...</div>
      ) : decisions.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8B8894] space-y-2">
          <p>No decision logs recorded yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-[#C9A26D] hover:underline inline-block pt-1"
          >
            + Create your first decision log
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {decisions.map((dec) => {
            const dStr = dec.date ? dec.date.split("T")[0] : "";
            return (
              <Link
                key={dec.id}
                href={`/decisions/${dec.id}`}
                className="flex items-center justify-between bg-[#1D1C22] hover:bg-[#2A2934]/60 border-l-2 border-[#C9A26D]/60 hover:border-[#C9A26D] rounded-r-[8px] px-4 py-3 transition-colors group"
              >
                <h3 className="text-sm font-medium text-[#EDEAE3] group-hover:text-[#C9A26D] transition-colors line-clamp-1">
                  {dec.title || dec.decision}
                </h3>
                <div className="flex items-center gap-3 text-[11px] shrink-0 ml-4">
                  <span className="text-[#8B8894] font-mono">{dStr}</span>
                  <span className="text-[#C9A26D] font-mono font-medium">
                    {dec.confidence}/10
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
