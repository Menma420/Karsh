"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";

export default function LearningRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [topic, setTopic] = useState("");
  const [source, setSource] = useState("");
  const [whatLearned, setWhatLearned] = useState("");
  const [explanation, setExplanation] = useState("");
  const [application, setApplication] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      setLoading(true);
      const res = await apiFetch("/learning-records");
      setRecords(res.learningRecords || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/learning-records", {
        method: "POST",
        body: JSON.stringify({
          date,
          topic,
          source: source || null,
          whatLearned: whatLearned || null,
          explanation: explanation || null,
          application: application || null,
        }),
      });
      setShowModal(false);
      setTopic("");
      setSource("");
      setWhatLearned("");
      setExplanation("");
      setApplication("");
      loadRecords();
    } catch (err: any) {
      alert(err.message || "Error creating learning record");
    }
  };

  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#2A2934]/40 pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-[#EDEAE3]">
            Learning records
          </h1>
          <p className="text-xs text-[#8B8894] mt-1">
            Structured insights, explanations, and practical applications.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium text-xs px-3.5 py-1.5 rounded-[6px] transition-colors self-start sm:self-auto"
        >
          + New learning record
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#16151A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1D1C22] border border-[#2A2934] w-full max-w-lg rounded-[10px] p-6 space-y-4">
            <h2 className="text-base font-display font-medium text-[#EDEAE3]">Add learning record</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#8B8894] mb-1">Topic / Subject</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. PostgreSQL Write-Ahead Logging (WAL)"
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#8B8894] mb-1">Source / Reference</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Postgres Docs / Official Internals Guide"
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#8B8894] mb-1">What I learned</label>
                <textarea
                  rows={2}
                  value={whatLearned}
                  onChange={(e) => setWhatLearned(e.target.value)}
                  placeholder="Core insight..."
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#8B8894] mb-1">Explanation in own words</label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Plain language explanation..."
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#8B8894] mb-1">Practical application</label>
                <textarea
                  rows={2}
                  value={application}
                  onChange={(e) => setApplication(e.target.value)}
                  placeholder="How it will be applied..."
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] placeholder:text-[#5C5A66] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#8B8894] mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-[#8B8894] hover:text-[#EDEAE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium px-4 py-1.5 rounded-[6px]"
                >
                  Save record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-[#5C5A66]">Loading learning records...</div>
      ) : records.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8B8894]">
          No learning records captured yet.
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <div key={rec.id} className="border-b border-[#2A2934]/40 pb-4 space-y-1.5 text-xs">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-medium text-sm text-[#EDEAE3]">{rec.topic}</h3>
                <span className="text-[#8B8894] shrink-0">{rec.date.split("T")[0]}</span>
              </div>
              {rec.source && <p className="text-[#8B8894]"><span className="text-[#5C5A66]">Source:</span> {rec.source}</p>}
              {rec.whatLearned && <p className="text-[#EDEAE3]"><span className="text-[#8B8894]">What learned:</span> {rec.whatLearned}</p>}
              {rec.explanation && <p className="text-[#EDEAE3]"><span className="text-[#8B8894]">Explanation:</span> {rec.explanation}</p>}
              {rec.application && <p className="text-[#C9A26D]"><span className="text-[#8B8894]">Application:</span> {rec.application}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
