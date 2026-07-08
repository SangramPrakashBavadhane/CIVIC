import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/mongoose';
import Post from '@/models/Post';
import User from '@/models/User';


export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

        if (user.role === 'user') {
            return NextResponse.json(
                { message: 'Only officers can change post status' },
                { status: 403 }
            );
        }

        const post = await Post.findById(params.id);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // 2️⃣ offL1 can only update posts from their own area
        if (user.role === 'offL1' && post.area !== user.location.area) {
            return NextResponse.json(
                { message: 'You can only update posts from your area' },
                { status: 403 }
            );
        }
        // 3️⃣ offL2 can only update posts from their own state
        if (user.role === 'offL2' && post.state !== user.location.state) {
            return NextResponse.json(
                { message: 'You can only update posts from your state' },
                { status: 403 }
            );
        }

        //as teh itehr 4 options will be offl1 and same area , offL2 and same state will have same thing
        const { status } = await req.json();

        const validStatuses = ['NotSeen', 'TakenIntoConsideration', 'Declined', 'WorkStarted'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
        }

        post.status = status;
        await post.save();

        await User.updateOne(
            { _id: user._id },
            {
                $push: {
                    statusActionHistory: {
                        postId: post._id,
                        status,
                        changedAt: new Date(),
                    },
                },
            }
        );

        return NextResponse.json(
            { message: 'Status updated successfully' },
            { status: 200 }
        );


    } catch (error) {
        return NextResponse.json(
            { message: 'Server error', error: String(error) },
            { status: 500 }
        );

    }
}