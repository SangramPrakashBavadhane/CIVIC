import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import Post from '@/models/Post';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
        }
        await dbConnect();

        const user = await User.findOne({ email: session.user.email }).lean();
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const tab = searchParams.get('tab') === 'state' ? 'state' : 'area';

        const posts = await Post.aggregate([
            {
                $match: {
                    postedIn: tab,
                    ...(tab === 'area' ? { area: user.location.area } : { state: user.location.state }),
                    _id: { $nin: user.watchHistory || [] }
                },
            },
            {
                $addFields: {
                    trendingScore: {
                        $divide: [{ $subtract: ['$agrees', '$disagrees'] },
                        { $add: ['$views', 1] },
                        ],
                    },
                },
            },
            { $sort: { trendingScore: -1 } },
            { $limit: 10 },
        ]);

        if (posts.length > 0) {
            const postIds = posts.map((p) => p._id);
            await User.updateOne(
                { _id: user._id },
                { $push: { watchHistory: { $each: postIds } } }
            );
        }

        return NextResponse.json({ posts }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { message: 'Server error', error: String(error) },
            { status: 500 }
        );
    }
}