"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isToday 
} from "date-fns";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<any[]>([]);
  const [settings, setSettings] = useState({ backfillDays: 7, timezone: "Asia/Kolkata" });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const fromStr = format(monthStart, "yyyy-MM-dd");
  const toStr = format(monthEnd, "yyyy-MM-dd");
  const todayStr = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    async function loadData() {
      try {
        const [setRes, entRes] = await Promise.all([
          apiFetch("/settings"),
          apiFetch(`/reflection-entries?from=${fromStr}&to=${toStr}`),
        ]);
        if (setRes.settings) setSettings(setRes.settings);
        setEntries(entRes.entries || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [fromStr, toStr]);

  const entriesByDate = new Map<string, any[]>();
  entries.forEach((e) => {
    const dStr = e.occurredOn.split("T")[0];
    if (!entriesByDate.has(dStr)) entriesByDate.set(dStr, []);
    entriesByDate.get(dStr)!.push(e);
  });

  const calculateEarliestAllowed = () => {
    const d = new Date();
    d.setDate(d.getDate() - settings.backfillDays);
    return format(d, "yyyy-MM-dd");
  };

  const earliestAllowed = calculateEarliestAllowed();

  const isEligibleForNew = (dStr: string) => {
    return dStr >= earliestAllowed && dStr <= todayStr;
  };

  const selectedDateEntries = selectedDate ? entriesByDate.get(selectedDate) || [] : [];

  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#2A2934]/40 pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-[#EDEAE3]">
            Calendar
          </h1>
          <p className="text-xs text-[#8B8894] mt-1">
            Browse evidence chronology. Neutral indicators mark dates with recorded entries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="text-xs text-[#8B8894] hover:text-[#EDEAE3] transition-colors"
          >
            &larr; Prev
          </button>
          <span className="text-sm font-medium text-[#EDEAE3] min-w-[120px] text-center font-display">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="text-xs text-[#8B8894] hover:text-[#EDEAE3] transition-colors"
          >
            Next &rarr;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#8B8894] pb-1">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const dStr = format(day, "yyyy-MM-dd");
              const dayEntries = entriesByDate.get(dStr) || [];
              const count = dayEntries.length;
              const isSelected = selectedDate === dStr;
              const isTodayDate = isToday(day);

              return (
                <button
                  key={dStr}
                  onClick={() => setSelectedDate(dStr)}
                  className={`min-h-[64px] p-2 rounded-[6px] text-left flex flex-col justify-between transition-colors ${
                    isSelected
                      ? "bg-[#1D1C22] border border-[#C9A26D]"
                      : isTodayDate
                      ? "bg-[#1D1C22]/80 border border-[#2A2934]"
                      : "bg-[#16151A] border border-[#2A2934]/40 hover:border-[#2A2934]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={isTodayDate ? "text-[#C9A26D] font-medium" : "text-[#EDEAE3]"}>
                      {format(day, "d")}
                    </span>
                    {count > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A26D]" />
                    )}
                  </div>

                  <div>
                    {count > 0 ? (
                      <span className="text-[10px] text-[#8B8894]">
                        {count} {count === 1 ? "entry" : "entries"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#5C5A66]">&mdash;</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel */}
        <div className="bg-[#1D1C22] border border-[#2A2934]/60 rounded-[10px] p-5 space-y-4 h-fit">
          {selectedDate ? (
            <>
              <div className="flex items-center justify-between border-b border-[#2A2934]/40 pb-3">
                <div>
                  <h3 className="text-sm font-medium text-[#EDEAE3]">
                    {selectedDate}
                  </h3>
                  <p className="text-[11px] text-[#8B8894]">
                    {selectedDateEntries.length} recorded {selectedDateEntries.length === 1 ? "entry" : "entries"}
                  </p>
                </div>

                {isEligibleForNew(selectedDate) ? (
                  <Link
                    href={`/entries/new?date=${selectedDate}`}
                    className="bg-[#C9A26D] hover:bg-[#b8925d] text-[#16151A] font-medium text-xs px-3 py-1 rounded-[6px] transition-colors"
                  >
                    + Record
                  </Link>
                ) : (
                  <span className="text-[10px] text-[#5C5A66]">
                    Outside window
                  </span>
                )}
              </div>

              {selectedDateEntries.length === 0 ? (
                <div className="py-6 text-xs text-[#8B8894] space-y-2">
                  <p>No entries recorded for this date.</p>
                  {isEligibleForNew(selectedDate) && (
                    <Link
                      href={`/entries/new?date=${selectedDate}`}
                      className="text-[#C9A26D] hover:underline inline-block pt-1"
                    >
                      + Record entry for {selectedDate}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto">
                  {selectedDateEntries.map((e) => (
                    <div key={e.id} className="border-b border-[#2A2934]/40 pb-2 text-xs space-y-1">
                      <div className="font-medium text-[#EDEAE3]">
                        {e.title || "Reflection Entry"}
                      </div>
                      {e.intent && <p className="text-[#8B8894]"><span className="text-[#5C5A66]">Intent:</span> {e.intent}</p>}
                      {e.outcome && <p className="text-[#8B8894]"><span className="text-[#5C5A66]">Outcome:</span> {e.outcome}</p>}
                      {e.learned && <p className="text-[#C9A26D]"><span className="text-[#8B8894]">Learned:</span> {e.learned}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-xs text-[#5C5A66] text-center">
              Select any date on the calendar to view historical evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
