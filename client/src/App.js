import React, { Component } from 'react';
import { Route, withRouter } from 'react-router-dom';
import './App.css';
import Home from './Home';
import HostPub from './HostPub';
import JoinPub from './JoinPub';
import Game from './Game';

class App extends Component {
	constructor(props) {
		super(props)
		this.state ={
			data: null
		}
  }

  render(){
    return (
      <div className="App">
        <Route exact path="/" component={Home}/>
        <Route exact path="/hostPub" component={HostPub}/>
        <Route exact path="/joinPub" component={JoinPub}/>
        <Route exact path="/play" component={Game}/>

      </div>
    );
  }

}

export default withRouter(App);
