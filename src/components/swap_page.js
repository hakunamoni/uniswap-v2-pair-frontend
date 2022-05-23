import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { parseEther } from 'ethers/lib/utils';
import abiUniswap from "../abi/UniswapV2MiniABI";
import abiTokenMini from "../abi/TokenMiniABI";
import SwapCurrencyInput from "./swap_currency_input";

function SwapPage(props) {
  const currentAccount = props.currentAccount;
  const addressContract = props.addressContract;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const uniswapSigner = new ethers.Contract(addressContract, abiUniswap, signer);
  const uniswapProvider = new ethers.Contract(addressContract, abiUniswap, provider);

  const tokenAddresses = {
    a: props.addressTokenA,
    b: props.addressTokenB
  };

  const [focusInputPos, setFocusInputPos] = useState("up");   // "up" or "do" ("down")
  const [sourceTkIden, setSourceTkIden] = useState("a");    // "a" or "b"
  const [targetTkIden, setTargetTkIden] = useState("b");
  const [sourceTkBal, setSourceTkBal] = useState(undefined);
  const [targetTkBal, setTargetTkBal] = useState(undefined);
  const [sourceTkAmt, setSourceTkAmt] = useState(0);
  const [targetTkAmt, setTargetTkAmt] = useState(0);
  const [sourceTkName, setSourceTkName] = useState(undefined);
  const [targetTkName, setTargetTkName] = useState(undefined);
  const [sourceTkSymbol, setSourceTkSymbol] = useState(undefined);
  const [targetTkSymbol, setTargetTkSymbol] = useState(undefined);

  useEffect(() => {
    console.log("useEffect(mount): initialize token normal information");

    if(!window.ethereum) return undefined;

    const token_a = new ethers.Contract(tokenAddresses[sourceTkIden], abiTokenMini, provider);
    const token_b = new ethers.Contract(tokenAddresses[targetTkIden], abiTokenMini, provider);
    console.log("basic source: " + tokenAddresses[sourceTkIden]);
    console.log("basic target: " + tokenAddresses[targetTkIden]);

    token_a
    .name()
    .then((result)=>{
      setSourceTkName(result);
    }).catch('error', console.error);

    token_a
    .symbol()
    .then((result)=>{
      setSourceTkSymbol(result);
    }).catch('error', console.error);

    token_b
    .name()
    .then((result)=>{
      setTargetTkName(result);
    }).catch('error', console.error);

    token_b
    .symbol()
    .then((result)=>{
      setTargetTkSymbol(result);
    }).catch('error', console.error);

    token_a
    .balanceOf(addressContract)
    .then((result)=>{
      console.log("uniswapProvider token_a: ", ethers.utils.formatEther(result));
    })
    .catch('error', console.error);

    token_b
    .balanceOf(addressContract)
    .then((result)=>{
      console.log("uniswapProvider token_b: ", ethers.utils.formatEther(result));
    })
    .catch('error', console.error);
  }, []);

  useEffect(()=>{
    console.log("useEffect: set token balances for currentAccount");
    
    if(!window.ethereum) return undefined;
    if(!currentAccount) {
      setSourceTkBal(0);
      setTargetTkBal(0);
      return undefined;
    }

    updateTokenBalances();
  },[currentAccount])

  const handleSourceTkAmtChange = (inputAmount) => {
    console.log("handleChange for source token input: calc & set SwapTargetAmount");

    if(!window.ethereum) return undefined;

    setFocusInputPos("up");
    calcSwapTargetAmount(sourceTkIden, inputAmount);
    setSourceTkAmt(inputAmount);
  };

  const handleTargetTkAmtChange = (inputAmount) => {
    console.log("handleChange for target token input: calc & set SwapSourceAmount");
    
    if(!window.ethereum) return undefined;
    
    setFocusInputPos("do");
    calcSwapSourceAmount(targetTkIden, inputAmount);
    setTargetTkAmt(inputAmount);
  };

  const onDirectionClick = () => {
    console.log("onClick for direction: replace token normal info, calc & set related SwapAmount");

    if(!window.ethereum) return undefined;

    setSourceTkName(targetTkName);
    setTargetTkName(sourceTkName);

    setSourceTkBal(targetTkBal);
    setTargetTkBal(sourceTkBal);

    setSourceTkIden(targetTkIden);
    setTargetTkIden(sourceTkIden);

    setSourceTkSymbol(targetTkSymbol);
    setTargetTkSymbol(sourceTkSymbol);

    if (focusInputPos == "up") {
      setFocusInputPos("do");
      calcSwapSourceAmount(sourceTkIden, sourceTkAmt);
      setTargetTkAmt(sourceTkAmt);
    } else {
      setFocusInputPos("up");
      calcSwapTargetAmount(targetTkIden, targetTkAmt);
      setSourceTkAmt(targetTkAmt);
    }
  };

  const onDoSwapClick = () => {
    console.log("onClick for swap: swap tokens");

    uniswapSigner
    .swap(tokenAddresses[sourceTkIden], parseEther(sourceTkAmt))
    .then((tr) => {
      console.log(`TransactionResponse TX hash: ${tr.hash}`)
      tr.wait().then((receipt)=>{
        console.log("transfer receipt",receipt);

        updateTokenBalances();
        setSourceTkAmt(0);
        setTargetTkAmt(0);
      });
    })
    .catch('error', console.error);
  };

  async function updateTokenBalances(){
    console.log("function: update source,target token balances");

    const token_a = new ethers.Contract(tokenAddresses[sourceTkIden], abiTokenMini, provider);
    const token_b = new ethers.Contract(tokenAddresses[targetTkIden], abiTokenMini, provider);

    token_a
    .balanceOf(currentAccount)
    .then((result)=>{
      setSourceTkBal(ethers.utils.formatEther(result));
    })
    .catch('error', console.error);

    token_b
    .balanceOf(currentAccount)
    .then((result)=>{
      setTargetTkBal(ethers.utils.formatEther(result));
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
      // .addLiquidity(tokenAddresses[sourceTkIden], parseEther("5.0"), tokenAddresses[targetTkIden], parseEther("10.0"))
      // .then((tr) => {
      //     console.log(`TransactionResponse TX hash: ${tr.hash}`)
      //     tr.wait().then((receipt)=>{console.log("transfer receipt",receipt)});
      // })
      // .catch((e)=>console.log(e));    
    // }
  }

  async function calcSwapTargetAmount(tokenIdentifier, inputAmount){
    console.log("function: calc & set SwapTargetAmount");

    // uniswapProvider
    // .getReserves()
    // .then((result)=>{
    //   console.log("reserve0: ", ethers.utils.formatEther(result._reserve0));
    //   console.log("reserve1: ", ethers.utils.formatEther(result._reserve1));
    // }).catch('error', console.error);

    console.log(tokenIdentifier);
    console.log(inputAmount);
    // console.log(focusInputPos);

    uniswapProvider
    .getSwapTargetAmount(tokenAddresses[tokenIdentifier], parseEther(inputAmount))
    .then((result)=>{
      setTargetTkAmt(ethers.utils.formatEther(result));
      console.log(ethers.utils.formatEther(result));
    })
    .catch('error', console.error);
  }

  async function calcSwapSourceAmount(tokenIdentifier, inputAmount){
    console.log("function: calc & set SwapSourceAmount");
    
    // uniswapProvider
    // .getReserves()
    // .then((result)=>{
    //   console.log("reserve0: ", ethers.utils.formatEther(result._reserve0));
    //   console.log("reserve1: ", ethers.utils.formatEther(result._reserve1));
    // }).catch('error', console.error);

    console.log(tokenIdentifier);
    console.log(inputAmount);
    // console.log(focusInputPos);

    uniswapProvider
    .getSwapSourceAmount(tokenAddresses[tokenIdentifier], parseEther(inputAmount))
    .then((result)=>{
      setSourceTkAmt(ethers.utils.formatEther(result));
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
        tokenName={sourceTkName}
        tokenSymbol={sourceTkSymbol}
        tokenAmount={sourceTkAmt}
        tokenBalance={sourceTkBal}
        onChange={handleSourceTkAmtChange} />
      <div className='w-full flex'>
        <button
          className='mx-auto mt-3 bg-sky-600 hover:bg-sky-700 text-white rounded-full px-[12px] py-[6px]'
          onClick = {onDirectionClick}>
          <b>&darr;</b>
        </button>
      </div>
      <SwapCurrencyInput
        formType = "Target"
        tokenName={targetTkName}
        tokenSymbol={targetTkSymbol}
        tokenAmount={targetTkAmt}
        tokenBalance={targetTkBal}
        onChange={handleTargetTkAmtChange} />
      {currentAccount
        ? <button
            className='mt-3 w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]'
            disabled={sourceTkAmt === 0 || targetTkAmt === 0}
            onClick = {onDoSwapClick}>
            <b>Swap</b>
          </button>
        : <></>
      }
    </div>
  )
}

export default SwapPage;