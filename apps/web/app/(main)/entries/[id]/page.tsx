"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

export default function EditEntryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [occurredOn, setOccurredOn] = useState("");
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

  useEffect(() => {
    async function loadEntry() {
      try {
        setLoading(true);
        const res = await apiFetch(`/reflection-entries/${id}`);
        const entry = res.entry;
        
        if (entry) {
          setOccurredOn(entry.occurredOn.split("T")[0]);
          if (entry.occurredAt) {
            setOccurredAt(new Date(entry.occurredAt).toISOString().slice(0, 16));
          }
          setTitle(entry.title || "");
          setIntent(entry.intent || "");
          setOutcome(entry.outcome || "");
          setWentWell(entry.wentWell || "");
          setStruggle(entry.struggle || "");
          setWhyItHappened(entry.whyItHappened || "");
          setLearned(entry.learned || "");
          setWillChange(entry.willChange || "");
          setNotes(entry.notes || "");

          if (entry.tags && entry.tags.length > 0) {
            setTagsInput(entry.tags.map((t: any) => t.tag.name).join(", "));
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load entry");
      } finally {
        setLoading(false);
      }
    }
    loadEntry();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await apiFetch(`/reflection-entries/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
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

      router.back();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this evidence record?")) return;
    
    try {
      setSaving(true);
      await apiFetch(`/reflection-entries/${id}`, { method: "DELETE" });
      router.replace("/timeline");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete entry");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-12 flex justify-center">
        <p className="text-xs text-[#8B8894] animate-pulse">Loading entry data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 pt-4 pb-12">
      <div className="flex items-baseline justify-between border-b border-[#2A2934]/40 pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-[#EDEAE3]">
            Edit entry
          </h1>
          <p className="text-xs text-[#8B8894] mt-1">
            Update reflection evidence.
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="text-[11px] text-[#B0715A] hover:text-red-400 font-medium transition-colors border border-[#B0715A]/30 bg-[#B0715A]/10 px-2.5 py-1 rounded"
        >
          Delete Entry
        </button>
      </div>

      {error && (
        <div className="bg-[#1D1C22] border-l-2 border-[#B0715A] text-[#EDEAE3] p-3 rounded-r-[6px] text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection Box (Note: Backend PATCH doesn't mutate occurredOn yet natively safely so we disable it for now or just allow it if patched)
            For safety, we show occurredOn safely read-only here as it dictates timeline anchors */}
        <div className="bg-[#1D1C22] border-l-2 border-[#2A2934] rounded-r-[10px] p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-[#8B8894] block mb-1">Occurrence date</label>
              <input
                type="date"
                disabled
                value={occurredOn}
                className="w-full bg-[#16151A]/50 border border-[#2A2934]/50 rounded-[6px] px-3 py-1.5 text-xs text-[#5C5A66] cursor-not-allowed"
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
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8B8894] mb-1">
            Title / Context (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3.5 py-2 text-xs text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
          />
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
