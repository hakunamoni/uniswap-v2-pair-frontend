import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import SwapPage from "./components/swap_page";
import MetamaskAccountInfo from "./components/metamask_account_info";
import { ethers } from "ethers";

const SWAPCONTRACT_ADDR = "0x1B2E11C5BD2ED293d708721cc54ba9b462F0e86C";
const TOKENA_ADDR = "0x5eCf1D97D196c1590b30E2D5B4e00449C797cA3b";
const TOKENB_ADDR = "0x258B5D555a1522883Ff8E923DfdB688160f94Ac4";

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

  const onSwapPageClick = () => {
    setSwapPool(true);
  };
  const onPoolPageClick = () => {
    setSwapPool(false);
  };

  const onConnectMetamaskClick = () => {
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

  const onDisconnectMetamaskClick = () => {
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
          onClick={onSwapPageClick}
          className="content-center bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[32px] py-[12px]">
          <b>Swap</b>
        </button>
        <button
          onClick={onPoolPageClick}
          className="content-center bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[32px] py-[12px]">
          <b>Pool</b>
        </button>
      </div>

      <div className="p-3">
        {isSwapPool
          ? <SwapPage
              currentAccount = {currentAccount}
              addressContract = {SWAPCONTRACT_ADDR}
              addressTokenA = {TOKENA_ADDR}
              addressTokenB = {TOKENB_ADDR}/>
          : <button>Pool</button>
        }
      </div>

      <div className="mt-5 p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
        {currentAccount
          ? <button
              className='p-3 w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]'
              onClick = {onDisconnectMetamaskClick}>
              <b>Disconnect MetaMask</b>
            </button>
          : <button
              className='w-full p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]'
              onClick = {onConnectMetamaskClick}>
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

      {/* <div className="p-3">
        {currentAccount
          ? <></>
          : <></>
        }
      </div> */}
    </div>
  );
}

export default App;