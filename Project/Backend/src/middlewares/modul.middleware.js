
function validateModule(req, res, next) {
    const { title, code, desc } = req.body || {};

    if (typeof title !== 'string' || !title.trim()
        || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({
            error: 'title and code are required',
        });
    }

    if (desc !== undefined && desc !== null && typeof desc !== 'string') {
        return res.status(400).json({
            error: 'desc must be a string',
        });
    }

    next();
}

module.exports = { validateModule };
