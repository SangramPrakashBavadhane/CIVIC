import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/mongoose';
import Post from '@/models/Post';
import User from '@/models/User';


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
        }
        await dbConnect();

        // Await the params object (Required in Next.js 15+)
        const { id } = await params;

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

        // Create the comment matching the new Schema (authorName is required!)
        const newComment = {
            text: text.trim(),
            authorName: user.name,
            authorId: user._id,
            createdAt: new Date()
        };

        const post = await Post.findByIdAndUpdate(
            id,
            { $push: { comments: newComment } },
            { new: true }
        );

        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Comment added', comment: newComment }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: 'Server error', error: String(error) }, { status: 500 });
    }
}
