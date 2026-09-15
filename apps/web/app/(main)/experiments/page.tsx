"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
          problem,
          hypothesis,
          intervention,
          measurement,
          startDate,
          status,
        }),
      });
      setShowModal(false);
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
          <div className="bg-[#1D1C22] border border-[#2A2934] w-full max-w-lg rounded-[10px] p-6 space-y-4">
            <h2 className="text-base font-display font-medium text-[#EDEAE3]">Plan new capability experiment</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#8B8894] mb-1">Problem to solve</label>
                <input
                  type="text"
                  required
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="e.g. Context switching during deep engineering blocks"
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#8B8894] mb-1">Hypothesis</label>
                <textarea
                  rows={2}
                  required
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder="If I apply X, then Y will improve because..."
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#8B8894] mb-1">Intervention</label>
                <textarea
                  rows={2}
                  required
                  value={intervention}
                  onChange={(e) => setIntervention(e.target.value)}
                  placeholder="Specific action protocol to test..."
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#8B8894] mb-1">Measurement method</label>
                <input
                  type="text"
                  required
                  value={measurement}
                  onChange={(e) => setMeasurement(e.target.value)}
                  placeholder="How success will be objectively verified..."
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div className="pt-3 flex justify-end gap-3">
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
            return (
              <div
                key={exp.id}
                className="bg-[#1D1C22] border-l-2 border-[#C9A26D] rounded-r-[10px] p-5 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#2A2934]/40 pb-2">
                  <h3 className="font-medium text-sm text-[#EDEAE3]">{exp.problem}</h3>
                  <span className={`text-xs ${statusInfo.textClass}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-[#EDEAE3]"><span className="text-[#8B8894]">Hypothesis:</span> {exp.hypothesis}</p>
                  <p className="text-[#EDEAE3]"><span className="text-[#8B8894]">Intervention:</span> {exp.intervention}</p>
                  <p className="text-[#EDEAE3]"><span className="text-[#8B8894]">Measurement:</span> {exp.measurement}</p>
                  {exp.result && <p className="text-[#C9A26D]"><span className="text-[#8B8894]">Result:</span> {exp.result}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
