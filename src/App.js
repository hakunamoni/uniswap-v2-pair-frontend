import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import abiUniswap from "./abi/UniswapV2MiniABI";
import SwapPage from "./pages/SwapPage";
import MetamaskAccountInfo from "./components/MetamaskAccountInfo";
import { ethers } from "ethers";
import {SWAP_CONTRACT_ADDRESS} from './constants/misc'

function App() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const [ethBalance, setEthBalance] = useState(undefined);
  const [currentAccount, setCurrentAccount] = useState(undefined);
  const [chainId, setChainId] = useState(undefined);
  const [chainName, setChainName] = useState(undefined);
  const [isSwapPool, setSwapPool] = useState(true);

  useEffect(() => {
    console.log("useEffect: set account information for currentAccount");
    
    if(!currentAccount || !ethers.utils.isAddress(currentAccount)) return undefined;
    if(!window.ethereum) return undefined;

    provider
    .getBalance(currentAccount)
    .then((result) => {
      setEthBalance(ethers.utils.formatEther(result));
    });

    provider
    .getNetwork()
    .then((result)=>{
      setChainId(result.chainId)
      setChainName(result.name)
    });
  }, [currentAccount]);

  const handleSwapPageClick = () => {
    setSwapPool(true);
  };
  const handlePoolPageClick = () => {
    setSwapPool(false);
  };

  const handleConnectMetamask = () => {
    console.log("onClick: connect Metamask");

    if(!window.ethereum) {
      console.log("Please install Metamask");
      return undefined;
    }

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

  const handleDisconnectMetamask = () => {
    console.log("onClick: disconnect Metamask");
    setEthBalance(undefined);
    setCurrentAccount(undefined);
  };

  return (
    <div className="h-screen w-screen	m-auto bg-sky-100">
      <h1 className="text-center text-3xl font-bold pt-8">
        Uniswap V2 Pair (Mini) - D. S.
      </h1>
    
      <div className="m-5 p-2 w-fit mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-2">
        <button
          onClick={handleSwapPageClick}
          className="content-center bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[32px] py-[12px]">
          <b>Swap</b>
        </button>
        <button
          onClick={handlePoolPageClick}
          className="content-center bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[32px] py-[12px]">
          <b>Pool</b>
        </button>
      </div>

      <div className="p-3">
        {isSwapPool
        ? <SwapPage
            currentAccount = {currentAccount}/>
        : <button>Pool</button>
        }
      </div>

      <div className="mt-5 p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
        {currentAccount
        ? <button
            className='p-3 w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]'
            onClick = {handleDisconnectMetamask}>
            <b>Disconnect MetaMask</b>
          </button>
        : <button
            className='w-full p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]'
            onClick = {handleConnectMetamask}>
            <b>Connect MetaMask</b>
          </button>
        }
        {currentAccount
        ? <MetamaskAccountInfo 
            currentAccount = {currentAccount}
            ethBalance = {ethBalance}
            chainId = {chainId}
            chainName = {chainName}/>
        : <div className="w-96"></div>
        }
      </div>
    </div>
  );
}

export default App;