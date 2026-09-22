"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { TextFieldModal } from "@/components/TextFieldModal";
import { useToast } from "@/components/Toast";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
    } catch (err: any) {
      toast(err.message || "Failed to load experiments", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast("Experiment title is required", "error");
      return;
    }
    try {
      await apiFetch("/experiments", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
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
      toast("Experiment created successfully", "success");
      loadExperiments();
    } catch (err: any) {
      toast(err.message || "Error creating experiment", "error");
    }
  };

  const statusColors: Record<string, { dot: string; text: string }> = {
    PLANNED: { dot: "bg-[#8B8894]", text: "text-[#8B8894]" },
    ACTIVE: { dot: "bg-[#7A9B7E]", text: "text-[#7A9B7E]" },
    COMPLETED: { dot: "bg-[#C9A26D]", text: "text-[#C9A26D]" },
    ABANDONED: { dot: "bg-[#B0715A]", text: "text-[#B0715A]" },
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
                <label className="block font-medium text-[#8B8894] mb-1">
                  Experiment Title <span className="text-[#C9A26D]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
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
                placeholder="Specific action protocol to test..."
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
        <div className="space-y-1.5">
          {experiments.map((exp) => {
            const s = statusColors[exp.status] || statusColors.PLANNED;
            return (
              <Link
                key={exp.id}
                href={`/experiments/${exp.id}`}
                className="flex items-center justify-between bg-[#1D1C22] hover:bg-[#2A2934]/60 border-l-2 border-[#C9A26D]/60 hover:border-[#C9A26D] rounded-r-[8px] px-4 py-3 transition-colors group"
              >
                <h3 className="text-sm font-medium text-[#EDEAE3] group-hover:text-[#C9A26D] transition-colors line-clamp-1">
                  {exp.title || exp.problem}
                </h3>
                <span className={`text-[11px] ${s.text} flex items-center gap-1.5 shrink-0 ml-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {exp.status}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
