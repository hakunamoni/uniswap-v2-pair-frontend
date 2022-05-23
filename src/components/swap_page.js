import React, { useEffect, useState, useCallback } from "react";
import abiUniswap from "../abi/UniswapV2MiniABI";
import abiTokenMini from "../abi/TokenMiniABI";
import SwapCurrencyInput from "./swap_currency_input";
import { ethers } from "ethers";
import { parseEther } from 'ethers/lib/utils';

function SwapPage(props) {
    const currentAccount = props.currentAccount;
    const addressContract = props.addressContract;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const uniswapsigner = new ethers.Contract(addressContract, abiUniswap, signer);
    const uniswapprovider = new ethers.Contract(addressContract, abiUniswap, provider);
    // const token_a = new ethers.Contract(tokenAddresses[sourceTokenIden], abiTokenMini, provider);
    // const token_b = new ethers.Contract(tokenAddresses[targetTokenIden], abiTokenMini, provider);

    const tokenAddresses = {
        a: props.addressTokenA,
        b: props.addressTokenB
    };

    const [cursorInputPos, setCursorInputPos] = useState("up");
    // const [cursorInputAmt, setCursorInputAmt] = useState(0);
    const [sourceTokenIden, setSourceTokenIden] = useState("a");
    const [targetTokenIden, setTargetTokenIden] = useState("b");
    const [sourceTokenBalance, setSourceTokenBalance] = useState(undefined);
    const [targetTokenBalance, setTargetTokenBalance] = useState(undefined);
    const [sourceTokenAmount, setSourceTokenAmount] = useState(0);
    const [targetTokenAmount, setTargetTokenAmount] = useState(0);
    const [sourceTokenName, setSourceTokenName] = useState(undefined);
    const [targetTokenName, setTargetTokenName] = useState(undefined);
    const [sourceTokenSymbol, setSourceTokenSymbol] = useState(undefined);
    const [targetTokenSymbol, setTargetTokenSymbol] = useState(undefined);

    async function getSourceTargetBalance(){
        console.log("getSourceTargetBalance has been called!");

        const token_a = new ethers.Contract(tokenAddresses[sourceTokenIden], abiTokenMini, provider);
        const token_b = new ethers.Contract(tokenAddresses[targetTokenIden], abiTokenMini, provider);

        token_a
        .balanceOf(currentAccount)
        .then((result)=>{
            setSourceTokenBalance(Number(ethers.utils.formatEther(result)))
        })
        .catch('error', console.error);

        token_b
        .balanceOf(currentAccount)
        .then((result)=>{
            setTargetTokenBalance(Number(ethers.utils.formatEther(result)))
        })
        .catch('error', console.error);

            uniswapprovider
            .getReserves()
            .then((result)=>{
                console.log("reserve0: ", ethers.utils.formatEther(result._reserve0));
                console.log("reserve1: ", ethers.utils.formatEther(result._reserve1));
            }).catch('error', console.error);

        // if (parseInt(r0) === 0 || parseInt(r1) === 0) {
            // const signer = provider.getSigner();
            // const uniswapsigner = new ethers.Contract(addressContract, abiUniswap, signer);
        
            // uniswapsigner
            // .addLiquidity(tokenAddresses[sourceTokenIden], parseEther("5.0"), tokenAddresses[targetTokenIden], parseEther("10.0"))
            // .then((tr) => {
            //     console.log(`TransactionResponse TX hash: ${tr.hash}`)
            //     tr.wait().then((receipt)=>{console.log("transfer receipt",receipt)});
            // })
            // .catch((e)=>console.log(e));    
        // }
    }

    async function calcSwapTargetAmount(tokenIdentity, inputAmount){
        console.log("calc & set SwapTargetAmount has been called!");
 
            uniswapprovider
            .getReserves()
            .then((result)=>{
                console.log("reserve0: ", ethers.utils.formatEther(result._reserve0));
                console.log("reserve1: ", ethers.utils.formatEther(result._reserve1));
            }).catch('error', console.error);

        console.log(tokenIdentity);
        console.log(inputAmount);
        // console.log(cursorInputPos);
    
        uniswapprovider
        .getSwapTargetAmount(tokenAddresses[tokenIdentity], parseEther(inputAmount))
        .then((result)=>{
            setTargetTokenAmount(Number(ethers.utils.formatEther(result)));
            console.log(ethers.utils.formatEther(result));
        })
        .catch('error', console.error);
    }

    async function calcSwapSourceAmount(tokenIdentity, inputAmount){
        console.log("calc & set SwapSourceAmount has been called!");
       
            uniswapprovider
            .getReserves()
            .then((result)=>{
                console.log("reserve0: ", ethers.utils.formatEther(result._reserve0));
                console.log("reserve1: ", ethers.utils.formatEther(result._reserve1));
            }).catch('error', console.error);

        console.log(tokenIdentity);
        console.log(inputAmount);
        // console.log(cursorInputPos);

        uniswapprovider
        .getSwapSourceAmount(tokenAddresses[tokenIdentity], parseEther(inputAmount))
        .then((result)=>{
            setSourceTokenAmount(Number(ethers.utils.formatEther(result)));
            console.log(ethers.utils.formatEther(result));
        })
        .catch('error', console.error);
    }

    //called only once
    useEffect(() => {
        console.log("useEffect for mount has been called!");

        if(!window.ethereum) return undefined;

        const token_a = new ethers.Contract(tokenAddresses[sourceTokenIden], abiTokenMini, provider);
        const token_b = new ethers.Contract(tokenAddresses[targetTokenIden], abiTokenMini, provider);
        console.log("basic source: " + tokenAddresses[sourceTokenIden]);
        console.log("basic target: " + tokenAddresses[targetTokenIden]);

        token_a
        .name()
        .then((result)=>{
            setSourceTokenName(result);
        }).catch('error', console.error);

        token_a
        .symbol()
        .then((result)=>{
            setSourceTokenSymbol(result);
        }).catch('error', console.error);

        token_b
        .name()
        .then((result)=>{
            setTargetTokenName(result);
        }).catch('error', console.error);

        token_b
        .symbol()
        .then((result)=>{
            setTargetTokenSymbol(result);
        }).catch('error', console.error);

        token_a
        .balanceOf(addressContract)
        .then((result)=>{
            console.log("uniswapprovider token_a: ", ethers.utils.formatEther(result));
            // setTargetTokenBalance(Number(ethers.utils.formatEther(result)))
        })
        .catch('error', console.error);

        token_b
        .balanceOf(addressContract)
        .then((result)=>{
            console.log("uniswapprovider token_b: ", ethers.utils.formatEther(result));
            // setTargetTokenBalance(Number(ethers.utils.formatEther(result)))
        })
        .catch('error', console.error);


    }, []);

    // useEffect(()=>{
    //     console.log("useEffect for cursorInputAmt in swap_page has been called!");
       
    //     if(!window.ethereum) return undefined;
    //     // if(!currentAccount) {
    //     //     setSourceTokenBalance(undefined);
    //     //     setTargetTokenBalance(undefined);
    //     //     return undefined;
    //     // } else {
    //     //     getSourceTargetBalance(window)
            
    //     // }

    //     const provider = new ethers.providers.Web3Provider(window.ethereum);
    //     const uniswapprovider = new ethers.Contract(addressContract, abiUniswap, provider);

    //     uniswapprovider
    //     .balanceOf(currentAccount)
    //     .then((result)=>{
    //         setSourceTokenBalance(Number(ethers.utils.formatEther(result)))
    //     })
    //     .catch('error', console.error);
    // },[cursorInputAmt])

    useEffect(()=>{
        console.log("useEffect for currentAccount in swap_page has been called!");
       
        if(!window.ethereum) return undefined;
        if(!currentAccount) {
            setSourceTokenBalance(0);
            setTargetTokenBalance(0);
            return undefined;
        }

        getSourceTargetBalance();
    },[currentAccount])

    const onChangeSourceTokenAmount = (inputAmount) => {
        console.log("Changed Source Token Amount");

        if(!window.ethereum) return undefined;

        setCursorInputPos("up");
        calcSwapTargetAmount(sourceTokenIden, inputAmount);
        setSourceTokenAmount(inputAmount);
    };

    const onChangeTargetTokenAmount = (inputAmount) => {
        console.log("Changed Target Token Amount");
       
        if(!window.ethereum) return undefined;
        
        setCursorInputPos("do");
        calcSwapSourceAmount(targetTokenIden, inputAmount);
        setTargetTokenAmount(inputAmount);
    };

    const onClickDirectionButton = () => {
        console.log("Changed Token Direction");

        if(!window.ethereum) return undefined;

        const newTargetTokenName = sourceTokenName;
        setSourceTokenName(targetTokenName);
        setTargetTokenName(newTargetTokenName);

        const newTargetTokenBalance = sourceTokenBalance;
        setSourceTokenBalance(targetTokenBalance);
        setTargetTokenBalance(newTargetTokenBalance);

        const newTargetTokenIden = sourceTokenIden;
        setSourceTokenIden(targetTokenIden);
        setTargetTokenIden(newTargetTokenIden);

        const newTargetTokenSymbol = sourceTokenSymbol;
        setSourceTokenSymbol(targetTokenSymbol);
        setTargetTokenSymbol(newTargetTokenSymbol);

        // const newCursorInputPos = cursorInputPos == "up" ? "do" : "up";
        // console.log(cursorInputPos);
        // console.log(newCursorInputPos);

        if (cursorInputPos == "up") {
            setCursorInputPos("do");
            // setCursorInputPos(newCursorInputPos);
            calcSwapSourceAmount(sourceTokenIden, sourceTokenAmount);
            setTargetTokenAmount(sourceTokenAmount);
        } else {
            setCursorInputPos("up");
            // setCursorInputPos(newCursorInputPos);
            calcSwapTargetAmount(targetTokenIden, targetTokenAmount);
            setSourceTokenAmount(targetTokenAmount);
        }
        
        // console.log("source: " + tokenAddresses[sourceTokenIden]);
        // console.log("target: " + tokenAddresses[targetTokenIden]);
    };

    const onClickSwapButton = () => {
        console.log("Click Swap Button");

        uniswapsigner
        .swap(tokenAddresses[sourceTokenIden], parseEther(sourceTokenAmount))
        .then((tr) => {
            console.log(`TransactionResponse TX hash: ${tr.hash}`)
            tr.wait().then((receipt)=>{
                console.log("transfer receipt",receipt);
                getSourceTargetBalance();
                setSourceTokenAmount(0);
                setTargetTokenAmount(0);
            });
        })
        .catch('error', console.error);

    };

    return (
        <div className="p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
            <h2 className="text-center text-2xl">
                Swap
            </h2>
            <SwapCurrencyInput
                formType = "Source"
                tokenName={sourceTokenName}
                tokenSymbol={sourceTokenSymbol}
                tokenAmount={sourceTokenAmount}
                tokenBalance={sourceTokenBalance}
                onCurrencyInputChange={onChangeSourceTokenAmount} />
            <div className='w-full flex'>
                <button
                    className='mx-auto mt-3 bg-sky-600 hover:bg-sky-700 text-white rounded-full px-[12px] py-[6px]'
                    onClick = {onClickDirectionButton}>
                    <b>&darr;</b>
                </button>
            </div>
            <SwapCurrencyInput
                formType = "Target"
                tokenName={targetTokenName}
                tokenSymbol={targetTokenSymbol}
                tokenAmount={targetTokenAmount}
                tokenBalance={targetTokenBalance}
                onCurrencyInputChange={onChangeTargetTokenAmount} />
            {currentAccount
                ?   <button
                        className='mt-3 w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]'
                        disabled={sourceTokenAmount === 0 || targetTokenAmount === 0}
                        onClick = {onClickSwapButton}>
                        <b>Swap</b>
                    </button>
                :   <></>
            }
        </div>
    )
}

export default SwapPage;