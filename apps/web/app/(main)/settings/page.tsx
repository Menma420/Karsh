"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { Settings as SettingsIcon, Download, Save, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [backfillDays, setBackfillDays] = useState(7);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await apiFetch("/settings");
      if (res.settings) {
        setBackfillDays(res.settings.backfillDays);
        setTimezone(res.settings.timezone);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await apiFetch("/settings", {
        method: "PATCH",
        body: JSON.stringify({ backfillDays: Number(backfillDays), timezone }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExportZip = () => {
    window.open("/api/export", "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-sky-400" />
          <span>System Settings &amp; Data Export</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure backfill windows, timezone, and download complete data archives.
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
          Recording &amp; Date Rules
        </h2>

        {savedSuccess && (
          <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 p-3 rounded-md text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Backfill Window (days back allowed for NEW entries): {backfillDays} days
            </label>
            <input
              type="range"
              min={0}
              max={30}
              value={backfillDays}
              onChange={(e) => setBackfillDays(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0 days (Strict same-day only)</span>
              <span>7 days (Default week)</span>
              <span>30 days (Full month)</span>
            </div>

            <div className="mt-2 bg-slate-950 border border-slate-800 p-3 rounded-lg text-slate-400 text-[11px] space-y-1">
              <span className="font-semibold text-sky-400">Backfill Boundary Policy:</span>
              <p>
                Changing <code className="text-slate-200">backfillDays</code> restricts creation of NEW entries to the window <code className="text-slate-200">[today - backfillDays, today]</code>.
                Existing entries created earlier outside this window remain 100% visible, searchable, and editable.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs py-2 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </form>

      {/* Data Export Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
          Data Ownership &amp; Export
        </h2>
        <p className="text-xs text-slate-400">
          Export your entire Personal Capability OS database as a single ZIP archive containing complete JSON records (<code className="text-slate-200">data.json</code>) and a formatted Markdown bundle (<code className="text-slate-200">reflections.md</code>).
        </p>

        <div>
          <button
            type="button"
            onClick={handleExportZip}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-medium text-xs py-2.5 px-4 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Download Complete Data Archive (.ZIP)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
