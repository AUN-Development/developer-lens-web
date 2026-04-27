import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CompactHeatmapPanel } from "@/components/CompactHeatmapPanel";
import { getGitHubActivity } from "@/lib/github";

export const dynamic = "force-dynamic";

type UsernamePageProps = {
  params: Promise<{ username?: string }>;
};

export async function generateMetadata({
  params,
}: UsernamePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const username = resolvedParams?.username ?? "developer";
  const year = new Date().getFullYear();

  return {
    title: `${username} | Development Lens`,
    description: `Track ${username}'s GitHub activity in ${year}. View commits, pull requests, and development patterns on Development Lens.`,
    openGraph: {
      title: `${username} | Development Lens`,
      description: `GitHub activity insights for ${username} in ${year}.`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${username} | Development Lens`,
      description: `GitHub activity insights for ${username} in ${year}.`,
    },
  };
}

export default async function UsernamePage({
  params,
}: UsernamePageProps) {
  const resolvedParams = await params;
  const username = resolvedParams?.username;

  if (!username) {
    redirect("/");
  }

  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const login =
    session.user.login ?? session.user.name ?? "developer";

  if (username.toLowerCase() !== login.toLowerCase()) {
    redirect(`/${login}`);
  }

  const snapshot = await getGitHubActivity({
    year: new Date().getFullYear(),
    login,
    name: session.user.name,
    avatarUrl: session.user.avatarUrl ?? session.user.image,
    accessToken: session.accessToken,
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6">
      <CompactHeatmapPanel snapshot={snapshot} />
    </main>
  );
}