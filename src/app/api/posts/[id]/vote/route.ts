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
        const { id } = await params;
        const { type } = await req.json();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
        const post = await Post.findById(id);
        if (!post) return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        const userId = user._id;
        // Remove the user from both arrays first (to reset their vote)
        let agreedBy = post.agreedBy.filter((uId: any) => uId.toString() !== userId.toString());
        let disagreedBy = post.disagreedBy.filter((uId: any) => uId.toString() !== userId.toString());
        // Did they already have this exact vote?
        const hasAlreadyAgreed = post.agreedBy.some((uId: any) => uId.toString() === userId.toString());
        const hasAlreadyDisagreed = post.disagreedBy.some((uId: any) => uId.toString() === userId.toString());
        // If they click 'agree', and they HAVEN'T already agreed, add them.
        if (type === 'agree' && !hasAlreadyAgreed) {
            agreedBy.push(userId);
        }
        // If they click 'disagree', and they HAVEN'T already disagreed, add them.
        else if (type === 'disagree' && !hasAlreadyDisagreed) {
            disagreedBy.push(userId);
        }
        // Update the counts and save
        post.agreedBy = agreedBy;
        post.disagreedBy = disagreedBy;
        post.agrees = agreedBy.length;
        post.disagrees = disagreedBy.length;
        await post.save();
        return NextResponse.json({
            message: 'Vote updated',
            agrees: post.agrees,
            disagrees: post.disagrees
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server error', error: String(error) }, { status: 500 });
    }


}