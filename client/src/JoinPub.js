import React, {Component, useEffect, useState} from 'react';
import { Form, FormGroup, FormInput, Button } from "shards-react";
import { Link, Redirect} from "react-router-dom";
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
        const socket = socketIOClient(ENDPOINT);
        socket.on("connection", data => {
          console.log(data)
        });
    }

    render(){
        return (
            <div>
                <h1>Join Pub</h1>
                <Form>
                    <FormGroup>
                        <label>Enter Pub Code</label>
                        <FormInput placeholder="ex: 215688" />
                        <Button theme="light">Search</Button>
                    </FormGroup>
                </Form>


            </div>
        );
    }
}

export default JoinPub;