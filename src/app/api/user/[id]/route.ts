import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import Post from '@/models/Post';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

        if (user.role === 'offL1' || user.role === 'offL2') {
            return NextResponse.json(
                { message: 'Officer accounts cannot be deleted' },
                { status: 403 }
            );
        }

        // Can only delete your own account
        if (user._id.toString() !== params.id) {
            return NextResponse.json(
                { message: 'You can only delete your own account' },
                { status: 403 }
            );
        }

        await User.findByIdAndDelete(params.id);

        return NextResponse.json(
            { message: 'Account deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: 'Server error', error: String(error) },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();


        const { id } = await params;

        const user = await User.findById(id).select('-password').lean();

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Fetch all posts authored by this user
        const userPosts = await Post.find({ authorId: id }).sort({ createdAt: -1 }).lean();


        const userProfile = {
            ...user,
            posts: userPosts
        };

        return NextResponse.json({ user: userProfile }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Server error', error: String(error) }, { status: 500 });
    }
}
