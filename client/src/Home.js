import React, {Component, useEffect, useState} from 'react';
import { Button } from "shards-react";
import { Link, Redirect} from "react-router-dom";
import './Home.css'


class Home extends Component {
    constructor(props) {
        super(props)
		this.state ={
            data: null,
        }
    }
    
    async componentDidMount() {

    }

    render(){
        return (
            <div>
                <h1>Pub Trivia Online</h1>
                <Link to='/hostPub'>
                    <Button theme="dark">Host Pub Trivia</Button>
                </Link>
                <div>
                    <p>or</p>
                </div>
                <Link to='/joinPub'>
                    <Button theme="light">Join Pub Trivia</Button>
                </Link>
            </div>
        );
    }
}

export default Home;