import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/postgres'

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json()

        // validation
        if(!username || !password) {
            return NextResponse.json(
                { error: 'Username and password required' },
                { status: 400 }
            )
        }

        if (username.length < 4) {
            return NextResponse.json(
                { error: 'Username must be at least 3 characters' },
                { status: 400 }
            )
        }

        if (password.length < 6) { 
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        const existing = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        )

        if (existing.rows.length > 0) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            )
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const result = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
            [username, passwordHash]
        )

        const user = result.rows[0]

        return NextResponse.json({
            id: user.id,
            username: user.username,
            createdAt: user.created_at
        })
    } catch (error) {
        console.error('Sign up error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}