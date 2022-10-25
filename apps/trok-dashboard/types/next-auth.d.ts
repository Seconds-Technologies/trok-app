import NextAuth, { DefaultSession } from 'next-auth';

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		id: string;
		stripeId: string;
		user: {
			/** The user's postal address. */
			name: string;
			email: string
		} & DefaultSession["user"]
	}
}