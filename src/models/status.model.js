import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        default: ''
    },
    viewers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
}, { timestamps: true });

statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Status', statusSchema);
