"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { TextFieldModal } from "@/components/TextFieldModal";

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/decisions", {
        method: "POST",
        body: JSON.stringify({
          date,
          title: title.trim() || null,
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
      loadDecisions();
    } catch (err: any) {
      alert(err.message || "Error creating decision record");
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
                <label className="block font-medium text-[#8B8894] mb-1">Decision Title (Optional short summary)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
        <div className="py-8 text-center text-xs text-[#8B8894]">
          No decision logs recorded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((dec) => {
            const displayTitle = dec.title || dec.decision;
            return (
              <div key={dec.id} className="border-b border-[#2A2934]/40 pb-4 space-y-2 bg-[#1D1C22]/30 p-4 rounded-[8px]">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-medium text-sm text-[#EDEAE3]">{displayTitle}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#8B8894] shrink-0">
                    <span>{dec.date.split("T")[0]}</span>
                    <span className="font-mono text-[#C9A26D]">Confidence: {dec.confidence}/10</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  {dec.title && (
                    <div>
                      <span className="text-[#8B8894]">Decision:</span>
                      <p className="whitespace-pre-wrap font-mono text-[11px] text-[#EDEAE3]/90 mt-0.5">{dec.decision}</p>
                    </div>
                  )}
                  {dec.context && (
                    <div>
                      <span className="text-[#8B8894]">Context:</span>
                      <p className="whitespace-pre-wrap font-mono text-[11px] text-[#EDEAE3]/90 mt-0.5">{dec.context}</p>
                    </div>
                  )}
                  {dec.reasoning && (
                    <div>
                      <span className="text-[#8B8894]">Reasoning:</span>
                      <p className="whitespace-pre-wrap font-mono text-[11px] text-[#EDEAE3]/90 mt-0.5">{dec.reasoning}</p>
                    </div>
                  )}
                  {dec.expectedOutcome && (
                    <div>
                      <span className="text-[#8B8894]">Expected outcome:</span>
                      <p className="whitespace-pre-wrap font-mono text-[11px] text-[#EDEAE3]/90 mt-0.5">{dec.expectedOutcome}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
