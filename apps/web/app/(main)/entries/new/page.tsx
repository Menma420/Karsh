"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

function RecordEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [settings, setSettings] = useState<{ backfillDays: number; timezone: string }>({
    backfillDays: 7,
    timezone: "Asia/Kolkata",
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const initialDate = searchParams.get("date") || todayStr;

  const [occurredOn, setOccurredOn] = useState(initialDate);
  const [occurredAt, setOccurredAt] = useState("");
  const [title, setTitle] = useState("");
  const [intent, setIntent] = useState("");
  const [outcome, setOutcome] = useState("");
  const [wentWell, setWentWell] = useState("");
  const [struggle, setStruggle] = useState("");
  const [whyItHappened, setWhyItHappened] = useState("");
  const [learned, setLearned] = useState("");
  const [willChange, setWillChange] = useState("");
  const [notes, setNotes] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [availableExperiments, setAvailableExperiments] = useState<any[]>([]);
  const [selectedExperimentIds, setSelectedExperimentIds] = useState<string[]>([]);

  useEffect(() => {
    apiFetch("/settings")
      .then((res) => {
        if (res.settings) setSettings(res.settings);
      })
      .catch(() => {});

    apiFetch("/experiments").then((res) => {
      if (res.experiments) {
         // Prioritize active/planned.
         const sorted = [...res.experiments].sort((a: any, b: any) => {
           if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
           if (b.status === "ACTIVE" && a.status !== "ACTIVE") return 1;
           return 0;
         });
         setAvailableExperiments(sorted);
      }
    }).catch(() => {});
  }, []);

  const calculateEarliestAllowed = () => {
    const d = new Date();
    d.setDate(d.getDate() - settings.backfillDays);
    return d.toISOString().split("T")[0];
  };

  const earliestAllowed = calculateEarliestAllowed();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await apiFetch("/reflection-entries", {
        method: "POST",
        body: JSON.stringify({
          occurredOn,
          occurredAt: occurredAt ? new Date(occurredAt).toISOString() : null,
          title: title || null,
          intent: intent || null,
          outcome: outcome || null,
          wentWell: wentWell || null,
          struggle: struggle || null,
          whyItHappened: whyItHappened || null,
          learned: learned || null,
          willChange: willChange || null,
          notes: notes || null,
          tags,
        }),
      });

      const entryId = res.entry?.id;
      if (entryId && selectedExperimentIds.length > 0) {
        await Promise.all(
          selectedExperimentIds.map((expId) =>
            apiFetch(`/experiments/${expId}/link-entry`, {
              method: "POST",
              body: JSON.stringify({ entryId }),
            }).catch((err) => {
               console.error(`Failed linking to experiment ${expId}:`, err);
            })
          )
        );
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to record entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pt-4 pb-12">
      <div className="border-b border-[#2A2934]/40 pb-4">
        <h1 className="text-2xl font-display font-medium text-[#EDEAE3]">
          Record reflection evidence
        </h1>
        <p className="text-xs text-[#8B8894] mt-1">
          Capture observations, root causes, and insights.
        </p>
      </div>

      {error && (
        <div className="bg-[#1D1C22] border-l-2 border-[#B0715A] text-[#EDEAE3] p-3 rounded-r-[6px] text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection Box */}
        <div className="bg-[#1D1C22] border-l-2 border-[#C9A26D] rounded-r-[10px] p-4 space-y-3">
          <span className="text-xs font-medium text-[#EDEAE3] block">
            Record for this date
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-[#8B8894] block mb-1">Occurrence date</label>
              <input
                type="date"
                required
                value={occurredOn}
                min={earliestAllowed}
                max={todayStr}
                onChange={(e) => setOccurredOn(e.target.value)}
                className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-1.5 text-xs text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#8B8894] block mb-1">Specific time (optional)</label>
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-1.5 text-xs text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>
          </div>
          <p className="text-[10px] text-[#5C5A66]">
            Active recording window: {earliestAllowed} to {todayStr} ({settings.backfillDays} days backfill)
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8B8894] mb-1">
            Title / Context (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Debugging database connection leak"
            className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8B8894] mb-1">
            Link to Experiment (Optional)
          </label>
          <select
            value=""
            onChange={(e) => {
              const val = e.target.value;
              if (val && !selectedExperimentIds.includes(val)) {
                setSelectedExperimentIds([...selectedExperimentIds, val]);
              }
            }}
            className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
          >
            <option value="">No experiment ▼</option>
            {availableExperiments.map((exp) => (
              <option key={exp.id} value={exp.id}>
                [{exp.status}] {exp.problem}
              </option>
            ))}
          </select>
          {selectedExperimentIds.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {selectedExperimentIds.map((id) => {
                const exp = availableExperiments.find((e) => e.id === id);
                if (!exp) return null;
                return (
                  <div key={id} className="flex items-center gap-2 bg-[#2A2934]/50 border border-[#2A2934] pl-2 pr-1 py-1 rounded-[4px] text-[11px] text-[#EDEAE3]">
                    <span>{exp.problem}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedExperimentIds((prev) => prev.filter((x) => x !== id))}
                      className="text-[#8B8894] hover:text-[#B0715A] transition-colors px-1"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">
                What did I try to accomplish? (Intent)
              </label>
              <textarea
                rows={2}
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="Intended goal..."
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">
                What actually happened? (Outcome)
              </label>
              <textarea
                rows={2}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Actual result..."
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">
                What went well?
              </label>
              <textarea
                rows={2}
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                placeholder="Effective actions..."
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">
                Where did I struggle or make a mistake?
              </label>
              <textarea
                rows={2}
                value={struggle}
                onChange={(e) => setStruggle(e.target.value)}
                placeholder="Friction points..."
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8B8894] mb-1">
              Why do I think that happened?
            </label>
            <textarea
              rows={2}
              value={whyItHappened}
              onChange={(e) => setWhyItHappened(e.target.value)}
              placeholder="Root cause hypothesis..."
              className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">
                What did I learn?
              </label>
              <textarea
                rows={2}
                value={learned}
                onChange={(e) => setLearned(e.target.value)}
                placeholder="Key takeaway..."
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B8894] mb-1">
                What will I change?
              </label>
              <textarea
                rows={2}
                value={willChange}
                onChange={(e) => setWillChange(e.target.value)}
                placeholder="Concrete adjustment..."
                className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8B8894] mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. backend, database, metacognition"
              className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
            />
          </div>
        </div>

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
            disabled={loading}
            className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium px-4 py-2 rounded-[6px] text-xs transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save entry"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RecordEntryPage() {
  return (
    <React.Suspense fallback={<div className="text-xs text-[#8B8894] p-8 text-center">Loading editor...</div>}>
      <RecordEntryForm />
    </React.Suspense>
  );
}
