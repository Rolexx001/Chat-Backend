import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['voice', 'video'],
        required: true
    },
    status: {
        type: String,
        enum: ['missed', 'completed', 'rejected', 'ongoing'],
        default: 'ongoing'
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    }
}, { timestamps: true });

export default mongoose.model('Call', callSchema);
