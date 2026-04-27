"use client";

import type { ActivityDay, ActivityFilter } from "@/lib/github";

const legend = [
  { label: "0", className: "bg-chart-1" },
  { label: "1-2", className: "bg-chart-2" },
  { label: "3-5", className: "bg-chart-3" },
  { label: "6-9", className: "bg-chart-4" },
  { label: "10+", className: "bg-chart-5" },
];

function getIntensity(day: ActivityDay) {
  const total = day.commits + day.pullRequests;
  if (total === 0) return 0;
  if (total <= 2) return 1;
  if (total <= 5) return 2;
  if (total <= 9) return 3;
  return 4;
}

export function ActivityHeatmap({
  days,
  filter,
  selectedDate,
  onSelect,
  onDayClick,
  canClickDay,
}: {
  days: ActivityDay[];
  filter: ActivityFilter;
  selectedDate: string | null;
  onSelect: (day: ActivityDay) => void;
  onDayClick?: (day: ActivityDay) => void;
  canClickDay?: (day: ActivityDay) => boolean;
}) {
  const filteredDays = days.filter((day) => day.date);
  const columns = Math.max(...filteredDays.map((day) => day.weekIndex), 0) + 1;

  const weeks = Array.from({ length: columns }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) =>
      filteredDays.find(
        (day) => day.weekIndex === weekIndex && day.dayIndex === dayIndex
      )
    )
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-end gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {legend.map((entry, i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 ${entry.className} border border-black/5 dark:border-white/5`}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      <div className="flex justify-center overflow-x-auto pb-2 scrollbar-hide">
        <div className="grid auto-cols-[7px] grid-flow-col gap-0.75 sm:auto-cols-[9px] sm:gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-0.75 sm:gap-1">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="h-2 w-2 sm:h-2.5 sm:w-2.5"
                    />
                  );
                }

                const clickable = canClickDay ? canClickDay(day) : true;

                const total =
                  filter === "commits"
                    ? day.commits
                    : filter === "pull-requests"
                    ? day.pullRequests
                    : day.commits + day.pullRequests;

                const intensity =
                  total === 0
                    ? 0
                    : getIntensity({ ...day, commits: total, pullRequests: 0 });

                const active = selectedDate === day.date;

                const bgClasses = [
                  "bg-muted hover:bg-muted-foreground/20",
                  "bg-[#C1FF72]/20 hover:bg-[#C1FF72]/30",
                  "bg-[#C1FF72]/50 hover:bg-[#C1FF72]/60",
                  "bg-[#C1FF72]/80 hover:bg-[#C1FF72]/90",
                  "bg-[#C1FF72] hover:bg-[#d2ff93]",
                ];

                return (
                  <button
                    key={day.date}
                    onClick={() => {
                      if (!clickable) return;
                      onSelect(day);
                      onDayClick?.(day);
                    }}
                    onMouseEnter={() => onSelect(day)}
                    aria-disabled={!clickable}
                    className={`h-2 w-2 transition-all duration-300 sm:h-2.5 sm:w-2.5 ${
                      bgClasses[intensity]
                    } ${active ? "scale-125 z-10" : ""} ${
                      clickable ? "cursor-pointer" : "cursor-default"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}