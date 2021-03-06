var express = require('express');
var path = require('path');
const bodyParser = require('body-parser');
var http = require('http');
var socketIO = require('socket.io');
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');
const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var gameCollection =  new function() {
    this.totalgameCount = 0,
    this.gameList = []
};

var app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
var server = http.createServer(app);
var io = socketIO(server);
io.listen(3001)

const port = process.env.PORT || 5000;

console.log("STARTING SERVER...")
server.listen(port, () => console.log(`Listening on port ${port}`));

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, 'build')))
    MongoClient.connect(process.env.mongo_url, { useUnifiedTopology: true })
    .then(client => {
        app.get('/*', (req, res) => {
            res.sendFile(path.join(__dirname, 'build', 'index.html'));
        });
    }).catch(error => console.error(error))
}


MongoClient.connect(process.env.mongo_url, { useUnifiedTopology: true })
.then(client => {
    const db = client.db('bar-trivia-db')
    console.log(db)

	app.get('/getAllTemplates', async function (req, res) {
        console.log("wwwwwwwwww")
        await db.collection('questionCollection').find().toArray().then(results => {
            console.log(results)
            res.send( {data: results} );
        }).catch(err => {
            console.error(err)
            res.send( {data: "error! something went wrong"} ) 
        })
	});

	app.get('/getTemplate/:templateID', async function (req, res) {
        console.log(req.params.templateID)
        await db.collection('questionCollection').find( { _id: ObjectId(req.params.templateID) } ).toArray().then(results => {
            console.log(results[0])
            res.send( {data: results[0]} );
        }).catch(err => {
            console.error(err)
            res.send( {data: "error! something went wrong"} ) 
        })
    });
    
    app.get('/newTemplate/:template', async function (req, res) {
        console.log("adding new template")
        var jsonObj = JSON.parse(req.params.template)
        console.log(jsonObj)
        await db.collection('questionCollection').insertOne({
            name: Math.random().toString() + "_Template",
            timesUsed: 0,
            numRounds: jsonObj.numRounds,
            numPerRound: jsonObj.numPerRound,
            questions: jsonObj.questions
        })
        res.send( {data: "uploaded new bar trivia template"} );
    })
    
    app.get('/usingTemplate/:templateID', async function (req, res) {
        console.log(req.params.templateID)
        await db.collection('questionCollection').update( { _id: ObjectId(req.params.templateID) }, { $inc: {timesUsed: 1} } ).then(results => {
            res.send( {data: "score incremented"} );
        }).catch(err => {
            console.error(err)
            res.send( {data: "error! something went wrong"} ) 
        })
	})


}).catch(error => console.error(error))


io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });


    socket.on('makeGame', function (data) {

        console.log("Game Code: " + data.code);
        if(data.code == -1) return;
        gameCollection.gameList.push({
            code: data.code,
            connectedPlayers: [],
            settings: {
                numRounds: data.numRounds,
                numPerRound: data.numPerRound,
                Qarray: data.Qarray,
                Aarray: data.Aarray
            },
            state: {
                currRound: 1,
                currQuestion: 0,
                objectsThrown: {
                    tomatoes: 0,
                    boulders: 0,
                    eggs: 0
                }
            }
        })
        gameCollection.totalgameCount++
        socket.broadcast.emit('gameCreated');
     });

    socket.on('joinGame', function(data) {
        console.log("joining game: ", data.name, data.code)
        if(data.code == -1) return;
        socket.join(data.code) //join room with id code
        console.log(gameCollection)
        const index = gameCollection.gameList.findIndex(item => item.code == data.code);
        var id = uuidv4()
        console.log(id)
        gameCollection.gameList[index].connectedPlayers.push({
            name: data.name,
            id: id,
            isHost: data.name == "Host",
            score: 0,
            guesses: []
        })

        io.sockets.in(data.code).emit('gameJoined', {
            game: gameCollection.gameList[index],
            myID: id
        });
    })


    socket.on('startGame', function(data) {
        const index = gameCollection.gameList.findIndex(item => item.code == data.code);
        gameCollection.gameList[index].state.currQuestion = 1
        io.sockets.in(data.code).emit('gameStarted', {
            game: gameCollection.gameList[index]
        });
    })

    socket.on('throw', function(data) {
        console.log("throwing " + data.object)
        const index = gameCollection.gameList.findIndex(item => item.code == data.code);
        switch (data.object) {
            case "tomato":
                gameCollection.gameList[index].state.objectsThrown.tomatoes++
                break;
            case "boulder":
                gameCollection.gameList[index].state.objectsThrown.boulders++
                break;
            case "egg":
                gameCollection.gameList[index].state.objectsThrown.eggs++
                break;
            default:
                break;
        }
        io.sockets.in(data.code).emit('throwFinished', {
            thrower: data.name,
            object: data.object,
            game: gameCollection.gameList[index]
        });
    })

    socket.on('submitQuestion', function(data) {
        const index = gameCollection.gameList.findIndex(item => item.code == data.code);
        const playerIndex = gameCollection.gameList[index].connectedPlayers.findIndex(item => item.id == data.playerID);
        gameCollection.gameList[index].connectedPlayers[playerIndex].guesses.push(data.guess)
        io.sockets.in(data.code).emit('questionSubmitted', {
            game: gameCollection.gameList[index]
        })
    })

    socket.on('submitScores', function(data) {
        const index = gameCollection.gameList.findIndex(item => item.code == data.code);
        gameCollection.gameList[index] = data.game
        if(gameCollection.gameList[index].state.currRound - 1 == gameCollection.gameList[index].settings.numRounds){
            gameCollection.gameList[index].state.currQuestion = 0;
            gameCollection.gameList[index].state.currRound = 0;
        }
        io.sockets.in(data.code).emit('scoresSubmitted', {
            game: gameCollection.gameList[index],
        });
    })

    socket.on('nextQuestion', function(data) {
        const index = gameCollection.gameList.findIndex(item => item.code == data.code);
        if(gameCollection.gameList[index].state.currQuestion == gameCollection.gameList[index].settings.numPerRound){
            // that was just the last question of the round
            // We establish currQuestion = 0 and currRound = 0 to mean the beginning of a new round / score review time
            gameCollection.gameList[index].state.currQuestion = 0;
            gameCollection.gameList[index].state.currRound++;
        }else{
            gameCollection.gameList[index].state.currQuestion++;
        }

        io.sockets.in(data.code).emit('movedToNextQuestion', {
            game: gameCollection.gameList[index],
        });
    })

});




