import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import Post from '@/models/Post';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
        }
        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const { title, description, postedIn } = await req.json();

        if (!title || !description || !postedIn) {
            return NextResponse.json(
                { message: 'title, description and postedIn are required' },
                { status: 400 }
            );
        }
        if (postedIn !== 'area' && postedIn !== 'state') {
            return NextResponse.json(
                { message: 'postedIn must be either "area" or "state"' },
                { status: 400 }
            );
        }

        const newPost = await Post.create({
            authorId: user._id,
            title,
            description,
            postedIn,
            area: user.location.area,
            state: user.location.state,
        });

        if (postedIn === 'area') {
            await User.updateOne(
                { _id: user._id },
                { $push: { areaPostHistory: newPost._id } }
            );
        } else {
            await User.updateOne(
                { _id: user._id },
                { $push: { statePostHistory: newPost._id } }
            );
        }

        return NextResponse.json(
            { message: 'Post created successfully', post: newPost },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: 'Server error', error: String(error) },
            { status: 500 }
        );
    }
}