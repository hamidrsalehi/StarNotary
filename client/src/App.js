import React, { Component } from "react";
import StarNotaryContract from "./contracts/StarNotary.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { starName: "", 
            starID: "", 
            starOwner: "", 
            lookUpStarID: "", 
            lookUpStarName: "", 
            lookUpStarAddress: "", 
            web3: null, 
            accounts: null, 
            contract: null 
          };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();
      console.log(this.accounts);

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      this.deployedNetwork = StarNotaryContract.networks[this.networkId];
      this.instance = new this.web3.eth.Contract(
        StarNotaryContract.abi,
        this.deployedNetwork && this.deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3: this.web3, accounts: this.accounts, contract: this.instance });
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleCreateStar = async (event) => {
    console.log("Star Created");
    console.log("Star Name", this.state.starName);
    console.log("Star ID", this.state.starID);
    let starName = this.state.starName;
    let starID = this.state.starID;
    this.instance.methods.createStar(starName, starID).send({from: this.accounts[0]})
    .then(receipt => {
      console.log(receipt);
      let starOwner = `Star Owner: ${this.accounts[0]}`;
      this.setState({starOwner});
    })
    .catch(err => {
      console.log('something went wrong');
    });
  }

  handleStarLookupSubmit = async(event) => {
    console.log("Looking Up a star", this.state.lookUpStarID);
    let star= await this.instance.methods.lookUptokenIdToStarInfo(this.state.lookUpStarID).call({from: this.accounts[0]});
    console.log(star);
    let lookUpStarName = `Star name is: ${star[0]}`;
    let lookUpStarAddress = `Star owner is: ${star[1]}`;
    this.setState({lookUpStarName})
    this.setState({lookUpStarAddress})
  }
  
  
  handleStarName = (event) => {
    this.setState({starName: event.target.value});
  }

  handleStarID = (event) => {
    this.setState({starID: event.target.value});
  }

  handleStarLookup = (event) => {
    this.setState({lookUpStarID: event.target.value});
  }

  // handleStarOwner = async (event) => {
  //   // console.log(this.state);
  //   console.log(event);
  //   let starOwner = await this.instance.methods.starOwner().call();
  //   this.setState({starOwner});
  // }

  // handleClaimStar = async (event) => {
  //   console.log("claiming star!");
  //   console.log(this.accounts);
  //   await this.instance.methods.claimStar().send({from: this.accounts[0]});
  //   // this.setState({starOwner});
  // }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
      <h1>Star Notary DAPP</h1>
      <br></br>
      <br></br>
      <h1>Create a Star</h1>
      <br></br>
      <p> Star Name: </p><input type="text" value={this.state.value} onChange={this.handleStarName} />
      <p> Star ID: </p>
      <input type="text" value={this.state.value} onChange={this.handleStarID} /> 
      <p><button id="createStar" onClick={this.handleCreateStar}>Create Star</button></p>
      <br></br>
      <hr></hr>
      <br></br>
      <h1>Look up a Star</h1>
      <br></br>
      <p> Star ID: </p>
      <input type="text" value={this.state.value} onChange={this.handleStarLookup} /> 
      <p><button id="Look Up a Star" onClick={this.handleStarLookupSubmit}>Look Up</button></p>
      <p>{this.state.lookUpStarName}</p>
      <p>{this.state.lookUpStarAddress}</p>
      <br></br>
      <hr></hr>
      <p>{this.state.starOwner}</p>
      <span id="status"></span>
    </div>

    );
  }
}

export default App;
