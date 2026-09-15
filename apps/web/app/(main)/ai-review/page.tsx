"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";

export default function PrepareAIReviewPage() {
  const [periodStart, setPeriodStart] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split("T")[0]);

  const [include, setInclude] = useState({
    outcomes: true,
    entries: true,
    reviews: true,
    experiments: true,
    decisions: true,
    learningRecords: true,
    capabilityHistory: true,
  });

  const [packageResult, setPackageResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCopied(false);

    try {
      const res = await apiFetch("/ai/review-package", {
        method: "POST",
        body: JSON.stringify({
          periodStart,
          periodEnd,
          include,
        }),
      });
      setPackageResult(res);
    } catch (err: any) {
      alert(err.message || "Failed to generate review package");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!packageResult?.markdown) return;
    navigator.clipboard.writeText(packageResult.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="border-b border-[#2A2934]/40 pb-4">
        <h1 className="text-2xl font-display font-medium text-[#EDEAE3]">
          Prepare AI review package
        </h1>
        <p className="text-xs text-[#8B8894] mt-1">
          Assemble a structured, zero-outbound Markdown prompt package for LLM evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-3">
            <span className="text-xs font-medium text-[#EDEAE3] block">
              1. Assessment period
            </span>
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-[#8B8894] mb-1">Start date</label>
                <input
                  type="date"
                  required
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3 py-1.5 text-xs text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8894] mb-1">End date</label>
                <input
                  type="date"
                  required
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-3 py-1.5 text-xs text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#2A2934]/40">
            <span className="text-xs font-medium text-[#EDEAE3] block">
              2. Included modules
            </span>
            <div className="space-y-1.5 text-xs">
              {Object.entries(include).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 text-[#8B8894] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => setInclude({ ...include, [key]: e.target.checked })}
                    className="rounded border-[#2A2934] bg-[#16151A] text-[#C9A26D] focus:ring-0"
                  />
                  <span>{key.replace(/([A-Z])/g, " $1")}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#2A2934]/40">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium text-xs py-2 px-4 rounded-[6px] transition-colors disabled:opacity-50"
            >
              {loading ? "Building package..." : "Generate AI package"}
            </button>
          </div>

          <p className="text-[11px] text-[#5C5A66]">
            No data is sent over the network. Copy this output and run it manually in your LLM interface of choice.
          </p>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-baseline justify-between border-b border-[#2A2934]/40 pb-2">
            <div>
              <h2 className="text-sm font-medium text-[#EDEAE3]">
                Generated Markdown package
              </h2>
              {packageResult && (
                <p className="text-[11px] text-[#8B8894] mt-0.5">
                  Contains {packageResult.data.entriesCount} entries, {packageResult.data.experimentsCount} experiments, {packageResult.data.decisionsCount} decisions.
                </p>
              )}
            </div>

            {packageResult && (
              <button
                onClick={handleCopy}
                className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium text-xs px-3 py-1 rounded-[6px] transition-colors"
              >
                {copied ? "Copied to clipboard!" : "Copy package"}
              </button>
            )}
          </div>

          {packageResult ? (
            <textarea
              readOnly
              value={packageResult.markdown}
              className="w-full h-[460px] bg-[#1D1C22] border border-[#2A2934] rounded-[6px] p-3 text-xs font-mono text-[#EDEAE3] focus:outline-none resize-none leading-relaxed"
            />
          ) : (
            <div className="h-[460px] flex items-center justify-center border border-dashed border-[#2A2934] rounded-[6px] text-xs text-[#5C5A66] text-center p-6">
              Configure dates and click &quot;Generate AI package&quot; to build prompt bundle.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
