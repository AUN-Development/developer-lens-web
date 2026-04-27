import type { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
		user: DefaultSession["user"] & {
			login?: string;
			avatarUrl?: string;
		};
	}

	interface User {
		login?: string;
		avatarUrl?: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string;
		login?: string;
		avatarUrl?: string;
		displayName?: string;
	}
}
