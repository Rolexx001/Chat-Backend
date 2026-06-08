import {
    createStatusService,
    getStatusFeedService,
    getMyStatusesService,
    viewStatusService,
    getStatusViewersService,
    deleteStatusService
} from './status.services.js';
import { saveFile } from '../media/media.service.js';

export const createStatus = async (req, res, next) => {
    try {
        let mediaUrl = req.body.mediaUrl;
        if (req.file) {
            mediaUrl = await saveFile(req.file);
        }

        if (!mediaUrl) {
            return res.status(400).json({ success: false, message: "media is required (either as a file upload or mediaUrl)" });
        }

        const { caption } = req.body;
        const status = await createStatusService(req.userId, mediaUrl, caption);
        res.status(201).json({ success: true, status });
    } catch (error) {
        next(error);
    }
};

export const getStatusFeed = async (req, res, next) => {
    try {
        const feed = await getStatusFeedService(req.userId);
        res.status(200).json({ success: true, feed });
    } catch (error) {
        next(error);
    }
};

export const getMyStatuses = async (req, res, next) => {
    try {
        const statuses = await getMyStatusesService(req.userId);
        res.status(200).json({ success: true, statuses });
    } catch (error) {
        next(error);
    }
};

export const viewStatus = async (req, res, next) => {
    try {
        const { statusId } = req.params;
        if (!statusId) {
            return res.status(400).json({ success: false, message: "statusId is required" });
        }
        const result = await viewStatusService(req.userId, statusId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getStatusViewers = async (req, res, next) => {
    try {
        const { statusId } = req.params;
        if (!statusId) {
            return res.status(400).json({ success: false, message: "statusId is required" });
        }
        const viewers = await getStatusViewersService(req.userId, statusId);
        res.status(200).json({ success: true, viewers });
    } catch (error) {
        next(error);
    }
};

export const deleteStatus = async (req, res, next) => {
    try {
        const { statusId } = req.params;
        if (!statusId) {
            return res.status(400).json({ success: false, message: "statusId is required" });
        }
        const result = await deleteStatusService(req.userId, statusId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
