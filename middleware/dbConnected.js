module.exports = async function (req, res, next) {
    if (!global.connected) {
        debugRoute("500 - DB not connected");
        return res.status(500).send("Database not connected");
    }
    next();
}