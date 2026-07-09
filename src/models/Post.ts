import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });

const postSchema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Media Fields
    mediaUrl: { type: String, default: null },
    mediaType: { type: String, enum: ['image', 'video', 'none'], default: 'none' },

    postedIn: {
        type: String,
        enum: ['area', 'state'],
        required: true,
    },

    area: { type: String, required: true },
    state: { type: String, required: true },

    agrees: { type: Number, default: 0 },
    disagrees: { type: Number, default: 0 },
    agreedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    disagreedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    views: { type: Number, default: 0 },
    comments: [{
        text: { type: String, required: true },
        authorName: { type: String, required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],

    // Status — only officers can change this
    status: {
        type: String,
        enum: ['NotSeen', 'TakenIntoConsideration', 'Declined', 'WorkStarted'],
        default: 'NotSeen',
    },
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
