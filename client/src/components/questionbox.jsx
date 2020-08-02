import React, {Component, useEffect, useState} from 'react';
import { Form, FormGroup, FormInput, Button, InputGroup, InputGroupAddon, InputGroupText, Card  } from "shards-react";
import socketIOClient from "socket.io-client";
import './questionbox.css'

const ENDPOINT = "http://127.0.0.1:3001";
class JoinPub extends Component {
    constructor(props) {
        super(props)
		this.state ={
            data: null,
            Q: "",
            A: "",
        }
    }
    
    async componentDidMount() {
       console.log(this.props.indx)
    }
    QChange(event){
        console.log("Q changing")
        this.setState( {Q: event.target.value}, () => {
            this.props.onQChange(this.state.Q, this.props.round, this.props.question)
        } )
    }
    AChange(event){
        console.log("A changing")
        this.setState( {A: event.target.value}, () => {
            this.props.onAChange(this.state.A, this.props.round, this.props.question)
        } )
    }

    render(){
        return (
            <div>
                {this.props.question == 1 && this.props.round != 1 &&
                    <hr className="lineBreak" />
                }
                <FormGroup className="entireParent">
                    <h5>Round {this.props.round} Question {this.props.question}</h5>
                    <div className="formDiv">
                        <InputGroup className="QAGroup">
                            <InputGroupAddon type="prepend">
                                <InputGroupText>Q: </InputGroupText>
                            </InputGroupAddon>
                            <FormInput defaultValue={this.props.defaultQ} onChange={this.QChange.bind(this)}/>
                        </InputGroup>
                        <InputGroup className="QAGroup">
                            <InputGroupAddon type="prepend">
                                <InputGroupText>A: </InputGroupText>
                            </InputGroupAddon>
                            <FormInput defaultValue={this.props.defaultA} onChange={this.AChange.bind(this)}/>
                        </InputGroup>
                    </div>

                </FormGroup>
            </div> 
        );
    }
}

export default JoinPub;