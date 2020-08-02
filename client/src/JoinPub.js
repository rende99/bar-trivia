import React, {Component, useEffect, useState} from 'react';
import { Form, FormGroup, FormInput, Button } from "shards-react";
import { Link, Redirect} from "react-router-dom";
import socketIOClient from "socket.io-client";
import './joinPub.css'

const ENDPOINT = "http://127.0.0.1:3001";
class JoinPub extends Component {
    constructor(props) {
        super(props)
		this.state ={
            data: null,
            code: 0,
            name: ""
        }
    }
    
    async componentDidMount() {

    }

    codeChanged(event){
        this.setState( {code: event.target.value} )
    }
    nameChanged(event){
        this.setState( {name: event.target.value} )

    }

    submitClick(){

    }

    render(){
        return (
            <div className="God">
                <h1>Join Pub</h1>
                <Form>
                    <FormGroup>
                        <div className="joinInputGroup">
                            <h5>Enter Pub Code</h5>
                            <FormInput placeholder="ex: 215688" onChange={this.codeChanged.bind(this)} style={{"max-width": "500px"}}/>
                        </div>
                        <div className="joinInputGroup">
                            <h5>Enter Nickname</h5>
                            <FormInput placeholder="John" onChange={this.nameChanged.bind(this)} style={{"max-width": "500px"}}/>
                        </div>

                        <Link to={{
                        pathname: '/play',
                        data: {
                            isHost: false,
                            code: this.state.code,
                            name: this.state.name
                        }}}>
                            <Button theme="light">Search</Button>
                        </Link>
                    </FormGroup>
                </Form>


            </div>
        );
    }
}

export default JoinPub;