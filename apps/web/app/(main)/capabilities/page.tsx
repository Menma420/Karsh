"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";

export default function CapabilitiesPage() {
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [selectedCap, setSelectedCap] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCapabilities();
  }, []);

  async function loadCapabilities() {
    try {
      setLoading(true);
      const res = await apiFetch("/capabilities");
      setCapabilities(res.capabilities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectCapability = async (cap: any) => {
    setSelectedCap(cap);
    try {
      setLoadingHistory(true);
      const res = await apiFetch(`/capabilities/${cap.id}/history`);
      setHistory(res.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const levelLabels: Record<number, string> = {
    1: "Level 1 — Machine",
    2: "Level 2 — Intelligence",
    3: "Level 3 — Influence",
    4: "Level 4 — Domain",
    5: "Level 5 — Leverage",
  };

  const groupedCapabilities: Record<number, any[]> = {};
  capabilities.forEach((cap) => {
    if (!groupedCapabilities[cap.level]) groupedCapabilities[cap.level] = [];
    groupedCapabilities[cap.level].push(cap);
  });

  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="border-b border-[#2A2934]/40 pb-4">
        <h1 className="text-2xl font-display font-medium text-[#EDEAE3]">
          Capability taxonomy &amp; history
        </h1>
        <p className="text-xs text-[#8B8894] mt-1">
          Structured 5-level capability model. Select any item to view score history and prompt provenance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Capability List */}
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const items = groupedCapabilities[lvl] || [];
            return (
              <div key={lvl} className="space-y-2">
                <h2 className="text-xs font-medium text-[#8B8894] border-b border-[#2A2934]/40 pb-1">
                  {levelLabels[lvl]}
                </h2>
                <div className="space-y-1">
                  {items.map((cap) => {
                    const latest = cap.latestAssessment;
                    const isSelected = selectedCap?.id === cap.id;
                    return (
                      <button
                        key={cap.id}
                        onClick={() => handleSelectCapability(cap)}
                        className={`w-full text-left p-2.5 rounded-[6px] transition-colors flex items-center justify-between text-xs ${
                          isSelected
                            ? "bg-[#1D1C22] border-l-2 border-[#C9A26D]"
                            : "hover:bg-[#1D1C22]/50"
                        }`}
                      >
                        <div>
                          <span className="font-medium text-[#EDEAE3] block">
                            {cap.name}
                          </span>
                          <p className="text-[11px] text-[#8B8894] mt-0.5">
                            {cap.description}
                          </p>
                        </div>

                        <div className="font-mono text-xs text-[#C9A26D] shrink-0 ml-3">
                          {latest ? `${latest.score}/10` : "—"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* History Drawer */}
        <div className="bg-[#1D1C22] border border-[#2A2934]/60 rounded-[10px] p-5 space-y-4 h-fit">
          {selectedCap ? (
            <>
              <div className="flex items-baseline justify-between border-b border-[#2A2934]/40 pb-3">
                <div>
                  <h3 className="text-sm font-medium text-[#EDEAE3]">
                    {selectedCap.name}
                  </h3>
                  <p className="text-[11px] text-[#8B8894]">
                    Assessment history &amp; provenance
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCap(null)}
                  className="text-xs text-[#8B8894] hover:text-[#EDEAE3]"
                >
                  Close
                </button>
              </div>

              {loadingHistory ? (
                <div className="py-6 text-xs text-[#5C5A66] text-center">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="py-6 text-xs text-[#5C5A66] text-center">
                  No historical AI assessments recorded.
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-[#2A2934]/40 pb-3 text-xs space-y-1"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono font-medium text-[#C9A26D]">
                          Score: {item.score}/10
                        </span>
                        <span className="text-[10px] text-[#8B8894]">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-[10px] text-[#8B8894] space-y-0.5">
                        <p><span className="text-[#5C5A66]">Prompt version:</span> {item.provenance.promptVersion}</p>
                        <p><span className="text-[#5C5A66]">Imported:</span> {new Date(item.provenance.importedAt).toLocaleDateString()}</p>
                      </div>

                      {item.evidence && Array.isArray(item.evidence) && item.evidence.length > 0 && (
                        <div className="pt-1 text-[11px]">
                          <span className="text-[#8B8894] block">Evidence:</span>
                          <ul className="list-disc list-inside text-[#EDEAE3] space-y-0.5 mt-0.5">
                            {item.evidence.map((ev: string, idx: number) => (
                              <li key={idx}>{ev}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-xs text-[#5C5A66] text-center">
              Select any capability from the taxonomy to view score history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
