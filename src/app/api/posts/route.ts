import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import Post from '@/models/Post';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
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

        const formData = await req.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const postedIn = formData.get('postedIn') as string;
        const file = formData.get('media') as File | null;

        if (!title || !description || !postedIn) {
            return NextResponse.json(
                { message: 'title, description and postedIn are required' },
                { status: 400 }
            );
        }
        
        let mediaUrl = null;
        let mediaType = 'none';

        if (!file) {
            return NextResponse.json({ message: 'Error: No file was received by the server. Did you select one?' }, { status: 400 });
        }

        if (typeof (file as any).arrayBuffer !== 'function') {
            return NextResponse.json({ message: `Error: File object is invalid. Received: ${typeof file}` }, { status: 400 });
        }

        const bytes = await (file as any).arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "auto", folder: "civic" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });
        
        mediaUrl = (uploadResult as any).secure_url;
        const resourceType = (uploadResult as any).resource_type;
        if (resourceType === 'video') mediaType = 'video';
        else mediaType = 'image';

        const newPost = await Post.create({
            authorId: user._id,
            title,
            description,
            postedIn,
            mediaUrl,
            mediaType,
            area: user.location.area,
            state: user.location.state,
        });

        if (postedIn === 'area') {
            await User.updateOne({ _id: user._id }, { $push: { areaPostHistory: newPost._id } });
        } else {
            await User.updateOne({ _id: user._id }, { $push: { statePostHistory: newPost._id } });
        }

        return NextResponse.json(
            { message: 'Post created successfully', post: newPost },
            { status: 201 }
        );

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { message: 'Server error', error: String(error) },
            { status: 500 }
        );
    }
}