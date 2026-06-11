import Call from '../../models/call.model.js';

export const getCallHistoryService = async (userId) => {
    return await Call.find({
        $or: [{ caller: userId }, { receiver: userId }]
    })
    .populate('caller', 'name email avatar')
    .populate('receiver', 'name email avatar')
    .sort({ createdAt: -1 });
};

export const getIceServersService = async () => {
    const stunServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
    ];

    const turnServer = process.env.TURN_SERVER_URL;
    const turnUsername = process.env.TURN_SERVER_USERNAME;
    const turnCredential = process.env.TURN_SERVER_CREDENTIAL;

    const iceServers = [...stunServers];
    if (turnServer && turnUsername && turnCredential) {
        iceServers.push({
            urls: turnServer,
            username: turnUsername,
            credential: turnCredential
        });
    }

    return iceServers;
};
