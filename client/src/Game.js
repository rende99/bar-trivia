import React, {Component, useEffect, useState, useRef} from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FormSelect, Button, FormTextarea, Progress, Card, CardBody, CardTitle, CardFooter, CardSubtitle, CardDeck} from "shards-react";
import { Link, Redirect} from "react-router-dom";
import socketIOClient from "socket.io-client";
import './Game.css'
const ENDPOINT = "http://127.0.0.1:3001";
const socket = socketIOClient(ENDPOINT);

class Game extends Component {
    constructor(props) {
        super(props)
		this.state ={
            data: null,
            isHost: this.props.location.data != undefined ? this.props.location.data.isHost : true,
            gameCode: this.props.location.data != undefined ? this.props.location.data.code : -1,
            name: this.props.location.data != undefined ? this.props.location.data.name : "random name",
            currWorkingAnswer: "",
            myID: "",
            scoringArray: [],
            game: null
        }
        this.scoreChange.bind(this)
        this.beginThrow.bind(this)
    }
    
    componentDidMount() {
        //register lobby code with backend, essentially open up a room with that code if host. if joining, join.
        if(this.state.isHost){
            socket.emit("makeGame", {
                code: this.state.gameCode,
                numRounds: this.props.location.data != undefined ? this.props.location.data.numRounds : 0, 
                numPerRound: this.props.location.data != undefined ? this.props.location.data.numPerRound : 0,
                Qarray: this.props.location.data != undefined ? this.props.location.data.Qarray : [],
                Aarray: this.props.location.data != undefined ? this.props.location.data.Aarray : []
            })
            socket.on("gameCreated", function (response){
                console.log("game ready")
            })
        }else{
        }
        socket.emit("joinGame", {name: this.state.name, code: this.state.gameCode})
        socket.on("gameJoined", (response) => {
            console.log(response)
            var t = this.state.myID == "" ? response.myID : this.state.myID
            this.setState( {game: response.game, myID: t } )
        })

        socket.on("gameStarted", (response) => {
            this.setState( {game: response.game} )
            console.log(response.game)
        })

        socket.on("questionSubmitted", response => {
            this.setState( {game: response.game} )
            console.log(response.game)
        })

        socket.on("movedToNextQuestion", (response) => {
            this.setState( {game: response.game} )
            console.log(response.game)
        })

        socket.on("scoresSubmitted", response => {
            this.setState( {game: response.game} )
            console.log(response.game)
        })

        socket.off("throwFinished").on("throwFinished", response => {
            if(this.state.isHost){
                switch (response.object) {
                    case "tomato":
                        toast.error(`${response.thrower} threw a tomato at you!`)
                        break;
                    case "boulder":
                        toast.dark(`${response.thrower} threw a boulder at you!`)
                        break;
                    case "egg":
                        toast.warning(`${response.thrower} threw an egg at you!`)
                        break;
                    default:
                        toast(`${response.thrower} threw something at you!`)
                        break;
                }
            }
            this.setState( {game: response.game} )
        })

    }

    beginThrow(object){
        socket.emit("throw", {code: this.state.gameCode, name: this.state.name, object: object})
    }

    beginGame(){
        console.log("game beginning!")
        socket.emit("startGame", {code: this.state.gameCode})
    }

    nextQuestion(){
        socket.emit("nextQuestion", {code: this.state.gameCode})
    }

    playerGuessChange(event){ this.setState( {currWorkingAnswer: event.target.value} ) }

    submitQuestion(e){
        const playerIndex = this.state.game.connectedPlayers.findIndex(item => item.id == this.state.myID);
        if(this.state.game.connectedPlayers[playerIndex].guesses[(this.state.game.state.currRound-1) * this.state.game.settings.numPerRound + this.state.game.state.currQuestion - 1] == null){
            console.log("submitting question from player with id ", this.state.myID)
            socket.emit("submitQuestion", {code: this.state.gameCode, playerID: this.state.myID, guess: this.state.currWorkingAnswer})
        }else{
            console.log("already submitted a question...")
        }
    }

    scoreChange(event, id){
        // WORK ON SETTING GAME STATE HERE TO UPDATE EACH PLAYERS SCORE, THEN EMITTING TO SAVE CHANGES TO SOCKET WHEN BUTTON PRESSED!
        var newScore = event.target.options.selectedIndex
        var playerIndex = this.state.game.connectedPlayers.findIndex(item => item.id == id);

        var tempGame = this.state.game

        tempGame.connectedPlayers[playerIndex].score += (newScore == 1 ? 1 : -1)
        this.setState( {game: tempGame} )
        console.log(tempGame, playerIndex)
    }

    confirmScores(){
        socket.emit("submitScores", {code: this.state.gameCode, game: this.state.game})
        this.nextQuestion()
    }

    render(){
        console.log(this.state.game)
        return (
            <div>
                {this.state.isHost && <ToastContainer autoClose={3000} pauseOnFocusLoss={false} newestOnTop={false}/>}
                {this.state.gameCode == -1 && <Redirect to="/" />}
                {this.state.game != null &&
                    <>
                        <h3 className="nameClass">{this.state.name}</h3>
                        <h3 className="codeClass">Room Code: <h1>{this.state.gameCode}</h1></h3>

                        {this.state.game.state.currRound == 1 && this.state.game.state.currQuestion == 0 && 
                        // LOBBY; START OF GAME
                            <>
                                <h4>Game Settings:</h4>
                                <h6>Rounds: {this.state.game.settings.numRounds} | Questions Per Round: {this.state.game.settings.numPerRound}</h6>
                                <h4>Players in lobby:</h4>
                                {this.state.game.connectedPlayers.map((item, index) => (
                                    <div>
                                        <p>{item.name}</p>
                                    </div>
                                ))}
                                {this.state.isHost &&
                                    <>
                                        <Button 
                                            theme="dark" 
                                            onClick={this.beginGame.bind(this)}
                                            disabled={this.state.game.connectedPlayers.length <= 1}>
                                        Begin Game with these players
                                        </Button>
                                    </>

                                }
                            </>
                        }
                        {this.state.game.state.currQuestion != 0 && this.state.game.state.currRound != 0 &&
                            <>
                                <h1 className="topText">Round {this.state.game.state.currRound} Question {this.state.game.state.currQuestion}:</h1>
                                <h4>{this.state.game.settings.Qarray[(this.state.game.state.currRound-1) * this.state.game.settings.numPerRound + this.state.game.state.currQuestion - 1]}</h4>
                                {this.state.isHost &&
                                    <Button style={{margin: "20px"}} theme="dark" onClick={this.nextQuestion.bind(this)}>Next</Button>
                                }
                                {!this.state.isHost &&
                                    <div style={{margin: "0px 40px 0px 40px"}}>
                                        <FormTextarea onChange={this.playerGuessChange.bind(this)} />
                                        <Button theme="light" onClick={this.submitQuestion.bind(this)} style={{margin: "30px"}} >Submit Answer</Button>
                                    </div>
                                }
                                {this.state.game.connectedPlayers.map((item, index) => (
                                    <>
                                        {item.name != "Host" &&
                                            <p>{item.name}: {item.guesses[(this.state.game.state.currRound-1) * this.state.game.settings.numPerRound + this.state.game.state.currQuestion - 1] != null ? "answered" : "unanswered"}</p>
                                        }
                                    </>
                                ))
                                }
                            </>
                        }
                        {this.state.game.state.currRound > 1 && this.state.game.state.currQuestion == 0 && 
                        // END OF ROUND; ANSWER/SCORE REVIEW
                            <>
                                <h1 className="topText">Round {this.state.game.state.currRound - 1} Over!</h1>
                                {this.state.isHost &&
                                    <>
                                        {this.state.game.settings.Qarray.map((question, index) => (
                                            <>
                                                {index >= (this.state.game.state.currRound - 2)*this.state.game.settings.numPerRound && index < (this.state.game.state.currRound - 1)*this.state.game.settings.numPerRound &&
                                                    <Card className="scoreCard">
                                                        <CardBody className="cardBody">
                                                            <CardTitle>
                                                                <h2 className="cardTitle">Question {index - (this.state.game.state.currRound - 2)*this.state.game.settings.numPerRound + 1}</h2>
                                                            </CardTitle>
                                                            <CardSubtitle>
                                                                <h4 className="cardQ"><b>Q:</b> {question}</h4>
                                                                <h4 className="cardA"><b>A:</b> {this.state.game.settings.Aarray[index]}</h4>
                                                            </CardSubtitle>

                                                            <div className="innerPlayerDiv">
                                                                {this.state.game.connectedPlayers.map((player, i2) => (
                                                                    <>
                                                                        {player.name != "Host" &&
                                                                            <div className="responseParent">
                                                                                <h2>{player.name}</h2>
                                                                                <p>"{player.guesses[index]}"</p>
                                                                                <FormSelect onChange={(event) => this.scoreChange(event, player.id)} key={(index-1)*(this.state.game.settings.numPerRound) + i2}>
                                                                                    <option value="0">0 points</option>
                                                                                    <option value="1">1 point</option>
                                                                                </FormSelect>
                                                                            </div>
                                                                        }
                                                                    </>
                                                                ))}
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                }
                                            </>
                                        ))}

                                        <Button theme="dark" onClick={this.confirmScores.bind(this)}>Next Round</Button>
                                    </>
                                }
                                {!this.state.isHost &&
                                    <>
                                        <h3>Your answers are being scored... Hang on!</h3>
                                        <Button theme="danger" onClick={ () => {this.beginThrow("tomato")}} style={{margin: "30px"}} >Throw a tomato</Button>
                                        <Button theme="warning" onClick={ () => {this.beginThrow("egg")}} style={{margin: "30px"}} >Throw an egg</Button>
                                        <Button theme="secondary" onClick={ () => {this.beginThrow("boulder")}} style={{margin: "30px"}} >Throw a boulder</Button>

                                    </>
                                }
                            </>
                        }
                        {this.state.game.state.currRound == 0 && this.state.game.state.currQuestion == 1 && 
                            // END OF GAME
                            <>
                                <h2 className="topText">Final Round over!</h2>
                                <h1 className="topText">🍻<b>{this.state.game.connectedPlayers.reduce((prev, current) => (prev.score > current.score) ? prev : current).name}</b> wins!🍻</h1>
                                <Card className="scoreCard">
                                    <h3 className="infoCardTitle">Game Stats:</h3>
                                    <CardBody className="cardContent">
                                        <CardTitle className="statGroup">
                                            <p className="gameOverStat">Tomatoes thrown: <b>{this.state.game.state.objectsThrown.tomatoes}</b></p>
                                            <p className="gameOverStat">Boulders thrown: <b>{this.state.game.state.objectsThrown.boulders}</b></p>
                                            <p className="gameOverStat">Eggs thrown: <b>{this.state.game.state.objectsThrown.eggs}</b></p>
                                        </CardTitle>                                              
                                    </CardBody>
                                </Card>
                            </>


                        }
                        {!(this.state.game.state.currRound == 1 && this.state.game.state.currQuestion == 0) &&
                        <Card className="scoreCard">
                            <h3 className="infoCardTitle">Scorecard:</h3>
                            {this.state.game.connectedPlayers.map((player, index) => (
                                    <>
                                        {player.name != "Host" &&

                                            <CardBody className="cardContent">
                                                    <CardTitle className="playerTitle">
                                                        <p className="playerNameScore"><b>{player.name}</b></p>
                                                    </CardTitle>
                                                    
                                                    <Progress 
                                                        className="progressBar"
                                                        value={player.score}
                                                        max={this.state.game.settings.numRounds*this.state.game.settings.numPerRound}
                                                        theme={["primary","secondary","success","warning","danger","info","dark"][Math.floor((new Math.seedrandom(player.id)())*7)]}>{player.score}
                                                    </Progress>                                                
                                            </CardBody>

                                        }
                                    </>
                            ))}
                        </Card>
                        } 
                        
                    </>
                
                }
            </div>
 
        );
    }
}

export default Game;