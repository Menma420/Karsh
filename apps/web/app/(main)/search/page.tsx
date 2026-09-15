"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Search, FileText, FlaskConical, GitCommit, BookOpen } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
      setResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Search className="w-5 h-5 text-sky-400" />
          <span>Cross-Entity Evidence Search</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Full-text query across entries, experiments, decisions, and learning records.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, hypotheses, decisions, tags..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs px-5 py-2 rounded-lg transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {results && (
        <div className="space-y-6">
          {/* Entries */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Reflection Entries ({results.entries.length})</span>
            </h2>
            {results.entries.length === 0 ? (
              <p className="text-xs text-slate-500">No matching entries.</p>
            ) : (
              <div className="space-y-2">
                {results.entries.map((e: any) => (
                  <div key={e.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs">
                    <div className="font-semibold text-slate-200">{e.title || "Reflection Entry"} ({e.occurredOn.split("T")[0]})</div>
                    {e.intent && <p className="text-slate-400 mt-1">Intent: {e.intent}</p>}
                    {e.learned && <p className="text-sky-300 mt-1">Learned: {e.learned}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experiments */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>Experiments ({results.experiments.length})</span>
            </h2>
            {results.experiments.length === 0 ? (
              <p className="text-xs text-slate-500">No matching experiments.</p>
            ) : (
              <div className="space-y-2">
                {results.experiments.map((exp: any) => (
                  <div key={exp.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs">
                    <div className="font-semibold text-slate-200">{exp.problem}</div>
                    <p className="text-slate-400 mt-1">Hypothesis: {exp.hypothesis}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Decisions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <GitCommit className="w-4 h-4 text-sky-400" />
              <span>Decisions ({results.decisions.length})</span>
            </h2>
            {results.decisions.length === 0 ? (
              <p className="text-xs text-slate-500">No matching decisions.</p>
            ) : (
              <div className="space-y-2">
                {results.decisions.map((dec: any) => (
                  <div key={dec.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs">
                    <div className="font-semibold text-slate-200">{dec.decision}</div>
                    <p className="text-slate-400 mt-1">Reasoning: {dec.reasoning}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
