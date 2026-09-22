"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { TextFieldModal } from "@/components/TextFieldModal";

export default function EditExperimentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
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
  const [linkedEntries, setLinkedEntries] = useState<any[]>([]);

  useEffect(() => {
    async function loadExperiment() {
      try {
        setLoading(true);
        const res = await apiFetch(`/experiments/${id}`);
        const exp = res.experiment;
        if (exp) {
          setTitle(exp.title || "");
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
          setLinkedEntries(exp.linkedEntries || []);
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
          title: title.trim() || null,
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

  const handleUnlink = async (entryId: string) => {
    try {
      setSaving(true);
      await apiFetch(`/experiments/${id}/entries/${entryId}`, { method: "DELETE" });
      setLinkedEntries((prev) => prev.filter((link) => link.entryId !== entryId));
    } catch (err: any) {
      alert(err.message || "Failed to unlink entry");
    } finally {
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
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">Experiment Title (Optional short summary)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep Work Focus Protocol"
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <TextFieldModal
              label="Problem to solve"
              value={problem}
              onChange={setProblem}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextFieldModal
                label="Hypothesis"
                value={hypothesis}
                onChange={setHypothesis}
                required
              />

              <TextFieldModal
                label="Intervention"
                value={intervention}
                onChange={setIntervention}
                required
              />
            </div>

            <TextFieldModal
              label="Measurement method"
              value={measurement}
              onChange={setMeasurement}
              required
            />
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

        {/* Evidence Component */}
        <section className="space-y-4">
          <div className="border-b border-[#2A2934]/40 pb-1 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#EDEAE3]">
              Evidence
            </h2>
          </div>

          {!linkedEntries || linkedEntries.length === 0 ? (
            <div className="text-xs text-[#8B8894] py-2">No evidence linked yet.</div>
          ) : (
            <div className="space-y-4">
              {linkedEntries.map((link) => {
                const entry = link.entry;
                const dStr = entry.occurredOn.split("T")[0];
                return (
                  <div key={entry.id} className="bg-[#1D1C22] border-l-2 border-[#5C5A66] rounded-r-[10px] p-4 space-y-2 relative group">
                    <button
                      type="button"
                      onClick={() => handleUnlink(entry.id)}
                      className="absolute top-4 right-4 text-[10px] text-[#8B8894] hover:text-[#B0715A] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Unlink
                    </button>
                    <Link
                      href={`/entries/${entry.id}`}
                      className="block hover:bg-[#2A2934]/30 -m-2 p-2 rounded-[6px] transition-colors"
                    >
                      <div className="text-xs font-medium text-[#EDEAE3] mb-1">
                        {dStr} {entry.title ? <span className="font-normal text-[#8B8894]">| {entry.title}</span> : ""}
                      </div>
                      <div className="space-y-1 text-xs">
                        {entry.intent && <p className="text-[#EDEAE3] whitespace-pre-wrap"><span className="text-[#8B8894]">Intent:</span> {entry.intent}</p>}
                        {entry.outcome && <p className="text-[#EDEAE3] whitespace-pre-wrap"><span className="text-[#8B8894]">Outcome:</span> {entry.outcome}</p>}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Output Diagnostics Component */}
        <section className="space-y-4 pt-2">
          <div className="border-b border-[#2A2934]/40 pb-1 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#EDEAE3]">
              Diagnostic Outputs
            </h2>
            <span className="text-[10px] text-[#5C5A66] uppercase tracking-wide font-medium">Post-flight capture</span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextFieldModal
                label="Empirical Result"
                value={result}
                onChange={setResult}
                placeholder="What objectively happened?"
              />

              <TextFieldModal
                label="Extracted Lesson"
                value={lesson}
                onChange={setLesson}
                placeholder="What did you learn about your capabilities?"
              />
            </div>

            <div className="border-t border-[#2A2934]/30 pt-3">
              <TextFieldModal
                label="Next Action (Continuous Loop)"
                value={nextAction}
                onChange={setNextAction}
                placeholder="How does this change future baselines..."
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
