import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getGitHubActivity } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const year = Number(searchParams.get("year") ?? new Date().getFullYear());

	const snapshot = await getGitHubActivity({
		year,
		login: session.user.login ?? session.user.name ?? "developer",
		name: session.user.name,
		avatarUrl: session.user.avatarUrl ?? session.user.image,
		accessToken: session.accessToken,
	});

	return NextResponse.json(snapshot, {
		headers: {
			"Cache-Control": "private, max-age=300, stale-while-revalidate=600",
		},
	});
}
