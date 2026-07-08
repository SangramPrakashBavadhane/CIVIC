import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, role, area, state } = await req.json();

        if (!name || !email || !password || !area || !state) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        const safeRole = role === 'offL1' || role === 'offL2' ? 'user' : 'user';

        await dbConnect();

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 409 }
            );
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: safeRole,
            location: { area, state },
        });

        return NextResponse.json(
            { message: 'User created successfully!' },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: 'Server error', error: String(error) },
            { status: 500 }
        );
    }
}