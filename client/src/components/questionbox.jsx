import React, {Component, useEffect, useState} from 'react';
import { Form, FormGroup, FormInput, Button } from "shards-react";
import socketIOClient from "socket.io-client";
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
                    <hr style={{
                        color: '#000000',
                        backgroundColor: '#000000',
                        height: 5
                    }}/>
                }
                <FormGroup>
                    <label>Round {this.props.round} Question {this.props.question}</label>
                    <FormInput placeholder="Q:" onChange={this.QChange.bind(this)}/>
                    <FormInput placeholder="A:" onChange={this.AChange.bind(this)}/>
                </FormGroup>
            </div> 
        );
    }
}

export default JoinPub;