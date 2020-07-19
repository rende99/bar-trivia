import React, {Component, useEffect, useState} from 'react';
import { Form, FormGroup, FormInput, FormSelect, Button, ButtonGroup } from "shards-react";
import { Link, Redirect} from "react-router-dom";
import QuestionBox from './components/questionbox'



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
        }
    }
    
    componentDidMount() {
        this.setState( {Qarray: Array(this.state.numRounds*this.state.numPerRound)} )
        this.setState( {Aarray: Array(this.state.numRounds*this.state.numPerRound)} )
        this.createQuestionBoxes()
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

    submitClick(){
        alert("submitted")
        console.log(this.state.Qarray, this.state.Aarray)
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
                <Form>
                    <label>How many rounds?</label>
                    <FormSelect onChange={this.numRoundChange.bind(this)} value={this.state.numRounds}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5" selected>5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </FormSelect>
                    <label>How many questions per round?</label>
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
                    {this.state.rows}
                    <Button theme="dark" onClick={this.submitClick.bind(this)}>Submit and start game</Button>



                </Form>
            </div>
 
        );
    }
}

export default HostPub;