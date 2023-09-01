const mongoose = require('mongoose').default;
const crypto = require('crypto');

const gameSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        minlength: 16,
        maxlength: 16,
        unique: true
    },
    players: {
        type: Array,
        required: true,
        default: []
    },
    won: {
        type: Number,
        required: true,
        default: 0
    },
    started: {
        type: Boolean,
        required: true,
        default: false
    },
    lastAction: {
        type: Date,
        required: true,
        default: Date.now
    },
    playerTurn: {
        type: Number,
        required: true,
        default: -1
    },
    board: {
        type: Array,
        required: true,
        default: [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]]
    },
    bigBoard: {
        type: Array,
        required: true,
        default: [0,0,0,0,0,0,0,0,0]
    },
    nextBoard: {
        type: Number,
        required: true,
        default: -1
    }
});

const Game = mongoose.model('Game', gameSchema);

function generateGameCode() {
    return crypto.randomBytes(8).toString('hex');
}

function createNewGame() {
    return new Game({
        code: generateGameCode()
    });
}

exports.Game = Game;
exports.createNewGame = createNewGame;