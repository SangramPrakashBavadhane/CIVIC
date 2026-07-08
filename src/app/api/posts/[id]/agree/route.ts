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

        const post = await Post.findById(params.id);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // Already agreed — do nothing
        if (post.agreedBy.includes(user._id)) {
            return NextResponse.json(
                { message: 'You have already agreed on this post' },
                { status: 409 }
            );
        }

        // Switching vote: was disagreed → remove disagree first
        if (post.disagreedBy.includes(user._id)) {
            post.disagreedBy.pull(user._id);
            post.disagrees -= 1;
        }

        post.agreedBy.push(user._id);
        post.agrees += 1;
        await post.save();

        return NextResponse.json(
            { message: 'Agreed!', agrees: post.agrees },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: 'Server error', error: String(error) },
            { status: 500 }
        );
    }
}