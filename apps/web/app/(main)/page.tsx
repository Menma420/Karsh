"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

export default function DashboardPage() {
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [todayEntries, setTodayEntries] = useState<any[]>([]);
  const [activeExperiment, setActiveExperiment] = useState<any>(null);
  const [bottleneck, setBottleneck] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split("T")[0];
  const formattedDate = todayObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [capRes, entryRes, expRes] = await Promise.all([
          apiFetch("/capabilities"),
          apiFetch(`/reflection-entries?from=${todayStr}&to=${todayStr}`),
          apiFetch("/experiments?status=ACTIVE"),
        ]);

        setCapabilities(capRes.capabilities || []);
        setTodayEntries(entryRes.entries || []);
        if (expRes.experiments && expRes.experiments.length > 0) {
          setActiveExperiment(expRes.experiments[0]);
        }

        const withAssessments = (capRes.capabilities || []).filter((c: any) => c.latestAssessment);
        if (withAssessments.length > 0) {
          withAssessments.sort((a: any, b: any) => a.latestAssessment.score - b.latestAssessment.score);
          setBottleneck(withAssessments[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [todayStr]);

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

  if (loading) {
    return (
      <div className="pt-20 pb-12 flex items-center justify-center">
        <p className="text-sm text-[#8B8894] animate-pulse">Loading OS state...</p>
      </div>
    );
  }

  return (
    <div className="space-y-14 pt-4 pb-12">
      {/* Weight 1 — Hero (No Card, directly on page background) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-medium text-[#EDEAE3] tracking-tight">
              Today
            </h1>
            <p className="text-sm text-[#8B8894] mt-1 font-sans" suppressHydrationWarning>
              {formattedDate}
            </p>
          </div>

          <Link
            href="/entries/new"
            className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium text-xs px-4 py-2 rounded-[6px] transition-colors inline-flex items-center justify-center shrink-0 self-start sm:self-auto"
          >
            + Record something
          </Link>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <span className="text-xs text-[#8B8894] font-medium block mb-1">
              Current focus
            </span>
            {activeExperiment ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-display font-medium text-[#EDEAE3] leading-snug max-w-2xl">
                  {activeExperiment.problem}
                </h2>
                <p className="text-xs text-[#8B8894] mt-2 max-w-xl leading-relaxed">
                  {activeExperiment.hypothesis}
                </p>
              </>
            ) : (
              <h2 className="text-xl font-display text-[#8B8894] italic leading-snug max-w-xl">
                No active focus
              </h2>
            )}
          </div>

          <div className="pt-2">
            <span className="text-xs text-[#8B8894] font-medium block mb-0.5">
              This week&apos;s bottleneck
            </span>
            {bottleneck ? (
              <>
                <p className="text-sm text-[#EDEAE3] font-medium">
                  {bottleneck.name} ({bottleneck.latestAssessment.score}/10)
                </p>
                <p className="text-xs text-[#8B8894] mt-0.5">
                  {bottleneck.latestAssessment.observations?.[0] || "No observation recorded."}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#8B8894] italic">
                No structural bottlenecks currently assessed.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Weight 2 — Active Strip (Left-edge accent bar, subtle surface fill) */}
      <section className="space-y-2">
        <span className="text-xs text-[#8B8894] font-medium block">
          This week&apos;s experiment
        </span>

        {activeExperiment ? (
          <Link
            href={`/experiments/${activeExperiment.id}`}
            className="block bg-[#1D1C22] border-l-2 border-[#C9A26D] rounded-r-[10px] p-4 sm:p-5 space-y-3 hover:bg-[#2A2934]/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-medium text-[#EDEAE3] group-hover:text-[#C9A26D] transition-colors">
                {activeExperiment.problem}
              </h3>
              <span className="text-xs text-[#7A9B7E] flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A9B7E]" />
                <span>Active</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#8B8894] block">Problem</span>
                <p className="text-[#EDEAE3] mt-0.5">{activeExperiment.problem}</p>
              </div>
              <div>
                <span className="text-[#8B8894] block">Intervention</span>
                <p className="text-[#EDEAE3] mt-0.5">{activeExperiment.intervention}</p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="bg-[#1D1C22]/40 border-l-2 border-[#2A2934] rounded-r-[10px] p-4 sm:p-5 text-center">
            <p className="text-sm text-[#5C5A66] italic mb-1.5">No active experiment.</p>
            <Link href="/experiments" className="text-xs text-[#8B8894] hover:text-[#EDEAE3] underline underline-offset-4">
              Review history or draft a new experiment &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* Weight 3 — Quiet / Empty State (Unboxed, left-aligned) */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between border-b border-[#2A2934]/40 pb-2">
          <h2 className="text-sm font-medium text-[#EDEAE3]">
            Today&apos;s evidence
          </h2>
          <Link
            href="/entries/new"
            className="text-xs text-[#8B8894] hover:text-[#EDEAE3] transition-colors"
          >
            + Record entry
          </Link>
        </div>

        {todayEntries.length === 0 ? (
          <div className="py-4 space-y-3">
            <p className="text-sm text-[#8B8894]">
              No entries recorded today.
            </p>
            <p className="text-xs text-[#5C5A66] max-w-md">
              Nothing needs to be reconstructed. When something meaningful happens, record it here.
            </p>
            <div className="pt-2">
              <Link
                href="/entries/new"
                className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium text-xs px-3.5 py-1.5 rounded-[6px] transition-colors inline-block"
              >
                + Record something
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {todayEntries.map((entry) => {
              const timeStr = new Date(entry.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <Link
                  key={entry.id}
                  href={`/entries/${entry.id}`}
                  className="block space-y-1 pb-3 px-2 -mx-2 hover:bg-[#2A2934]/30 rounded-lg group transition-colors"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-mono text-[#5C5A66] group-hover:text-[#8B8894] max-w-[40px]">{timeStr}</span>
                    <h3 className="text-sm font-medium text-[#EDEAE3] group-hover:text-[#C9A26D]">
                      {entry.title || "Reflection Entry"}
                    </h3>
                  </div>

                  {entry.intent && (
                    <p className="text-xs text-[#8B8894] pl-[52px]">
                      <span className="text-[#5C5A66]">Intent:</span> {entry.intent}
                    </p>
                  )}
                  {entry.outcome && (
                    <p className="text-xs text-[#8B8894] pl-[52px]">
                      <span className="text-[#5C5A66]">Outcome:</span> {entry.outcome}
                    </p>
                  )}
                  {entry.learned && (
                    <p className="text-xs text-[#C9A26D] pl-[52px]">
                      <span className="text-[#8B8894]">Learned:</span> {entry.learned}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Capability State Grid */}
      <section className="space-y-4 pt-4 border-t border-[#2A2934]/50">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-[#EDEAE3]">
            Capability state
          </h2>
          <Link
            href="/capabilities"
            className="text-xs text-[#8B8894] hover:text-[#EDEAE3] transition-colors"
          >
            Full taxonomy &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const items = groupedCapabilities[lvl] || [];
            return (
              <div key={lvl} className="space-y-2">
                <h3 className="text-xs font-medium text-[#8B8894] border-b border-[#2A2934]/50 pb-1">
                  {levelLabels[lvl]}
                </h3>

                {items.length === 0 ? (
                  <p className="text-xs text-[#5C5A66] italic">No capabilities defined.</p>
                ) : (
                  <div className="space-y-1.5">
                    {items.map((cap) => {
                      const latest = cap.latestAssessment;
                      const hasScore = latest !== null;
                      const score = latest?.score;

                      return (
                        <div
                          key={cap.id}
                          className="flex items-center justify-between text-xs py-0.5"
                        >
                          <span className="text-[#EDEAE3]">{cap.name}</span>
                          {hasScore ? (
                            <span className="font-mono text-[#C9A26D] font-medium">{score}</span>
                          ) : (
                            <span className="font-mono text-[#5C5A66]">&mdash;</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
