import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email) return null;
        const email = credentials.email as string;

        // Find or create user by email
        let user = await prisma.teacher.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.teacher.create({
            data: {
              email,
              name: email.split("@")[0],
              onboarded: false,
            },
          });
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: "/picklenickai",
  },
});

export { prisma };
