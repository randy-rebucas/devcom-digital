import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email-not-verified";
}

// Dedupes the session-validity lookup across the multiple auth() calls
// (navbar, layouts, pages) that happen within a single request render.
const getSessionUser = cache((id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: { currentSessionId: true },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        if (!user.emailVerified) throw new EmailNotVerifiedError();

        const sessionId = crypto.randomUUID();
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

        await prisma.user.update({
          where: { id: user.id },
          data: { currentSessionId: sessionId, lastLoginAt: new Date(), lastLoginIp: ip },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sessionId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.sessionId = (user as { sessionId?: string }).sessionId;
        return token;
      }

      const dbUser = await getSessionUser(token.id as string);
      if (!dbUser || dbUser.currentSessionId !== token.sessionId) {
        return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "MEMBER";
      }
      return session;
    },
  },
});
