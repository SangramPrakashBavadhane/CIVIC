import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            // 1️⃣ authorize() — runs on every login attempt
            async authorize(credentials) {
                await dbConnect();
                const user = await User.findOne({ email: credentials?.email });
                if (!user) return null; // user not found
                const isValid = await bcrypt.compare(
                    credentials?.password as string,
                    user.password
                );
                if (!isValid) return null; // wrong password
                // Return only what we want in the token
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    area: user.location.area,
                    state: user.location.state,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.area = (user as any).area;
                token.state = (user as any).state;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            (session.user as any).role = token.role;
            (session.user as any).area = token.area;
            (session.user as any).state = token.state;
            return session;
        },
    },

    session: { strategy: 'jwt' },
    pages: { signIn: '/login' },
});