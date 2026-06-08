import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: ['spam', 'abuse', 'harassment', 'inappropriate_content', 'other']
    },
    description: {
        type: String,
        default: ''
    }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
