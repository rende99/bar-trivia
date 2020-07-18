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
            rows: []
        }
    }
    
    async componentDidMount() {
        this.createQuestionBoxes()
    }

    numRoundChange(event){ 
        this.setState( {numRounds: event.target.value}, () => {
            this.createQuestionBoxes()
        }) 
    }
    numPerRoundChange(event){ 
        this.setState( {numPerRound: event.target.value}, () => {
            this.createQuestionBoxes()
        }) 
    }

    createQuestionBoxes(){
        var rows = []
        for(var i = 0; i < this.state.numRounds * this.state.numPerRound; i++){
            rows.push(<QuestionBox round={Math.floor(i / this.state.numPerRound) + 1} question={i % this.state.numPerRound + 1}/>)
            
        }
        this.setState( {rows: rows} )
        return rows
    }

    exportQuestions(){
        console.log("exporting...")
        console.log(this.state.rows[0].QInput.value)
        var exportObj = {
            numRounds: this.state.numRounds,
            numPerRound: this.state.numPerRound,
            questions: [

            ]
        }

    }
    importQuestions(){
        console.log("importing...")
    }

    submitClick(){
        alert("submitted")
    }

    render(){
        return (
            <div>
                <h2>Create a new Game</h2>
                <ButtonGroup>
                    <Button theme="light" onClick={this.exportQuestions.bind(this)}>Export questions</Button>
                    <Button theme="light" onClick={this.importQuestions.bind(this)}>Import questions</Button>
                </ButtonGroup>   
                <Form>
                    <label>How many rounds?</label>
                    <FormSelect onChange={this.numRoundChange.bind(this)}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5" selected="selected">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </FormSelect>
                    <label>How many questions per round?</label>
                    <FormSelect onChange={this.numPerRoundChange.bind(this)}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8" selected="selected">8</option>
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