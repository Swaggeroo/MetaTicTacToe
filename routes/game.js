const express = require('express');
const router = express.Router();
const debugRoute = require('debug')('app:route');
const _ = require('lodash');
const {default: mongoose} = require("mongoose");
const Joi = require("joi");
const rateLimit = require('express-rate-limit');
//Models
const {Game, createNewGame} = require('../models/game');
//Middleware
//TODO: Find game middleware
const dbConnected = require('../middleware/dbConnected');
const getGame = require('../middleware/getGame');
const playersTurn = require('../middleware/playersTurn');
const updateTimeStamp = require('../middleware/updateTimeStamp');

// Define a rate limiting middleware
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes in milliseconds
    max: 3, // Max requests per hour
    message: 'Too many requests from this IP, please try again later.',
});

router.get('/create', limiter, dbConnected, async (req, res) => {
    let game = createNewGame();
    await game.save();

    debugRoute("GET /api/game/create - 200 - Game created");

    res.send(_.pick(game, ['code']));
});

router.post('/join/:code', dbConnected, async (req, res) => {
    if (!req.header('playerName')) {
        debugRoute("GET /api/game/join/:code - 400 - No playerName provided");
        return res.status(400).send('No playerName provided.');
    }

    let error = Joi.string().min(3).max(30).alphanum().validate(req.header('playerName')).error;
    if (error) {
        debugRoute("GET /api/game/join/:code - 400 - Invalid playerName");
        return res.status(400).send('Invalid playerName.');
    }

    let game = await Game.findOne({code: req.params.code});
    if (!game) {
        debugRoute("GET /api/game/join/:code - 404 - Game not found");
        return res.status(404).send('Game not found.');
    }

    if (game.started) {
        debugRoute("GET /api/game/join/:code - 400 - Game already started");
        return res.status(400).send('Game already started.');
    }

    if (game.players.length >= 2) {
        debugRoute("GET /api/game/join/:code - 400 - Game full");
        return res.status(400).send('Game full.');
    }

    game.players.push({
        id: new mongoose.Types.ObjectId(),
        name: req.header('playerName'),
        number: game.players.length
    });

    if (game.players.length === 2) {
        game.started = true;
        game.playerTurn = 1;
    }

    await game.save();

    debugRoute("GET /api/game/join/:code - 200 - Game joined");

    res.send(_.concat(_.pick(game, ['code', 'started', 'playerTurn', 'board', 'bigBoard', 'won']), game.players[game.players.length - 1]));
});

router.get('/state', dbConnected, getGame, async (req, res) => {
    //debugRoute("GET /api/game/state/:code - 200 - Game state");

    res.send(_.pick(req.game, ['code', 'started', 'playerTurn', 'board', 'bigBoard', 'won', 'nextBoard']));
});

function boardWon(boardElement) {
    let board = boardElement;
    if (board[0] === board[1] && board[1] === board[2] && board[0] !== 0) {
        /*
        | * | * | * |
        |   |   |   |
        |   |   |   |
         */
        return board[0];
    }
    if (board[3] === board[4] && board[4] === board[5] && board[3] !== 0) {
        /*
        |   |   |   |
        | * | * | * |
        |   |   |   |
         */
        return board[3];
    }
    if (board[6] === board[7] && board[7] === board[8] && board[6] !== 0) {
        /*
        |   |   |   |
        |   |   |   |
        | * | * | * |
         */
        return board[6];
    }
    if (board[0] === board[3] && board[3] === board[6] && board[0] !== 0) {
        /*
        | * |   |   |
        | * |   |   |
        | * |   |   |
         */
        return board[0];
    }
    if (board[1] === board[4] && board[4] === board[7] && board[1] !== 0) {
        /*
        |   | * |   |
        |   | * |   |
        |   | * |   |
         */
        return board[1];
    }
    if (board[2] === board[5] && board[5] === board[8] && board[2] !== 0) {
        /*
        |   |   | * |
        |   |   | * |
        |   |   | * |
         */
        return board[2];
    }
    if (board[0] === board[4] && board[4] === board[8] && board[0] !== 0) {
        /*
        | * |   |   |
        |   | * |   |
        |   |   | * |
         */
        return board[0];
    }
    if (board[2] === board[4] && board[4] === board[6] && board[2] !== 0) {
        /*
        |   |   | * |
        |   | * |   |
        | * |   |   |
         */
        return board[2];
    }

    //If all fields are taken
    for (let i = 0; i < board.length; i++) {
        if (board[i] === 0) {
            return 0;
        }
    }

    return 3;
}

router.post('/move/:bigField/:smallField', dbConnected, getGame, playersTurn, updateTimeStamp, async (req, res) => {
    let game = req.game;

    req.params.bigField = parseInt(req.params.bigField);
    req.params.smallField = parseInt(req.params.smallField);

    if (game.bigBoard[req.params.bigField] !== 0) {
        debugRoute("GET /api/game/move/:bigField/:smallField - 400 - Big field already won");
        return res.status(400).send('Big field already won.');
    }

    if (game.board[req.params.bigField][req.params.smallField] !== 0) {
        debugRoute("GET /api/game/move/:bigField/:smallField - 400 - Field already taken");
        return res.status(400).send('Field already taken.');
    }

    if (game.nextBoard !== -1 && game.nextBoard !== req.params.bigField) {
        debugRoute("GET /api/game/move/:bigField/:smallField - 400 - Wrong board");
        return res.status(400).send('Wrong board.');
    }

    game.board[req.params.bigField][req.params.smallField] = game.playerTurn;

    game.bigBoard[req.params.bigField] = boardWon(game.board[req.params.bigField]);

    game.won = boardWon(game.bigBoard);

    game.playerTurn = ((game.playerTurn+2) % 2)+1;

    game.nextBoard = game.bigBoard[req.params.smallField] === 0 ? req.params.smallField : -1;

    if (game.won !== 0) {
        game.playerTurn = 0;
        game.nextBoard = 9;
    }

    let jsonObj = game.toJSON();
    delete jsonObj._id;
    await Game.updateOne({_id: game._id}, jsonObj);

    debugRoute("GET /api/game/move/:bigField/:smallField - 200 - Move made");

    res.send(_.pick(game, ['code', 'started', 'playerTurn', 'board', 'bigBoard', 'won', 'nextBoard']));
});


module.exports = router;