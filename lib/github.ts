import { unstable_cache } from "next/cache";

export type ActivityFilter = "both" | "commits" | "pull-requests";

export type ActivityItem = {
	kind: "commit" | "pull-request";
	repo: string;
	title: string;
	date: string;
	url: string;
	state?: "open" | "closed" | "merged";
	message?: string;
};

export type ActivityDay = {
	date: string;
	commits: number;
	pullRequests: number;
	items: ActivityItem[];
	active: boolean;
	monthIndex: number;
	weekIndex: number;
	dayIndex: number;
};

export type ActivityStats = {
	totalCommits: number;
	totalPullRequests: number;
	activeDays: number;
	currentStreak: number;
	longestStreak: number;
	mostActiveMonth: string;
	mostActiveRepository: string;
	pullRequestStateCounts: {
		open: number;
		merged: number;
	};
	yearDelta?: number;
};

export type GithubProfile = {
	login: string;
	name: string;
	avatarUrl: string;
};

export type GitHubActivitySnapshot = {
	year: number;
	profile: GithubProfile;
	days: ActivityDay[];
	stats: ActivityStats;
};

type LoaderInput = {
	login?: string;
	name?: string | null;
	avatarUrl?: string | null;
	accessToken?: string;
	year: number;
};

const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

function getYearRange(year: number) {
	const start = new Date(Date.UTC(year, 0, 1));
	const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
	return {
		start: start.toISOString().slice(0, 10),
		end: end.toISOString().slice(0, 10),
	};
}

function toDateKey(dateValue: string | Date) {
	const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
	return date.toISOString().slice(0, 10);
}

function capitalizeWords(value: string) {
	return (
		value
			.split("/")
			.pop()
			?.replace(/[-_]+/g, " ")
			.replace(/\b\w/g, (character) => character.toUpperCase()) ?? value
	);
}

function createCalendarDays(year: number) {
	const start = new Date(Date.UTC(year, 0, 1));
	const end = new Date(Date.UTC(year, 11, 31));
	const offset = start.getUTCDay();
	const days: ActivityDay[] = [];

	for (let index = 0; index < offset; index += 1) {
		days.push({
			date: "",
			commits: 0,
			pullRequests: 0,
			items: [],
			active: false,
			monthIndex: 0,
			weekIndex: Math.floor(index / 7),
			dayIndex: index % 7,
		});
	}

	for (
		let cursor = new Date(start);
		cursor <= end;
		cursor.setUTCDate(cursor.getUTCDate() + 1)
	) {
		const dayIndex = cursor.getUTCDay();
		const index = days.length;

		days.push({
			date: cursor.toISOString().slice(0, 10),
			commits: 0,
			pullRequests: 0,
			items: [],
			active: false,
			monthIndex: cursor.getUTCMonth(),
			weekIndex: Math.floor(index / 7),
			dayIndex,
		});
	}

	return days;
}

function calculateStreak(days: ActivityDay[]) {
	let longest = 0;
	let current = 0;

	for (const day of days) {
		if (day.active) {
			current += 1;
			longest = Math.max(longest, current);
		} else {
			current = 0;
		}
	}

	let trailing = 0;
	for (let index = days.length - 1; index >= 0; index -= 1) {
		if (!days[index]?.active) {
			break;
		}
		trailing += 1;
	}

	return { longest, current: trailing };
}

function buildSnapshot(
	year: number,
	profile: GithubProfile,
	commits: ActivityItem[],
	pullRequests: ActivityItem[],
	previousYearTotals?: { commits: number; pullRequests: number },
): GitHubActivitySnapshot {
	const days = createCalendarDays(year);
	const dayMap = new Map(
		days.filter((day) => day.date).map((day) => [day.date, day]),
	);
	const repoCounts = new Map<string, number>();

	for (const item of [...commits, ...pullRequests]) {
		const day = dayMap.get(item.date);

		if (!day) {
			continue;
		}

		day.items.push(item);
		day.active = true;

		if (item.kind === "commit") {
			day.commits += 1;
		} else {
			day.pullRequests += 1;
		}

		repoCounts.set(item.repo, (repoCounts.get(item.repo) ?? 0) + 1);
	}

	const activeDays = days.filter((day) => day.active && day.date).length;
	const monthCounts = new Map<number, number>();
	let totalCommits = 0;
	let totalPullRequests = 0;
	let bestRepository = "-";
	let bestRepositoryCount = 0;

	for (const day of days) {
		if (!day.date) {
			continue;
		}

		totalCommits += day.commits;
		totalPullRequests += day.pullRequests;
		monthCounts.set(
			day.monthIndex,
			(monthCounts.get(day.monthIndex) ?? 0) + day.commits + day.pullRequests,
		);
	}

	for (const [repo, count] of repoCounts.entries()) {
		if (count > bestRepositoryCount) {
			bestRepository = repo;
			bestRepositoryCount = count;
		}
	}

	const mostActiveMonthIndex =
		[...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
	const streak = calculateStreak(days.filter((day) => day.date));
	const pullRequestStateCounts = pullRequests.reduce(
		(accumulator, item) => {
			if (item.state === "merged") {
				accumulator.merged += 1;
			} else {
				accumulator.open += 1;
			}

			return accumulator;
		},
		{ open: 0, merged: 0 },
	);

	return {
		year,
		profile,
		days,
		stats: {
			totalCommits,
			totalPullRequests,
			activeDays,
			currentStreak: streak.current,
			longestStreak: streak.longest,
			mostActiveMonth: monthFormatter.format(
				new Date(Date.UTC(year, mostActiveMonthIndex, 1)),
			),
			mostActiveRepository: bestRepository,
			pullRequestStateCounts,
			yearDelta:
				previousYearTotals &&
				previousYearTotals.commits + previousYearTotals.pullRequests > 0
					? Math.round(
							((totalCommits +
								totalPullRequests -
								(previousYearTotals.commits +
									previousYearTotals.pullRequests)) /
								(previousYearTotals.commits +
									previousYearTotals.pullRequests)) *
								100,
						)
					: undefined,
		},
	};
}

async function fetchCommitEvents(login: string, token: string, year: number) {
	const { start, end } = getYearRange(year);
	const commits: ActivityItem[] = [];
	const seen = new Set<string>();

	for (let page = 1; page <= 10; page += 1) {
		const response = await fetch(
			`https://api.github.com/search/commits?q=${encodeURIComponent(`author:${login} author-date:${start}..${end}`)}&sort=author-date&order=desc&per_page=100&page=${page}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
				},
				next: { revalidate: 900 },
			},
		);

		if (!response.ok) {
			break;
		}

		const payload = (await response.json()) as {
			items?: Array<{
				html_url?: string;
				commit?: {
					message?: string;
					committer?: { date?: string };
				};
				repository?: { full_name?: string };
			}>;
		};

		const items = payload.items ?? [];

		for (const item of items) {
			const url = item.html_url;
			const message = item.commit?.message?.split("\n")[0] ?? "Commit";
			const date = item.commit?.committer?.date;
			const repo = item.repository?.full_name ?? "unknown/repository";

			if (!url || !date || seen.has(url)) {
				continue;
			}

			seen.add(url);
			commits.push({
				kind: "commit",
				repo: capitalizeWords(repo),
				title: message,
				message,
				date: toDateKey(date),
				url,
			});
		}

		if (items.length < 100) {
			break;
		}
	}

	return commits;
}

async function fetchViewerProfile(token: string) {
	try {
		const response = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
			next: { revalidate: 900 },
		});

		if (!response.ok) {
			return null;
		}

		return (await response.json()) as {
			login?: string;
			name?: string;
			avatar_url?: string;
		};
	} catch {
		return null;
	}
}

async function fetchPullRequestEvents(
	login: string,
	token: string,
	year: number,
) {
	const { start, end } = getYearRange(year);
	const pullRequests: ActivityItem[] = [];
	const seen = new Map<string, ActivityItem>();

	for (const query of [
		`author:${login} created:${start}..${end} type:pr`,
		`author:${login} merged:${start}..${end} type:pr`,
	]) {
		let cursor: string | null = null;

		for (let page = 0; page < 10; page += 1) {
			const response = await fetch("https://api.github.com/graphql", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
					"X-GitHub-Api-Version": "2022-11-28",
				},
				body: JSON.stringify({
					query: `
            query ActivitySearch($query: String!, $cursor: String) {
              search(query: $query, type: ISSUE, first: 100, after: $cursor) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  ... on PullRequest {
                    title
                    url
                    createdAt
                    mergedAt
                    state
                    repository {
                      nameWithOwner
                    }
                  }
                }
              }
            }
          `,
					variables: { query, cursor },
				}),
				next: { revalidate: 900 },
			});

			if (!response.ok) {
				break;
			}

			const payload = (await response.json()) as {
				data?: {
					search?: {
						pageInfo?: {
							hasNextPage?: boolean;
							endCursor?: string | null;
						};
						nodes?: Array<{
							title?: string;
							url?: string;
							createdAt?: string;
							mergedAt?: string | null;
							state?: string;
							repository?: { nameWithOwner?: string };
						}>;
					};
				};
			};

			const nodes = payload.data?.search?.nodes ?? [];

			for (const node of nodes) {
				const url = node.url;
				const createdAt = node.createdAt;
				const mergedAt = node.mergedAt;
				const eventDate =
					mergedAt && mergedAt.startsWith(String(year)) ? mergedAt : createdAt;

				if (!url || !eventDate) {
					continue;
				}

				const item: ActivityItem = {
					kind: "pull-request",
					repo: capitalizeWords(
						node.repository?.nameWithOwner ?? "unknown/repository",
					),
					title: node.title ?? "Pull request",
					date: toDateKey(eventDate),
					url,
					state:
						node.state === "MERGED"
							? "merged"
							: node.state === "OPEN"
								? "open"
								: "closed",
				};

				const existing = seen.get(url);
				if (
					!existing ||
					(item.state === "merged" && existing.state !== "merged")
				) {
					seen.set(url, item);
				}
			}

			cursor = payload.data?.search?.pageInfo?.endCursor ?? null;
			if (!payload.data?.search?.pageInfo?.hasNextPage || !cursor) {
				break;
			}
		}
	}

	pullRequests.push(...seen.values());
	return pullRequests;
}

function createDemoActivity(year: number, login = "developer") {
	const profile: GithubProfile = {
		login,
		name: login,
		avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(login)}`,
	};

	const days = createCalendarDays(year);
	const items: ActivityItem[] = [];

	days.forEach((day, index) => {
		if (!day.date) {
			return;
		}

		const commits = index % 7 === 0 || index % 9 === 0 ? (index % 3) + 1 : 0;
		const prs = index % 11 === 0 ? 1 : 0;

		for (let commitIndex = 0; commitIndex < commits; commitIndex += 1) {
			items.push({
				kind: "commit",
				repo: commitIndex % 2 === 0 ? "Design System" : "Automation",
				title: `Ship iteration ${commitIndex + 1}`,
				message: `Ship iteration ${commitIndex + 1}`,
				date: day.date,
				url: `https://example.com/commit/${day.date}-${commitIndex}`,
			});
		}

		for (let prIndex = 0; prIndex < prs; prIndex += 1) {
			items.push({
				kind: "pull-request",
				repo: "Design System",
				title: `Polish export modal ${prIndex + 1}`,
				date: day.date,
				url: `https://example.com/pr/${day.date}-${prIndex}`,
				state: prIndex % 2 === 0 ? "merged" : "open",
			});
		}
	});

	return buildSnapshot(
		year,
		profile,
		items.filter((item) => item.kind === "commit"),
		items.filter((item) => item.kind === "pull-request"),
	);
}

const loadActivity = async (input: LoaderInput) => {
	let login = input.login?.trim();
	let resolvedName = input.name?.trim() || login;
	let resolvedAvatarUrl = input.avatarUrl ?? undefined;

	if (input.accessToken) {
		const viewerProfile = await fetchViewerProfile(input.accessToken);

		login = viewerProfile?.login?.trim() || login;
		resolvedName = viewerProfile?.name?.trim() || resolvedName || login;
		resolvedAvatarUrl =
			resolvedAvatarUrl ?? viewerProfile?.avatar_url ?? undefined;
	}

	if (!input.accessToken || !login) {
		return createDemoActivity(input.year, login ?? "developer");
	}

	const [commits, pullRequests, previousYearActivity] = await Promise.all([
		fetchCommitEvents(login, input.accessToken, input.year),
		fetchPullRequestEvents(login, input.accessToken, input.year),
		input.year > 2000
			? Promise.all([
					fetchCommitEvents(login, input.accessToken, input.year - 1),
					fetchPullRequestEvents(login, input.accessToken, input.year - 1),
				])
			: Promise.resolve([[], []] as const),
	]);

	const profile: GithubProfile = {
		login,
		name: resolvedName || login,
		avatarUrl:
			resolvedAvatarUrl ??
			`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(login)}`,
	};

	const previousTotals =
		previousYearActivity.length === 2
			? {
					commits: previousYearActivity[0].length,
					pullRequests: previousYearActivity[1].length,
				}
			: undefined;

	return buildSnapshot(
		input.year,
		profile,
		commits,
		pullRequests,
		previousTotals,
	);
};

export const getGitHubActivity = unstable_cache(
	loadActivity,
	["github-activity"],
	{
		revalidate: 900,
		tags: ["github-activity"],
	},
);

export function formatActivityCaption(snapshot: GitHubActivitySnapshot) {
	return [
		`My ${snapshot.year} GitHub Activity`,
		`${snapshot.stats.totalCommits} commits`,
		`${snapshot.stats.totalPullRequests} pull requests`,
		`Most active month: ${snapshot.stats.mostActiveMonth}`,
		`Most active repo: ${snapshot.stats.mostActiveRepository}`,
		`#GitHub #DeveloperLog #BuildInPublic`,
	].join("\n");
}
