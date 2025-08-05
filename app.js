// libs/middleware
const debugStartup = require('debug')('app:startup');
const debugUnknownRoute = require('debug')('app:unknownRoute');
const debugDB = require('debug')('app:db');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose').default;
const moment = require('moment');

//routes
const games = require('./routes/game');

//models
const {Game} = require("./models/game");

const app = express();

//default middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "img-src": ["'self'", "img.shields.io"],
            "script-src": ["'self'", "www.googletagmanager.com", "www.google-analytics.com", "'unsafe-inline'"],
            "connect-src": ["'self'", "*.google-analytics.com"],
            "script-src-attr": ["'self'", "'unsafe-inline'"],
        },
    },
}));
app.use(cors());

//routes
app.use(express.static('public'));
app.use('/api', games);

app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

//read config
debugStartup('Meta Tic Tac Toe');

//connect to database
let db = mongoose.connection;
global.connected = false

//reconnect on disconnect
db.on('disconnected', function() {
    debugDB('MongoDB connection error! - Retry in 15 seconds');
    global.connected = false;
    setTimeout(connect, 15000);
});

//close connection on exit
process.on('SIGINT', function() {
    db.close(function () {
        debugDB('Force to close the MongoDB connection');
        global.connected = false;
        process.exit(0);
    });
});

//connect to db
connect();

//enable logging for not covered routes
if(app.get('env') === 'development'){
    app.use(morgan("tiny",{
        "stream": {
            write: function(str) { debugUnknownRoute(str.replace("\n","")); }
        }
    }));
    debugStartup('Morgan enabled...');
}


//start application
const port = process.env.PORT || 3000;
app.listen(port, () => debugStartup(`Listening on port ${port}...`));


function connect(){
    const user = process.env.mongoUser;
    const password = process.env.mongoPassword;
    const url = process.env.mongoUrl;

    if (!url) {
        debugStartup('FATAL ERROR: mongoUrl is not defined.');
        process.exit(1);
    }

    async function doConnect() {
        debugDB("Trying to connect to MongoDB with "+ user +" - "+password)
        try {
            await mongoose.connect(url, {
                "authSource": "admin",
                "user": user,
                "pass": password,
                "useNewUrlParser": true,
                "useUnifiedTopology": true
            });
            debugDB('Connected to MongoDB('+url+')...');
            global.connected = true;
        } catch (err) {
            debugDB('MongoDB connection error: ' + err);
            global.connected = false;
        }
    }

    if (mongoose.connection.readyState !== 0) { // 0 = disconnected
        debugDB('Disconnecting existing MongoDB connection before reconnecting...');
        mongoose.disconnect().then(doConnect).catch(err => {
            debugDB('Error during disconnect: ' + err);
            doConnect();
        });
    } else {
        doConnect();
    }
}

async function deleteOldDocuments() {
    try {
        // Connect to the database
        if (!global.connected) {
            debugDB('FATAL ERROR: Not connected to MongoDB.');
            return;
        }

        // Calculate the date 1 day ago
        const oneDayAgo = moment().subtract(2, 'days').toDate();

        // Delete documents where 'lastInteracted' is older than 1 day
        const deletedDocs = await Game.deleteMany({
            lastInteracted: { $lt: oneDayAgo },
        });

        console.log(`Deleted ${deletedDocs.deletedCount} documents.`);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call the function initially
deleteOldDocuments();

// Schedule the function to run every day (adjust the timing as needed)
const intervalInMilliseconds = 60 * 60 * 1000; // 1 hour
setInterval(deleteOldDocuments, intervalInMilliseconds);