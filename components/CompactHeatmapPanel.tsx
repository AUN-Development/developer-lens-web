"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { LogOut, GitCommit, GitPullRequest, Calendar, X, ExternalLink } from "lucide-react";
import { signOut } from "next-auth/react";

import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import type { ActivityDay, ActivityFilter, GitHubActivitySnapshot } from "@/lib/github";
import Link from "next/link";

const filterOptions: Array<{ value: ActivityFilter; label: string }> = [
  { value: "both", label: "Both" },
  { value: "commits", label: "Commits" },
  { value: "pull-requests", label: "PRs" },
];


function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="group flex flex-col gap-1 border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40">
      <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        <span className="text-primary/60">{icon}</span>
        {label}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-card-foreground">{value}</p>
    </div>
  );
}

export function CompactHeatmapPanel({ snapshot }: { snapshot: GitHubActivitySnapshot }) {
  const [filter, setFilter] = useState<ActivityFilter>("both");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dialogDate, setDialogDate] = useState<string | null>(null);

  const filteredDays = useMemo(() => {
    return snapshot.days.map((day) => ({
      ...day,
      commits: filter === "pull-requests" ? 0 : day.commits,
      pullRequests: filter === "commits" ? 0 : day.pullRequests,
    }));
  }, [snapshot.days, filter]);

  const activeDay = snapshot.days.find((day) => day.date === selectedDate) ??
    snapshot.days.find((day) => day.active) ??
    snapshot.days.find((day) => day.date);
  const dialogDay = snapshot.days.find((day) => day.date === dialogDate) ?? null;
  const commitItems = (dialogDay?.items ?? []).filter((item) => item.kind === "commit");

  return (
    <div className="w-full max-w-3xl border border-border bg-card p-4 shadow-2xl dark:shadow-none">
      <div className="flex flex-col gap-8">

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={snapshot.profile.avatarUrl || "/logo.png"} 
                alt={snapshot.profile.login}
                width={56}
                height={56}
                className="h-14 w-14 border border-border object-cover shadow-sm"
              />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">{snapshot.year} Activity</p>
              <h1 className="text-xl font-semibold tracking-tight text-card-foreground">{snapshot.profile.login}</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group cursor-pointer inline-flex items-center gap-2 border border-border bg-muted/50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 border border-border bg-muted/30 p-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`cursor-pointer px-4 py-1.5 text-[11px] font-bold transition-all duration-200 ${filter === option.value
                    ? "bg-card text-foreground shadow-md ring-1 ring-white/10"
                    : "text-muted-foreground/50 hover:text-foreground"
                  }`}
              >
                <span className="relative z-10">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4">
          <ActivityHeatmap
            days={filteredDays}
            filter={filter}
            selectedDate={selectedDate}
            onSelect={(day: ActivityDay) => setSelectedDate(day.date)}
            canClickDay={(day: ActivityDay) =>
              day.items.some((item) => item.kind === "commit")
            }
            onDayClick={(day: ActivityDay) => {
              setSelectedDate(day.date);
              setDialogDate(day.date);
            }}
          />

          <div className="inline-flex items-center gap-2 bg-black px-3 py-1.5 text-[10px] font-medium text-white shadow-lg dark:bg-zinc-800">
            <Calendar className="h-3 w-3 text-primary" />
            {activeDay ? (
              <span>{activeDay.date} — {activeDay.commits + activeDay.pullRequests} actions</span>
            ) : (
              "Select a node"
            )}
          </div>
        </div>

        <div className="grid w-full gap-3 border-t border-border pt-8 sm:grid-cols-3">
          <Stat
            label="Commits"
            value={snapshot.stats.totalCommits}
            icon={<GitCommit className="h-3 w-3" />}
          />
          <Stat
            label="PRs"
            value={snapshot.stats.totalPullRequests}
            icon={<GitPullRequest className="h-3 w-3" />}
          />
          <Stat
            label="Active Days"
            value={snapshot.stats.activeDays}
            icon={<Calendar className="h-3 w-3" />}
          />
        </div>
      </div>

      {dialogDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs "
          onClick={() => setDialogDate(null)}
        >
          <div
            className="w-full max-w-3xl border border-border bg-card p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">Activity details</p>
                <h2 className="mt-1 text-lg font-semibold text-card-foreground">{dialogDay.date}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{commitItems.length} commits</p>
              </div>

              <button
                type="button"
                onClick={() => setDialogDate(null)}
                className="cursor-pointer border border-border bg-muted/40 p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {commitItems.length > 0 ? (
              <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                {commitItems.map((item) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block border border-border bg-muted/20 p-3 transition hover:bg-muted/40"
                  >
                    <p className="text-sm font-medium text-card-foreground">{item.message ?? item.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.repo}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                Geen commits op deze dag.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}