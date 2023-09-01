module.exports = async function (req, res, next) {
    req.game.lastUpdated = Date.now();
    await req.game.save();

    next();
}