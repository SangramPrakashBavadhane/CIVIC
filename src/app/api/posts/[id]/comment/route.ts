import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/mongoose';
import Post from '@/models/Post';
import User from '@/models/User';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

        const { text } = await req.json();

        if (!text || text.trim() === '') {
            return NextResponse.json(
                { message: 'Comment text is required' },
                { status: 400 }
            );
        }

        const post = await Post.findById(params.id);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        post.comments.push({
            userId: user._id,
            text: text.trim(),
            createdAt: new Date(),
        });

        await post.save();

        return NextResponse.json(
            { message: 'Comment added!', comments: post.comments },
            { status: 201 }
        );





    }
    catch (error) {
        return NextResponse.json(
            { message: 'Server error', error: String(error) },
            { status: 500 }
        );
    }
}