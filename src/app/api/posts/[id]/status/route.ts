import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import Post from '@/models/Post';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
        }

        await dbConnect();

        // Await the params object (Required in Next.js 15+)
        const { id } = await params;

        const { status } = await req.json();

        // Fetch post first to check its level
        const postToUpdate = await Post.findById(id);
        if (!postToUpdate) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // Check if the user is an authorized officer for this specific post
        const user = await User.findOne({ email: session.user.email });
        const userRole = user?.role?.toLowerCase();
        
        const canEditArea = userRole === 'offl1' && postToUpdate.postedIn === 'area';
        const canEditState = userRole === 'offl2' && postToUpdate.postedIn === 'state';

        if (!user || (!canEditArea && !canEditState)) {
            return NextResponse.json({ message: 'Forbidden. You are not authorized to change the status of this post.' }, { status: 403 });
        }

        // Update the post status
        postToUpdate.status = status;
        await postToUpdate.save();

        return NextResponse.json({ message: 'Status updated successfully', post: postToUpdate }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Server error', error: String(error) }, { status: 500 });
    }
}
