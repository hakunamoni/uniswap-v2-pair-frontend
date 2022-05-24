import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { parseEther } from 'ethers/lib/utils';
import abiUniswap from "../abi/UniswapV2MiniABI";
import abiTokenMini from "../abi/TokenMiniABI";
import SwapCurrencyInput from "./swap_currency_input";

function SwapPage(props) {
  const currentAccount = props.currentAccount;
  const addressContract = props.addressContract;
  const tokenAddresses = {
    a: props.addressTokenA,
    b: props.addressTokenB
  };

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const uniswapSigner = new ethers.Contract(addressContract, abiUniswap, signer);
  const uniswapProvider = new ethers.Contract(addressContract, abiUniswap, provider);

  const [focusInputPos, setFocusInputPos] = useState("up");   // "up" or "down"
  const [sourceTokenID, setSourceTokenID] = useState("a");    // "a" or "b"
  const [targetTokenID, setTargetTokenID] = useState("b");
  const [sourceTokenBalance, setSourceTokenBalance] = useState(undefined);
  const [targetTokenBalance, setTargetTokenBalance] = useState(undefined);
  const [sourceTokenAmt, setSourceTokenAmt] = useState(0);
  const [targetTokenAmt, setTargetTokenAmt] = useState(0);
  const [sourceTokenName, setSourceTokenName] = useState(undefined);
  const [targetTokenName, setTargetTokenName] = useState(undefined);
  const [sourceTokenSymbol, setSourceTokenSymbol] = useState(undefined);
  const [targetTokenSymbol, setTargetTokenSymbol] = useState(undefined);

  useEffect(() => {
    console.log("useEffect(mount): initialize token normal information");

    if(!window.ethereum) return undefined;

    const tokenA = new ethers.Contract(tokenAddresses[sourceTokenID], abiTokenMini, provider);
    const tokenB = new ethers.Contract(tokenAddresses[targetTokenID], abiTokenMini, provider);
    console.log("basic source: " + tokenAddresses[sourceTokenID]);
    console.log("basic target: " + tokenAddresses[targetTokenID]);

    tokenA
    .name()
    .then((result)=>{
      setSourceTokenName(result);
    }).catch('error', console.error);

    tokenA
    .symbol()
    .then((result)=>{
      setSourceTokenSymbol(result);
    }).catch('error', console.error);

    tokenB
    .name()
    .then((result)=>{
      setTargetTokenName(result);
    }).catch('error', console.error);

    tokenB
    .symbol()
    .then((result)=>{
      setTargetTokenSymbol(result);
    }).catch('error', console.error);

    tokenA
    .balanceOf(addressContract)
    .then((result)=>{
      console.log("uniswapProvider tokenA: ", ethers.utils.formatEther(result));
    })
    .catch('error', console.error);

    tokenB
    .balanceOf(addressContract)
    .then((result)=>{
      console.log("uniswapProvider tokenB: ", ethers.utils.formatEther(result));
    })
    .catch('error', console.error);
  }, []);

  useEffect(()=>{
    console.log("useEffect: set token balances for currentAccount");
    
    if(!window.ethereum) return undefined;
    if(!currentAccount) {
      setSourceTokenBalance(0);
      setTargetTokenBalance(0);
      return undefined;
    }

    updateTokenBalances();
  },[currentAccount])

  const handleSourceTokenAmount = (inputAmount) => {
    console.log("change on source token input: calc & set SwapTargetAmount");

    if(!window.ethereum) return undefined;

    setFocusInputPos("up");
    calcSwapTargetAmount(sourceTokenID, inputAmount);
    setSourceTokenAmt(inputAmount);
  };

  const handleTargetTokenAmount = (inputAmount) => {
    console.log("change on target token input: calc & set SwapSourceAmount");
    
    if(!window.ethereum) return undefined;
    
    setFocusInputPos("down");
    calcSwapSourceAmount(targetTokenID, inputAmount);
    setTargetTokenAmt(inputAmount);
  };

  const handleDirectionClick = () => {
    console.log("click on direction button: replace token normal info, calc & set related SwapAmount");

    if(!window.ethereum) return undefined;

    setSourceTokenName(targetTokenName);
    setTargetTokenName(sourceTokenName);

    setSourceTokenBalance(targetTokenBalance);
    setTargetTokenBalance(sourceTokenBalance);

    setSourceTokenID(targetTokenID);
    setTargetTokenID(sourceTokenID);

    setSourceTokenSymbol(targetTokenSymbol);
    setTargetTokenSymbol(sourceTokenSymbol);

    if (focusInputPos == "up") {
      setFocusInputPos("down");
      calcSwapSourceAmount(sourceTokenID, sourceTokenAmt);
      setTargetTokenAmt(sourceTokenAmt);
    } else {
      setFocusInputPos("up");
      calcSwapTargetAmount(targetTokenID, targetTokenAmt);
      setSourceTokenAmt(targetTokenAmt);
    }
  };

  const handleDoSwapClick = () => {
    console.log("click on swap button: swap tokens");

    uniswapSigner
    .swap(tokenAddresses[sourceTokenID], parseEther(sourceTokenAmt))
    .then((tr) => {
      console.log(`TransactionResponse TX hash: ${tr.hash}`)
      tr.wait().then((receipt)=>{
        console.log("transfer receipt",receipt);

        updateTokenBalances();
        setSourceTokenAmt(0);
        setTargetTokenAmt(0);
      });
    })
    .catch('error', console.error);
  };

  function updateTokenBalances(){
    console.log("function: update source,target token balances");

    const tokenA = new ethers.Contract(tokenAddresses[sourceTokenID], abiTokenMini, provider);
    const tokenB = new ethers.Contract(tokenAddresses[targetTokenID], abiTokenMini, provider);

    tokenA
    .balanceOf(currentAccount)
    .then((result)=>{
      setSourceTokenBalance(ethers.utils.formatEther(result));
    })
    .catch('error', console.error);

    tokenB
    .balanceOf(currentAccount)
    .then((result)=>{
      setTargetTokenBalance(ethers.utils.formatEther(result));
    })
    .catch('error', console.error);

    // uniswapProvider
    // .getReserves()
    // .then((result)=>{
    //   console.log("reserve0: ", ethers.utils.formatEther(result._reserve0));
    //   console.log("reserve1: ", ethers.utils.formatEther(result._reserve1));
    // }).catch('error', console.error);

    // if (parseInt(r0) === 0 || parseInt(r1) === 0) {
      // const signer = provider.getSigner();
      // const uniswapSigner = new ethers.Contract(addressContract, abiUniswap, signer);
  
      // uniswapSigner
      // .addLiquidity(tokenAddresses[sourceTokenID], parseEther("5.0"), tokenAddresses[targetTokenID], parseEther("10.0"))
      // .then((tr) => {
      //     console.log(`TransactionResponse TX hash: ${tr.hash}`)
      //     tr.wait().then((receipt)=>{console.log("transfer receipt",receipt)});
      // })
      // .catch((e)=>console.log(e));    
    // }
  }

  function calcSwapTargetAmount(tokenID, inputAmount){
    console.log("function: calc & set SwapTargetAmount");

    // uniswapProvider
    // .getReserves()
    // .then((result)=>{
    //   console.log("reserve0: ", ethers.utils.formatEther(result._reserve0));
    //   console.log("reserve1: ", ethers.utils.formatEther(result._reserve1));
    // }).catch('error', console.error);

    console.log(tokenID);
    console.log(inputAmount);
    // console.log(focusInputPos);

    uniswapProvider
    .getSwapTargetAmount(tokenAddresses[tokenID], parseEther(inputAmount))
    .then((result)=>{
      setTargetTokenAmt(ethers.utils.formatEther(result));
      console.log(ethers.utils.formatEther(result));
    })
    .catch('error', console.error);
  }

  function calcSwapSourceAmount(tokenID, inputAmount){
    console.log("function: calc & set SwapSourceAmount");
    
    // uniswapProvider
    // .getReserves()
    // .then((result)=>{
    //   console.log("reserve0: ", ethers.utils.formatEther(result._reserve0));
    //   console.log("reserve1: ", ethers.utils.formatEther(result._reserve1));
    // }).catch('error', console.error);

    console.log(tokenID);
    console.log(inputAmount);
    // console.log(focusInputPos);

    uniswapProvider
    .getSwapSourceAmount(tokenAddresses[tokenID], parseEther(inputAmount))
    .then((result)=>{
      setSourceTokenAmt(ethers.utils.formatEther(result));
      console.log(ethers.utils.formatEther(result));
    })
    .catch('error', console.error);
  }

  return (
    <div className="p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-center text-2xl">
        Swap
      </h2>
      <SwapCurrencyInput
        formType = "Source"
        tokenName={sourceTokenName}
        tokenSymbol={sourceTokenSymbol}
        tokenAmount={sourceTokenAmt}
        tokenBalance={sourceTokenBalance}
        onTokenAmountChange={handleSourceTokenAmount} />
      <div className='w-full flex'>
        <button
          className='mx-auto mt-3 bg-sky-600 hover:bg-sky-700 text-white rounded-full px-[12px] py-[6px]'
          onClick = {handleDirectionClick}>
          <b>&darr;</b>
        </button>
      </div>
      <SwapCurrencyInput
        formType = "Target"
        tokenName={targetTokenName}
        tokenSymbol={targetTokenSymbol}
        tokenAmount={targetTokenAmt}
        tokenBalance={targetTokenBalance}
        onTokenAmountChange={handleTargetTokenAmount} />
      {currentAccount
        ? <button
            className='mt-3 w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]'
            disabled={sourceTokenAmt === 0 || targetTokenAmt === 0}
            onClick = {handleDoSwapClick}>
            <b>Swap</b>
          </button>
        : <></>
      }
    </div>
  )
}

export default SwapPage;