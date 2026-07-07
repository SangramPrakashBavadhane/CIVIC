import mongoose, { Schema } from 'mongoose';

const locationSchema = new Schema({
    area: { type: String, required: true },
    state: { type: String, required: true },
}, { _id: false });

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
        type: String,
        enum: ['user', 'offL1', 'offL2'],
        default: 'user',
    },

    location: { type: locationSchema, required: true },
    watchHistory: [{ type: Schema.Types.ObjectId, ref: 'Post', default: [] }],

    areaPostHistory: [{ type: Schema.Types.ObjectId, ref: 'Post', default: [] }],
    statePostHistory: [{ type: Schema.Types.ObjectId, ref: 'Post', default: [] }],

    statusActionHistory: [{
        postId: { type: Schema.Types.ObjectId, ref: 'Post' },
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;