import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GitHubSignInButton } from "@/components/GitHubSignInButton";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect(`/${session.user.login ?? session.user.name ?? "developer"}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-background to-background">
      <div className="w-full max-w-xl overflow-hidden border border-border/50 bg-card/60 shadow-2xl dark:shadow-none backdrop-blur-xl">
        <div className="p-8 pb-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center text-primary">
              <svg
                viewBox="0 0 2160 2160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
              >
                <path
                  d="M0.0439453 2160H0V2159.96L0.0439453 2160ZM2160 859.087L859.087 2160H0.508789L2160 0.508789V859.087ZM2160 2160H1000.51L2160 1000.51V2160ZM0 2019.09V1160.51L1160.51 0H2019.09L0 2019.09ZM0 1019.09V0H1019.09L0 1019.09Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
              v1.0.0 — {new Date().getFullYear()}
            </span>
          </div>

          <h1 className="text-xl font-bold tracking-tight">Developer Lens</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Visualize your annual commits and pull requests.
          </p>
        </div>

        <div className="px-8 py-8">
          <GitHubSignInButton />
        </div>

        <footer className="flex items-center justify-between border-t border-border/40 bg-muted/5 px-8 py-5 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"></span>
            </div>
            <span className="text-[.65em] font-semibold uppercase text-muted-foreground/50">
              System Ready
            </span>
          </div>

          <Link
            href="https://aundevelopment.dev"
            target="_blank"
            className="group flex items-center gap-2 text-[.65em] font-semibold uppercase text-muted-foreground/50 transition-all duration-700 hover:text-primary"
          >
            <span className="relative">
              By AUN Development
              <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-primary/50 transition-transform duration-700 ease-out group-hover:origin-left group-hover:scale-x-100" />
            </span>

            <div className="overflow-hidden">
              <svg
                className="transform transition-all duration-700 ease-out group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                width="11"
                height="11"
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
          </Link>
        </footer>
      </div>
    </main>
  );
}