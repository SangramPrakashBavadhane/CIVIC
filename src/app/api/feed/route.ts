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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 10;
        const skip = (page - 1) * limit;

        const posts = await Post.aggregate([
            {
                $match: {
                    postedIn: tab,
                    ...(tab === 'area' ? { area: user.location.area } : { state: user.location.state }),
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: {
                    path: '$author',
                    preserveNullAndEmptyArrays: true
                }
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
            { $skip: skip },
            { $limit: limit + 1 },
        ]);

        let hasMore = false;
        if (posts.length > limit) {
            hasMore = true;
            posts.pop();
        }

        return NextResponse.json({ posts, hasMore }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { message: 'Server error', error: String(error) },
            { status: 500 }
        );
    }
}