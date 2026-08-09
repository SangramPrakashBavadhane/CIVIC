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
        if (!user) {
            console.log('Vote error: User not found for email', session.user.email);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        console.log('Vote info: Checking post with ID', id);
        const post = await Post.findById(id);
        if (!post) {
            console.log('Vote error: Post not found in DB for id', id);
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }
        const userId = user._id;
        let agreedBy = (post.agreedBy || []).filter((uId: any) => uId.toString() !== userId.toString());
        let disagreedBy = (post.disagreedBy || []).filter((uId: any) => uId.toString() !== userId.toString());
        const hasAlreadyAgreed = (post.agreedBy || []).some((uId: any) => uId.toString() === userId.toString());
        const hasAlreadyDisagreed = (post.disagreedBy || []).some((uId: any) => uId.toString() === userId.toString());
        if (type === 'agree' && !hasAlreadyAgreed) {
            agreedBy.push(userId);
        }
        else if (type === 'disagree' && !hasAlreadyDisagreed) {
            disagreedBy.push(userId);
        }
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