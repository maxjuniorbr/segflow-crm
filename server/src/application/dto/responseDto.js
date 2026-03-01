export const buildMessageResponse = (message, data = {}) => ({
    message,
    ...data
});
