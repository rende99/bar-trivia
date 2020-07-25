import React, {Component, useEffect, useState} from 'react';
import { Form, FormGroup, FormInput, FormSelect, Button, ButtonGroup, Modal, ModalHeader, ModalBody, Card, CardBody, CardTitle, CardSubtitle, Container, Row, Col} from "shards-react";
import { Link, Redirect} from "react-router-dom";
import QuestionBox from './components/questionbox'
import './HostPub.css'


class HostPub extends Component {
    constructor(props) {
        super(props)
		this.state ={
            data: null,
            numRounds: 5,
            numPerRound: 8,
            rows: [],
            Qarray: [],
            Aarray: [],
            modalOpen: false,
            templatesToDisplay: []
        }
    }
    
    componentDidMount() {
        this.setState( {Qarray: Array(this.state.numRounds*this.state.numPerRound)} )
        this.setState( {Aarray: Array(this.state.numRounds*this.state.numPerRound)} )
        this.createQuestionBoxes()
        this.getAllTemplates()
        console.log(this.state.rows)

    }

    numRoundChange(event){ 
        var difference = (event.target.value - this.state.numRounds) * this.state.numPerRound //positive for more questions, negative for less questions
        this.setState( {numRounds: event.target.value}, () => {
            this.createQuestionBoxes()
            var tempQ = this.state.Qarray
            var tempA = this.state.Aarray
            tempQ.length += difference
            tempA.length += difference
            this.setState( {Qarray: tempQ} )
            this.setState( {Aarray: tempA} )
        }) 
    }
    numPerRoundChange(event){ 
        var newNumPerRound = event.target.value
        var difference = (newNumPerRound - this.state.numPerRound) * this.state.numRounds //positive for more questions, negative for less questions
        var prevNumPerRound = this.state.numPerRound
        this.setState( {numPerRound: newNumPerRound}, () => {
            this.createQuestionBoxes()
            var tempQ = this.state.Qarray
            var tempA = this.state.Aarray
            /*
            //we have to deal with this change a bit differently, and add new questions at the end of each round (or remove questions from the end of each round).
            var numSpliced = 0
            for(var i = 0; i < this.state.numRounds; i++){
                // i represents each round number
                if(difference > 0){
                    for(var j = prevNumPerRound; j < newNumPerRound; j++){
                        // go from the end of each round to the new end of each round
                        tempQ.splice((i*prevNumPerRound) + j + numSpliced, 0, "")
                        tempA.splice((i*prevNumPerRound) + j + numSpliced, 0, "")
                        numSpliced++; // because we are changing the array as we iterate.
                    }

                }else{
                    // go from the end of each round to the new end of each round
                    tempQ.splice(i*prevNumPerRound + newNumPerRound - numSpliced, -1*difference, "")
                    tempA.splice(i*prevNumPerRound + newNumPerRound - numSpliced, -1*difference, "")
                    numSpliced += (-1*difference); // because we are changing the array as we iterate.
                }
            }
            */
            tempQ.length += difference
            tempA.length += difference
            this.setState( {Qarray: tempQ} )
            this.setState( {Aarray: tempA} )


        }) 
    }

    updateQ(newQ, r, q){
        console.log("before: " + this.state.Qarray)
        var temp = this.state.Qarray;
        temp[((r-1)*this.state.numPerRound)+q-1] = newQ
        this.setState( {Qarray: temp}, () => {
            console.log("after: " + this.state.Qarray)

        } )
    }
    updateA(newA, r, q){
        console.log("before: " + this.state.Aarray)
        var temp = this.state.Aarray;
        temp[((r-1)*this.state.numPerRound)+q-1] = newA
        this.setState( {Aarray: temp}, () => {
            console.log("after: " + this.state.Aarray)

        } )
    }

    createQuestionBoxes(){
        var rows = []
        for(var i = 0; i < this.state.numRounds * this.state.numPerRound; i++){
            rows.push(<QuestionBox round={Math.floor(i / this.state.numPerRound) + 1} question={i % this.state.numPerRound + 1} defaultQ={this.state.Qarray[i]} defaultA={this.state.Aarray[i]} onQChange={this.updateQ.bind(this)} onAChange={this.updateA.bind(this)}/>)
        }
        this.setState( {rows: rows}, () => {
            return rows
        } )
    }

    exportQuestions(){
        console.log("exporting...")
        console.log(this.state.rows[0])
        var exportObj = {
            'numRounds': this.state.numRounds,
            'numPerRound': this.state.numPerRound,
            'questions': [

            ]
        }
        for(var i = 0; i < this.state.Qarray.length; i++){
            exportObj.questions[i] = {
                'Q': this.state.Qarray[i],
                'A': this.state.Aarray[i]
            }
        }
        console.log(exportObj)
        this.exportToJsonFile(exportObj)
    }

    exportToJsonFile(jsonData) {
        let dataStr = JSON.stringify(jsonData);
        let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
        let exportFileDefaultName = 'pubQuestions.json';
    
        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importQuestions(event){
        console.log("importing...")
        var fileReader = new FileReader()
        fileReader.readAsText(event.target.files[0])
        var jsonObj = {}
        fileReader.onload = (e) => {
            // The file's text will be printed here
            console.log(e.target.result)
            jsonObj = JSON.parse(e.target.result)
            console.log(jsonObj)
            this.setState( {numRounds: jsonObj.numRounds} )
            this.setState( {numPerRound: jsonObj.numPerRound} )
            var tempQArray = []
            var tempAArray = []
            console.log(jsonObj)
            for(var i = 0; i < jsonObj.questions.length; i++){
                tempQArray[i] = jsonObj.questions[i].Q
                tempAArray[i] = jsonObj.questions[i].A
            }
            this.setState( {Qarray: tempQArray} )  
            this.setState( {Aarray: tempAArray} ) 
            this.createQuestionBoxes()
        };
    }

    uploadQuestions(event){
        console.log("uploading...")
        var fileReader = new FileReader()
        fileReader.readAsText(event.target.files[0])
        var jsonObj = {}
        fileReader.onload = async (e) => {
            // The file's text will be printed here
            console.log(e.target.result)
            jsonObj = JSON.parse(e.target.result)
            console.log(jsonObj)
            const response = await fetch('newTemplate/'+JSON.stringify(jsonObj), {
                method: 'GET'
            }).then(async response => {
                // Just close the modal once the file is done uploading to the DB.
                this.setState( {modalOpen: false} )                
            })


        };
    }

    submitClick(){
        console.log(this.state.Qarray, this.state.Aarray)
    }

    toggleModal(){
        this.setState( {modalOpen: !this.state.modalOpen})
    }

    async getAllTemplates(){
        // this method is run when the modal is open.
        console.log("getting ALL templates")
        const response = await fetch('/getAllTemplates', {
            method: 'GET'
        }).then(async response => {
            console.log(response)
            const json = await response.json();
            console.log(json.data)
            this.setState( {templatesToDisplay: json.data} )
            return json.data
        })
    }

    async templateSelected(event, id){
        console.log("HERE: ", id)
        const response = await fetch('getTemplate/'+id, {
            method: 'GET'
        }).then(async response => {
            console.log(response)
            const json = await response.json();
            console.log(json.data)
            
            this.setState( {numRounds: json.data.numRounds} )
            this.setState( {numPerRound: json.data.numPerRound} )
            var tempQArray = []
            var tempAArray = []
            for(var i = 0; i < json.data.questions.length; i++){
                tempQArray[i] = json.data.questions[i].Q
                tempAArray[i] = json.data.questions[i].A
            }
            this.setState( {Qarray: tempQArray} )  
            this.setState( {Aarray: tempAArray} ) 
            this.createQuestionBoxes()
            await fetch('usingTemplate/'+json.data._id, {
                method: 'GET'
            })
            this.toggleModal()
        })
    }

    render(){
        return (
            <div>
                <h2>Create a new Game</h2>
                <ButtonGroup>
                    <Button theme="light" onClick={this.exportQuestions.bind(this)}>Export questions</Button>
                    <Button type="file" name="file" theme="light">Import questions
                        <input type="file" name="file" accept=".json" onChange={this.importQuestions.bind(this)}/>
                    </Button>
                </ButtonGroup>  
                <div className="buttonDiv">
                    <Button theme="info" onClick={this.toggleModal.bind(this)}>Browse Pre-made Games</Button> 
                </div>
                <Modal open={this.state.modalOpen} toggle={this.toggleModal.bind(this)} size="lg">
                    <ModalHeader>Public Game Templates</ModalHeader>
                    {this.state.modalOpen &&
                        <>
                            {this.state.templatesToDisplay.sort((a, b) => (a.timesUsed > b.timesUsed) ? -1 : 1).map((obj, index) => {
                                return (
                                    <Card className="templateCard" onClick={(event) => this.templateSelected(event, obj._id)}>
                                        <CardBody>
                                            <Container>
                                                <Row>
                                                    <Col sm="12" md="4" lg="10" className="colL">
                                                        <CardTitle>{obj.name}</CardTitle>
                                                        <CardSubtitle>Rounds: {obj.numRounds} | Questions per Round: {obj.numPerRound}</CardSubtitle>
                                                    </Col>
                                                    <Col sm="12" md="4" lg="2" className="colR">
                                                        <p className="cardP">used</p> 
                                                        <h3 className="timesUsedClass">{obj.timesUsed}</h3>
                                                        <p className="cardP">times</p>
                                                    </Col>
                                                </Row>
                                            </Container>
                                        </CardBody>
                                    </Card>
                                )
                            })}
                        </>
                    }
                    <ModalBody>Upload your own game template below!</ModalBody>
                    <Button className="uploadButton" theme="info">Upload a game template
                        <input type="file" name="file" accept=".json" onChange={this.uploadQuestions.bind(this)}/>
                    </Button> 
                </Modal>

                <Form style={{margin: "30px 0px 0px 0px"}}>
                    <div className="inputGroup">
                        <h5>How many rounds?</h5>
                        <FormSelect onChange={this.numRoundChange.bind(this)} value={this.state.numRounds}>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                        </FormSelect>
                    </div>
                    <div className="inputGroup">
                        <h5>How many questions per round?</h5>
                        <FormSelect onChange={this.numPerRoundChange.bind(this)} value={this.state.numPerRound}>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                        </FormSelect>
                    </div>
 
                    {this.state.rows}
                    
                    <Link to={{
                        pathname: '/play',
                        data: {
                            isHost: true,
                            code: Math.floor(Math.random() * 1000000),
                            name: "Host",
                            numRounds: this.state.numRounds,
                            numPerRound: this.state.numPerRound,
                            Qarray: this.state.Qarray,
                            Aarray: this.state.Aarray
                        }}}>
                        <Button theme="dark" onClick={this.submitClick.bind(this)}>Submit and start game</Button>
                    </Link>


                </Form>
            </div>
 
        );
    }
}

export default HostPub;