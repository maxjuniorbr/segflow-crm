import { getErrorResponse, logError } from './errorResponse.js';

export const respondWithError = (res, err, { context, defaultMessage } = {}) => {
    logError(context || 'unknown', err);
    const { status, payload } = getErrorResponse(err, { defaultMessage });
    return res.status(status).json(payload);
};
