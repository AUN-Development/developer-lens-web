"use client";

import { GitCommit, GitPullRequest, Calendar } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl border border-border bg-card p-4 shadow-2xl animate-pulse">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-14 w-14 bg-muted border border-border" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-20 bg-muted/60 rounded" />
                <div className="h-6 w-32 bg-muted rounded" />
              </div>
            </div>
            <div className="h-9 w-24 bg-muted border border-border" />
          </div>

          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 border border-border bg-muted/30 p-1">
              <div className="h-7 w-16 bg-muted/40" />
              <div className="h-7 w-16 bg-muted/40" />
              <div className="h-7 w-16 bg-muted/40" />
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-center justify-end gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">
              <span>Less</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-2.5 w-2.5 bg-muted border border-border" />
                ))}
              </div>
              <span>More</span>
            </div>

            <div className="flex justify-center overflow-x-auto pb-2">
              <div className="grid auto-cols-[7px] grid-flow-col gap-0.75 sm:auto-cols-[9px] sm:gap-1">
                {Array.from({ length: 53 }).map((_, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-0.75 sm:gap-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="h-2 w-2 sm:h-2.5 sm:w-2.5 bg-muted/40"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="h-7 w-40 bg-muted/60" />
            </div>
          </div>

          <div className="grid w-full gap-3 border-t border-border pt-8 sm:grid-cols-3">
            {[
              { label: "Commits", icon: <GitCommit className="h-3 w-3" /> },
              { label: "PRs", icon: <GitPullRequest className="h-3 w-3" /> },
              { label: "Active Days", icon: <Calendar className="h-3 w-3" /> },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-1 border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                  {stat.icon}
                  {stat.label}
                </div>
                <div className="h-8 w-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}