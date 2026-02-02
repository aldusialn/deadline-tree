import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import pool from "@/lib/postgres"

export const authOptions : NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if(!credentials?.username || !credentials?.password) {
                    return null
                }

                const result = await pool.query(
                    'SELECT * FROM users WHERE username = $1'
                )

                const user = result.rows[0]

                if(!user) {
                    return null // user does not exist
                }

                const isValid = await bcrypt.compare(credentials.password, user.password_hash)

                if(!isValid) {
                    return null
                }

                return {
                    id: user.id,
                    name: user.username,
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string
            }
            return session
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }