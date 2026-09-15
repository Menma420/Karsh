"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";

export default function TimelinePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      try {
        setLoading(true);
        let url = "/reflection-entries";
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await apiFetch(url);
        setEntries(res.entries || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEntries();
  }, [from, to]);

  const allTags = Array.from(
    new Set(
      entries.flatMap((e) => (e.tags ? e.tags.map((t: any) => t.tag?.name) : []))
    )
  ).filter(Boolean);

  const filteredEntries = selectedTag
    ? entries.filter((e) => e.tags?.some((t: any) => t.tag?.name === selectedTag))
    : entries;

  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#2A2934]/40 pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-[#EDEAE3]">
            Timeline
          </h1>
          <p className="text-xs text-[#8B8894] mt-1">
            Complete stream of reflection evidence ordered by occurrence date.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#8B8894]">
            <span>From:</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-2 py-1 text-[#EDEAE3] text-xs focus:outline-none focus:border-[#C9A26D]"
            />
            <span>To:</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-[#1D1C22] border border-[#2A2934] rounded-[6px] px-2 py-1 text-[#EDEAE3] text-xs focus:outline-none focus:border-[#C9A26D]"
            />
          </div>

          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-[#1D1C22] border border-[#2A2934] text-[#EDEAE3] text-xs rounded-[6px] px-2.5 py-1 focus:outline-none focus:border-[#C9A26D]"
            >
              <option value="">All tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#5C5A66]">Loading evidence stream...</div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8B8894]">
          No reflection entries found matching filter criteria.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEntries.map((entry) => {
            const occurredDateStr = entry.occurredOn.split("T")[0];
            const createdDateStr = entry.createdAt.split("T")[0];
            const isBackfilled = occurredDateStr !== createdDateStr;

            return (
              <div
                key={entry.id}
                className="space-y-2 border-b border-[#2A2934]/40 pb-5 last:border-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-mono font-medium text-[#C9A26D]">
                      {occurredDateStr}
                    </span>
                    <h3 className="font-medium text-sm text-[#EDEAE3]">
                      {entry.title || "Reflection Entry"}
                    </h3>
                  </div>

                  {isBackfilled && (
                    <span className="text-[10px] text-[#8B8894]">
                      Recorded on {createdDateStr} via backfill
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  {entry.intent && (
                    <div>
                      <span className="text-[#5C5A66] block">Intent</span>
                      <p className="text-[#EDEAE3] mt-0.5">{entry.intent}</p>
                    </div>
                  )}

                  {entry.outcome && (
                    <div>
                      <span className="text-[#5C5A66] block">Outcome</span>
                      <p className="text-[#EDEAE3] mt-0.5">{entry.outcome}</p>
                    </div>
                  )}

                  {entry.wentWell && (
                    <div>
                      <span className="text-[#5C5A66] block">Went well</span>
                      <p className="text-[#EDEAE3] mt-0.5">{entry.wentWell}</p>
                    </div>
                  )}

                  {entry.struggle && (
                    <div>
                      <span className="text-[#5C5A66] block">Struggle</span>
                      <p className="text-[#EDEAE3] mt-0.5">{entry.struggle}</p>
                    </div>
                  )}

                  {entry.whyItHappened && (
                    <div>
                      <span className="text-[#5C5A66] block">Why it happened</span>
                      <p className="text-[#EDEAE3] mt-0.5">{entry.whyItHappened}</p>
                    </div>
                  )}

                  {entry.learned && (
                    <div>
                      <span className="text-[#C9A26D] block">Learned</span>
                      <p className="text-[#EDEAE3] mt-0.5">{entry.learned}</p>
                    </div>
                  )}
                </div>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-[#8B8894]">
                    {entry.tags.map((t: any) => (
                      <span key={t.tag.id} className="text-[#8B8894]">
                        #{t.tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
