const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise
        .resolve(requestHandler(req, res, next))
        .catch(err => {
            res.status(err.statusCode || 500).json({
                success: false,
                statusCode: err.statusCode,
                message: err.message,
                errors: err.errors
            });
            next(err);
        })
}

export { asyncHandler }
