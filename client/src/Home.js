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
            <div className="God">
                <h1 className="siteTitle">Pub Trivia Online</h1>
                <div className="choices">
                    <Link to='/hostPub'>
                        <Button theme="dark">Host Pub Trivia</Button>
                    </Link>
                    <h3 id="or"><b>or</b></h3>
                    <Link to='/joinPub'>
                        <Button theme="light">Join Pub Trivia</Button>
                    </Link>
                </div>
            </div>
        );
    }
}

export default Home;