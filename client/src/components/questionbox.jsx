import React, {Component, useEffect, useState} from 'react';
import { Form, FormGroup, FormInput, Button } from "shards-react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:3001";
class JoinPub extends Component {
    constructor(props) {
        super(props)
		this.state ={
            data: null,
        }
    }
    
    async componentDidMount() {
       console.log(this.props.indx)
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
                    <FormInput placeholder="Q:" inputRef={ref => { this.QInput = ref; }}/>
                    <FormInput placeholder="A:" inputRef={ref => { this.AInput = ref; }}/>
                </FormGroup>
            </div> 
        );
    }
}

export default JoinPub;