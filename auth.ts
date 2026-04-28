import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const githubClientId =
	process.env.GITHUB_ID!
const githubClientSecret =
	process.env.GITHUB_SECRET!

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		GitHub({
			clientId: githubClientId,
			clientSecret: githubClientSecret,
			authorization: {
				params: {
					scope: "read:user user:email repo",
				},
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	trustHost: true,
	callbacks: {
		async jwt({ token, account, profile, user }) {
			if (account?.provider === "github") {
				const accessToken = account.access_token;
				const githubProfile = profile as {
					login?: string;
					avatar_url?: string;
					name?: string;
				} | null;

				let fetchedProfile:
					| {
							login?: string;
							name?: string;
							avatar_url?: string;
					}
					| undefined;

				if (accessToken) {
					try {
						const response = await fetch("https://api.github.com/user", {
							headers: {
								Authorization: `Bearer ${accessToken}`,
								Accept: "application/vnd.github+json",
								"X-GitHub-Api-Version": "2022-11-28",
							},
						});

						if (response.ok) {
							fetchedProfile = (await response.json()) as {
								login?: string;
								name?: string;
								avatar_url?: string;
							};
						}
					} catch {
					}
				}

				token.accessToken = accessToken;
				token.login =
					fetchedProfile?.login ??
					githubProfile?.login ??
					token.login ??
					undefined;
				token.avatarUrl =
					fetchedProfile?.avatar_url ??
					githubProfile?.avatar_url ??
					token.avatarUrl ??
					user?.image ??
					undefined;
				token.displayName =
					fetchedProfile?.name ??
					githubProfile?.name ??
					token.displayName ??
					user?.name ??
					undefined;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.login = token.login as string | undefined;
				session.user.avatarUrl = token.avatarUrl as string | undefined;
				session.user.image =
					(token.avatarUrl as string | undefined) ?? session.user.image;
				session.user.name =
					(token.displayName as string | undefined) ?? session.user.name;
			}

			session.accessToken = token.accessToken as string | undefined;
			return session;
		},
	},
});
