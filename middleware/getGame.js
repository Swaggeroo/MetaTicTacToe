const authDebug = require('debug')('app:auth');
const {default: mongoose} = require("mongoose");

//Models
const {Game} = require('../models/game');

module.exports = async function (req, res, next) {
    const gameCode = req.header('gameCode');
    const playerCode = req.header('playerCode');

    if (!gameCode) {
        authDebug("401 - No gameCode provided");
        return res.status(401).send('Access denied. No gameCode provided.');
    }

    if (!playerCode) {
        authDebug("401 - No playerCode provided");
        return res.status(401).send('Access denied. No playerCode provided.');
    }

    let filter = {code: gameCode, players: {$elemMatch: {id: new mongoose.Types.ObjectId(playerCode)}}};
    let game = await Game.findOne(filter);

    if (!game) {
        authDebug("401 - Game not found");
        return res.status(401).send('Access denied. Game not found.');
    }

    req.game = game;
    req.player = game.players.find(player => player.id.toString() === playerCode);
    next();
}