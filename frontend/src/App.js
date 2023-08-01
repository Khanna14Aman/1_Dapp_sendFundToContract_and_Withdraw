import { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { Web3 } from "web3";
import Funder from "./contracts/Funder.json";
// import loadContract from "./utils/load-contract";

function App() {
  const [web3Api, setweb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  });

  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [reload, shouldReload] = useState(false);
  const reloadEffect = () => shouldReload(!reload);
  const setAccountListener = (provider) => {
    provider.on("accountsChanged", (accounts) => setAccount(accounts[0]));
  };

  useEffect(() => {
    // This use Effect will invoke metamask from our browser and let us we connect to our account

    const loadProvider = async () => {
      // MetaMask wallet inject two objects in our browser which are web3 and ethereum
      // console.log(window.web3);
      // console.log(window.ethereum);

      //{
      // let provider = null;
      // if (window.ethereum) {
      //   provider = window.ethereum;
      //   // console.log(provider);
      //   try {
      //     // Now we will automatically invoke MetaMask to get connected using below function
      //     // provider.enable() this is depreciated function
      //     await provider.request({
      //       method: "eth_requestAccounts",
      //     });
      //   } catch {
      //     console.error("User is not allowed");
      //   }
      // } else if (window.web3) {
      //   provider = window.web3.currentProvider;
      // } else if (!process.env.production) {
      //   provider = new Web3.providers.HttpProvider("http://localhost:7545");
      // }
      // } These work of checking metamask and getting connect with that can be done by detectEthereumProvider;

      const provider = await detectEthereumProvider(); // This will just detect does we have MetaMask or not
      if (provider) {
        console.log("We have metamask");
        try {
          setAccountListener(provider);
          await provider.request({ method: "eth_requestAccounts" }); // This function will actually open metamask to connect our account
          setweb3Api({
            web3: new Web3(provider),
            provider,
            contract: null,
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("please install MetaMask");
      }
    };
    loadProvider();
  }, []);

  useEffect(() => {
    // This function will find out our account number from which we are connected.
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    };

    // This function will create the instance of our contract to communicate with them.

    const getContract = async () => {
      const networkId = await web3Api.web3.eth.net.getId();
      // console.log(networkId);

      const deployedNetwork = Funder.networks[networkId];
      // console.log(deployedNetwork.address);

      const contract = new web3Api.web3.eth.Contract(
        Funder.abi,
        deployedNetwork.address
      );
      // console.log(contract);
      setweb3Api({ web3: web3Api.web3, provider: web3Api.provider, contract });
    };

    web3Api.web3 && getAccount();
    web3Api.web3 && getContract();
  }, [web3Api.web3]);

  useEffect(() => {
    // console.log(1);
    const loadBalance = async () => {
      try {
        // console.log(2);
        const { contract, web3 } = web3Api;
        // console.log("herer");
        const balance = await web3.eth.getBalance(contract._address);
        // console.log(balance + "1231111");
        // console.log(contract._address);
        setBalance(web3.utils.fromWei(balance, "ether"));
      } catch (error) {
        console.log(error);
      }
    };

    // When we have instance then only we will check balance of contract
    web3Api.contract && loadBalance();
  }, [web3Api, reload]);

  const transferFund = async () => {
    const { web3, contract } = web3Api;
    await contract.methods.transfer().send({
      from: account,
      value: web3.utils.toWei("2", "ether"),
    });
    reloadEffect();
  };

  const withdrawFund = async () => {
    const value = balance;
    if (parseInt(value) < 2) {
      window.alert("Contract does'nt have 2 Ether to give you back");
      return;
    }
    const { contract, web3 } = web3Api;
    const withdrawAmout = web3.utils.toWei("2", "ether");
    await contract.methods.withdraw(withdrawAmout).send({
      from: account,
    });
    reloadEffect();
  };

  // console.log(typeof balance);
  // console.log(account);
  // console.log(web3Api.web3);
  // console.log(web3Api.provider);
  // console.log(web3Api.contract);

  return (
    <div className="card text-center">
      <div className="card-header">Funding</div>
      <div className="card-body">
        <h5 className="card-title">Balance: {balance ? balance : "0"} Eth</h5>
        <p className="card-text">
          Account :{account ? account : "No account connected"}
        </p>
        {/* This button will invoke metaMask to get connect with our account in metamask */}
        {/* <button
          type="button"
          className="btn btn-success"
          onClick={async () => {
            const account = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            console.log(account);
          }}
        >
          Connect to network
        </button> */}
        &nbsp;
        <button
          type="button"
          className="btn btn-success"
          onClick={transferFund}
        >
          Transfer
        </button>
        &nbsp;
        <button
          type="button"
          className="btn btn-primary"
          onClick={withdrawFund}
        >
          WithDraw
        </button>
      </div>
    </div>
  );
}

export default App;
