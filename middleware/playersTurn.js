module.exports = async function (req, res, next) {
    if (!req.game.started) {
        return res.status(400).send('Game not started.');
    }

    if (req.game.players[req.game.playerTurn].id !== req.player.id) {
        return res.status(400).send('Not your turn.');
    }

    next();
}