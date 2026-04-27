"use client";

import { signIn } from "next-auth/react";

export function GitHubSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("github", { callbackUrl: "/" })}
      className="group relative h-12 w-full cursor-pointer overflow-hidden bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all duration-700 ease-in-out"
    >
      <div className="absolute inset-0 bg-muted opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100" />

      <div className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-700 group-hover:text-foreground">
        <span>Continue with GitHub</span>
        <svg
          className="h-3 w-3 translate-y-1 -translate-x-1 opacity-0 transition-all duration-700 ease-out group-hover:translate-y-0 group-hover:translate-x-0 group-hover:opacity-100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      </div>
    </button>
  );
}