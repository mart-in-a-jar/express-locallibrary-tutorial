exports.error = (code, message, next) => {
    const err = new Error(message);
    err.status = code;
    return next(err);
};
