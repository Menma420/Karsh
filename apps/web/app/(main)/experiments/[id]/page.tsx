"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

export default function EditExperimentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [problem, setProblem] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [intervention, setIntervention] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [result, setResult] = useState("");
  const [lesson, setLesson] = useState("");
  const [nextAction, setNextAction] = useState("");

  useEffect(() => {
    async function loadExperiment() {
      try {
        setLoading(true);
        const res = await apiFetch(`/experiments/${id}`);
        const exp = res.experiment;
        if (exp) {
          setProblem(exp.problem || "");
          setHypothesis(exp.hypothesis || "");
          setIntervention(exp.intervention || "");
          setMeasurement(exp.measurement || "");
          setStartDate(exp.startDate ? exp.startDate.split("T")[0] : "");
          setEndDate(exp.endDate ? exp.endDate.split("T")[0] : "");
          setStatus(exp.status || "ACTIVE");
          setResult(exp.result || "");
          setLesson(exp.lesson || "");
          setNextAction(exp.nextAction || "");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load experiment");
      } finally {
        setLoading(false);
      }
    }
    loadExperiment();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiFetch(`/experiments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          problem,
          hypothesis,
          intervention,
          measurement,
          startDate: startDate || null,
          endDate: endDate || null,
          status,
          result: result || null,
          lesson: lesson || null,
          nextAction: nextAction || null,
        }),
      });
      router.back();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update experiment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this experiment?")) return;
    try {
      setSaving(true);
      await apiFetch(`/experiments/${id}`, { method: "DELETE" });
      router.replace("/experiments");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete experiment");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex justify-center">
        <p className="text-xs text-[#8B8894] animate-pulse">Loading workbench...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pt-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#2A2934]/40 pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-[#EDEAE3]">
            Experiment Workbench
          </h1>
          <p className="text-xs text-[#8B8894] mt-1">
            Update lifecycle states and record actionable outcomes.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleDelete}
            className="text-[11px] text-[#B0715A] hover:text-red-400 font-medium transition-colors border border-[#B0715A]/30 bg-[#B0715A]/10 px-2.5 py-1 rounded"
          >
            Delete Experiment
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#1D1C22] border-l-2 border-[#B0715A] text-[#EDEAE3] p-3 rounded-r-[6px] text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Parameters Component */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-[#EDEAE3] border-b border-[#2A2934]/40 pb-1">
            Core parameters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#8B8894] mb-1">Problem to solve</label>
              <input
                type="text"
                required
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">Hypothesis</label>
              <textarea
                rows={2}
                required
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">Intervention</label>
              <textarea
                rows={2}
                required
                value={intervention}
                onChange={(e) => setIntervention(e.target.value)}
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#8B8894] mb-1">Measurement method</label>
              <input
                type="text"
                required
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>
          </div>
        </section>

        {/* Lifecycle & Scheduling Component */}
        <section className="bg-[#1D1C22] border-l-2 border-[#C9A26D] rounded-r-[10px] p-5 space-y-4">
          <h2 className="text-sm font-medium text-[#EDEAE3]">
            Lifecycle Phase
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-1.5 text-xs text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">End Date (Optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-1.5 text-xs text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">Active Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-1.5 text-xs text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
              >
                <option value="PLANNED">PLANNED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ABANDONED">ABANDONED</option>
              </select>
            </div>
          </div>
        </section>

        {/* Output Diagnostics Component */}
        <section className="space-y-4 pt-2">
          <div className="border-b border-[#2A2934]/40 pb-1 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#EDEAE3]">
              Diagnostic Outputs
            </h2>
            <span className="text-[10px] text-[#5C5A66] uppercase tracking-wide font-medium">Post-flight capture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">Empirical Result</label>
              <textarea
                rows={3}
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="What objectively happened?"
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C9A26D] mb-1">Extracted Lesson</label>
              <textarea
                rows={3}
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                placeholder="What did you learn about your capabilities?"
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <div className="sm:col-span-2 border-t border-[#2A2934]/30 pt-3">
              <label className="block text-xs font-medium text-[#8B8894] mb-1">Next Action (Continuous Loop)</label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="How does this change future baselines..."
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>
          </div>
        </section>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#2A2934]/40">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-xs font-medium text-[#8B8894] hover:text-[#EDEAE3] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium px-4 py-2 rounded-[6px] text-xs transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
