"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { TextFieldModal } from "@/components/TextFieldModal";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [intervention, setIntervention] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    loadExperiments();
  }, []);

  async function loadExperiments() {
    try {
      setLoading(true);
      const res = await apiFetch("/experiments");
      setExperiments(res.experiments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/experiments", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim() || null,
          problem,
          hypothesis,
          intervention,
          measurement,
          startDate,
          status,
        }),
      });
      setShowModal(false);
      setTitle("");
      setProblem("");
      setHypothesis("");
      setIntervention("");
      setMeasurement("");
      loadExperiments();
    } catch (err: any) {
      alert(err.message || "Error creating experiment");
    }
  };

  const statusColors: Record<string, { label: string; textClass: string }> = {
    PLANNED: { label: "● Planned", textClass: "text-[#8B8894]" },
    ACTIVE: { label: "● Active", textClass: "text-[#7A9B7E]" },
    COMPLETED: { label: "● Completed", textClass: "text-[#C9A26D]" },
    ABANDONED: { label: "● Abandoned", textClass: "text-[#B0715A]" },
  };

  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#2A2934]/40 pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-[#EDEAE3]">
            Experiments
          </h1>
          <p className="text-xs text-[#8B8894] mt-1">
            Structured intervention hypotheses, protocols, and observed outcomes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium text-xs px-3.5 py-1.5 rounded-[6px] transition-colors self-start sm:self-auto"
        >
          + New experiment
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#16151A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1D1C22] border border-[#2A2934] w-full max-w-xl rounded-[10px] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-display font-medium text-[#EDEAE3]">Plan new capability experiment</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#8B8894] mb-1">Experiment Title (Optional short summary)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep Work Focus Protocol"
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <TextFieldModal
                label="Problem to solve"
                value={problem}
                onChange={setProblem}
                placeholder="Describe the context switching or bottleneck problem in detail..."
                required
              />

              <TextFieldModal
                label="Hypothesis"
                value={hypothesis}
                onChange={setHypothesis}
                placeholder="If I apply protocol X, outcome Y will improve because..."
                required
              />

              <TextFieldModal
                label="Intervention"
                value={intervention}
                onChange={setIntervention}
                placeholder="Specific action protocol to test (e.g. 90-min uninterrupted blocks with phone in another room)..."
                required
              />

              <TextFieldModal
                label="Measurement method"
                value={measurement}
                onChange={setMeasurement}
                placeholder="How success will be objectively verified..."
                required
              />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-medium text-[#8B8894] mb-1">Start date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#8B8894] mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ABANDONED">ABANDONED</option>
                  </select>
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
                  Save experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-[#5C5A66]">Loading experiments...</div>
      ) : experiments.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8B8894] space-y-2">
          <p>No capability experiments created yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-[#C9A26D] hover:underline inline-block pt-1"
          >
            + Create your first experiment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiments.map((exp) => {
            const statusInfo = statusColors[exp.status] || statusColors.PLANNED;
            const displayTitle = exp.title || exp.problem;
            return (
              <Link
                key={exp.id}
                href={`/experiments/${exp.id}`}
                className="block bg-[#1D1C22] border-l-2 border-[#C9A26D] rounded-r-[10px] p-5 space-y-3 hover:bg-[#2A2934]/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between border-b border-[#2A2934]/40 pb-2">
                  <h3 className="font-medium text-sm text-[#EDEAE3] group-hover:text-[#C9A26D] transition-colors line-clamp-1">{displayTitle}</h3>
                  <span className={`text-xs ${statusInfo.textClass} shrink-0`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {exp.title && (
                    <div className="text-[#EDEAE3]">
                      <span className="text-[#8B8894]">Problem:</span>
                      <p className="whitespace-pre-wrap mt-0.5 font-mono text-[11px] text-[#EDEAE3]/90">{exp.problem}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[#8B8894]">Hypothesis:</span>
                    <p className="whitespace-pre-wrap mt-0.5 font-mono text-[11px] text-[#EDEAE3]/90">{exp.hypothesis}</p>
                  </div>
                  <div>
                    <span className="text-[#8B8894]">Intervention:</span>
                    <p className="whitespace-pre-wrap mt-0.5 font-mono text-[11px] text-[#EDEAE3]/90">{exp.intervention}</p>
                  </div>
                  {exp.result && (
                    <div>
                      <span className="text-[#C9A26D]">Result:</span>
                      <p className="whitespace-pre-wrap mt-0.5 font-mono text-[11px] text-[#C9A26D]/90">{exp.result}</p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
