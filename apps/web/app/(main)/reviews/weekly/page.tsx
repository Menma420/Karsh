"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";

export default function ReviewsPage() {
  const [weeklyReviews, setWeeklyReviews] = useState<any[]>([]);
  const [monthlyReviews, setMonthlyReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      setLoading(true);
      const [wRes, mRes] = await Promise.all([
        apiFetch("/reviews/weekly"),
        apiFetch("/reviews/monthly"),
      ]);
      setWeeklyReviews(wRes.reviews || []);
      setMonthlyReviews(mRes.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === "weekly" ? "/reviews/weekly" : "/reviews/monthly";
      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          periodStart,
          periodEnd,
          answers: {
            "Biggest Wins": q1,
            "Primary Bottleneck": q2,
            "Next Period Actions": q3,
          },
        }),
      });
      setShowModal(false);
      setQ1("");
      setQ2("");
      setQ3("");
      loadReviews();
    } catch (err: any) {
      alert(err.message || "Error saving review");
    }
  };

  const list = activeTab === "weekly" ? weeklyReviews : monthlyReviews;

  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#2A2934]/40 pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-[#EDEAE3]">
            Periodic reviews
          </h1>
          <p className="text-xs text-[#8B8894] mt-1">
            Weekly and monthly structured reflection self-evaluations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1D1C22] border border-[#2A2934] p-1 rounded-[6px] flex gap-1">
            <button
              onClick={() => setActiveTab("weekly")}
              className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "weekly" ? "bg-[#C9A26D] text-[#16151A]" : "text-[#8B8894] hover:text-[#EDEAE3]"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${
                activeTab === "monthly" ? "bg-[#C9A26D] text-[#16151A]" : "text-[#8B8894] hover:text-[#EDEAE3]"
              }`}
            >
              Monthly
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium text-xs px-3.5 py-1.5 rounded-[6px] transition-colors"
          >
            + New {activeTab === "weekly" ? "weekly" : "monthly"} review
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#16151A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1D1C22] border border-[#2A2934] w-full max-w-lg rounded-[10px] p-6 space-y-4">
            <h2 className="text-base font-display font-medium text-[#EDEAE3]">
              Submit {activeTab === "weekly" ? "weekly" : "monthly"} review
            </h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#8B8894] mb-1">Period start</label>
                  <input
                    type="date"
                    required
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#8B8894] mb-1">Period end</label>
                  <input
                    type="date"
                    required
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#8B8894] mb-1">1. What were the biggest capability wins?</label>
                <textarea
                  rows={2}
                  value={q1}
                  onChange={(e) => setQ1(e.target.value)}
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#8B8894] mb-1">2. What was the primary bottleneck or struggle?</label>
                <textarea
                  rows={2}
                  value={q2}
                  onChange={(e) => setQ2(e.target.value)}
                  className="w-full bg-[#16151A] border border-[#2A2934] rounded-[6px] px-3 py-2 text-[#EDEAE3] focus:outline-none focus:border-[#C9A26D]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#8B8894] mb-1">3. Concrete action plan for next period?</label>
                <textarea
                  rows={2}
                  value={q3}
                  onChange={(e) => setQ3(e.target.value)}
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
                  Save review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-[#5C5A66]">Loading reviews...</div>
      ) : list.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8B8894]">
          No {activeTab} reviews submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((rev) => (
            <div key={rev.id} className="border-b border-[#2A2934]/40 pb-4 space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-[#EDEAE3]">
                  Period: {rev.periodStart.split("T")[0]} to {rev.periodEnd.split("T")[0]}
                </span>
                <span className="text-[#8B8894]">Submitted: {new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="space-y-1 text-xs">
                {rev.answers &&
                  Object.entries(rev.answers).map(([q, a]) => (
                    <div key={q}>
                      <span className="text-[#8B8894] block">{q}</span>
                      <p className="text-[#EDEAE3] mt-0.5">{String(a)}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
