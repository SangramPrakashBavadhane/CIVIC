import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/mongoose';
import Post from '@/models/Post';
import User from '@/models/User';
// GET /api/posts/[id] — fetch a s

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const post = await Post.findById(params.id).lean();
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }


        return NextResponse.json({ post }, { status: 200 });
    }
    catch (error) {
        return NextResponse.json(
            { message: 'Server error', error: String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
        }
        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        const post = await Post.findById(params.id);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        if (post.authorId.toString() !== user._id.toString()) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
        }

        await Post.findByIdAndDelete(params.id);

        await User.updateOne(
            { _id: user._id },
            {
                $pull: {
                    areaPostHistory: post._id,
                    statePostHistory: post._id,
                },
            }
        );

        return NextResponse.json(
            { message: 'Post deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Server error', error: String(error) },
            { status: 500 }
        );
    }
}