import React, { useEffect, useState, useCallback } from "react";
// import logo from './logo.svg';
import "./App.css";
import SwapPage from "./components/swap_page";
import MetamaskAccountInfo from "./components/metamask_account_info";
import { ethers } from "ethers";

// const INFURA_KEY = "c303c2e21a314ab6abd7a092e39c151c";
const SWAPCONTRACT_ADDR = "0x1B2E11C5BD2ED293d708721cc54ba9b462F0e86C";
const TOKENA_ADDR = "0x5eCf1D97D196c1590b30E2D5B4e00449C797cA3b";
const TOKENB_ADDR = "0x258B5D555a1522883Ff8E923DfdB688160f94Ac4";

// // // put the infura id in the .env file.
// const provider = new ethers.getDefaultProvider("ropsten", {
//   infura: INFURA_KEY,
// });

// async function getMyBalance(){
//   const balance = await provider.getBalance("0xe67C2DC72e00D927F127Bb7CA259F75ca7142ec8");
   
//   console.log(ethers.utils.formatEther(balance));
//   console.log(window.ethereum);
// }

function App() {
  // getMyBalance();
  const [ethereumBalance, setEthereumBalance] = useState(undefined);
  const [currentAccount, setCurrentAccount] = useState(undefined);
  const [chainId, setChainId] = useState(undefined);
  const [chainName, setChainName] = useState(undefined);
  const [isSwapPool, setSwapPool] = useState(true);
  // isSwapPool ? 'swap window' : 'liquidity window'

  const onClickSwapButton = () => {
    setSwapPool(true);
  };
  const onClickPoolButton = () => {
    setSwapPool(false);
  };

  useEffect(() => {
    console.log("useEffect for currentAccount in App.js has been called!");
    
    if (!currentAccount || !ethers.utils.isAddress(currentAccount)) return undefined;

    // client side code
    if(!window.ethereum) return undefined;

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    provider
    .getBalance(currentAccount)
    .then((resultEthBalance) => {
      setEthereumBalance(ethers.utils.formatEther(resultEthBalance));
    });

    provider
    .getNetwork()
    .then((result)=>{
      setChainId(result.chainId)
      setChainName(result.name)
    });
  }, [currentAccount]);

  const onClickConnectMetamask = () => {
    // client side code
    if(!window.ethereum) {
      console.log("Please install Metamask");
      return undefined;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // MetaMask requires requesting permission to connect users accounts
    provider
    .send("eth_requestAccounts", [])
    .then((retrievedAccounts) => {
      if (retrievedAccounts.length > 0) {
        setCurrentAccount(retrievedAccounts[0]);
      }
    })
    .catch((error) => {
      console.error('Failed to retrieve wallet accounts', error);
    });

  };

  const onClickDisconnectMetamask = () => {
    console.log("Clicked to disconnect Metamask");
    setEthereumBalance(undefined);
    setCurrentAccount(undefined);
  };

  return (
    // <div className="App max-w-screen-xl	m-auto">
    <div className="h-screen w-screen	m-auto bg-sky-100">
      <h1 className="text-center text-3xl font-bold pt-8">
        Uniswap V2 Pair (Mini) - D. S.
      </h1>
    
      <div className="m-5 p-2 w-fit mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-2">
        <button
          onClick={onClickSwapButton}
          className="content-center bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[32px] py-[12px]"
        >
          <b>Swap</b>
        </button>
        <button
          onClick={onClickPoolButton}
          className="content-center bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[32px] py-[12px]"
        >
          <b>Pool</b>
        </button>
      </div>

      <div className="p-3">
        {isSwapPool
          ? <SwapPage
              currentAccount = {currentAccount}
              addressContract = {SWAPCONTRACT_ADDR}
              addressTokenA = {TOKENA_ADDR}
              addressTokenB = {TOKENB_ADDR}
            />
          : <button>Pool</button>
        }
      </div>

      <div className="mt-5 p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
        {currentAccount
          ? <button
              className='p-3 w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]'
              onClick = {onClickDisconnectMetamask}>
              <b>Disconnect MetaMask</b>
            </button>
          : <button
              className='w-full p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]'
              onClick = {onClickConnectMetamask}>
              <b>Connect MetaMask</b>
            </button>
        }
        {currentAccount
          ? <MetamaskAccountInfo 
              currentAccount = {currentAccount}
              ethereumBalance = {ethereumBalance}
              chainId = {chainId}
              chainName = {chainName}
            />
          : <div className="w-96"></div>
        }
      </div>

      <div className="p-3">
        {currentAccount
          ? <></>
          : <></>
        }
      </div>

    </div>
  );
}

export default App;