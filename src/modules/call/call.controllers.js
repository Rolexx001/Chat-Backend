import { getCallHistoryService, getIceServersService } from './call.services.js';

export const getCallHistory = async (req, res, next) => {
    try {
        const history = await getCallHistoryService(req.userId);
        res.status(200).json({ success: true, history });
    } catch (error) {
        next(error);
    }
};

export const getIceServers = async (req, res, next) => {
    try {
        const iceServers = await getIceServersService();
        res.status(200).json({ success: true, iceServers });
    } catch (error) {
        next(error);
    }
};
