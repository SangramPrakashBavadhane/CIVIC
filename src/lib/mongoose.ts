import mongoose from 'mongoose';

const cached = (global as any).mongoose || { conn: null, promise: null };
(global as any).mongoose = cached;

export async function dbConnect() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const uri = process.env.MONGODB_URI!;
        if (!uri) throw new Error('MONGODB_URI is not defined in .env.local');
        cached.promise = mongoose.connect(uri).then((m) => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;

}