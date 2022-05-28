import React, { useEffect, useState, useCallback, useContext } from "react";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import abiUniswap from "../abi/UniswapV2MiniABI";
import abiTokenMini from "../abi/TokenMiniABI";
import SwapCurrencyInput from "../components/SwapCurrencyInput";
import SwapContractInfo from "../components/SwapContractInfo";
import { SWAP_CONTRACT_ADDRESS } from "../constants/misc";
import { AccountContext } from "../App";

function SwapPage() {
  const currentAccount = useContext(AccountContext);
  console.log("currentAccount", currentAccount);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const uniswapSigner = new ethers.Contract(
    SWAP_CONTRACT_ADDRESS,
    abiUniswap,
    signer
  );
  const uniswapProvider = new ethers.Contract(
    SWAP_CONTRACT_ADDRESS,
    abiUniswap,
    provider
  );

  const [tokenAddresses, setTokenAddresses] = useState({
    a: undefined,
    b: undefined,
  });
  // const [data, setData] = useState({
  //   focusInputPos: 1,
  //   bsourceTokenID: 2,
  //   targetTokenID: 3,
  // });

  // setData({
  //   ...data,
  //   focusInputPos:5
  // })

  const [focusInputPos, setFocusInputPos] = useState("up"); // "up" or "down"
  const [sourceTokenID, setSourceTokenID] = useState("a"); // "a" or "b"
  const [targetTokenID, setTargetTokenID] = useState("b");
  const [sourceTokenBalance, setSourceTokenBalance] = useState(undefined);
  const [targetTokenBalance, setTargetTokenBalance] = useState(undefined);
  const [sourceTokenName, setSourceTokenName] = useState(undefined);
  const [targetTokenName, setTargetTokenName] = useState(undefined);
  const [sourceTokenSymbol, setSourceTokenSymbol] = useState(undefined);
  const [targetTokenSymbol, setTargetTokenSymbol] = useState(undefined);
  const [sourceTokenAmt, setSourceTokenAmt] = useState(
    ethers.utils.formatEther(0)
  );
  const [targetTokenAmt, setTargetTokenAmt] = useState(
    ethers.utils.formatEther(0)
  );
  const [swapPoolReserve0, setSwapPoolReserve0] = useState(
    ethers.utils.formatEther(0)
  );
  const [swapPoolReserve1, setSwapPoolReserve1] = useState(
    ethers.utils.formatEther(0)
  );

  useEffect(() => {
    const init = async () => {
      console.log(
        "useEffect(mount): initialize swap & tokens normal information"
      );

      let tmpAddressObj = {};

      if (!window.ethereum) return undefined;

      const uniswapProvider = new ethers.Contract(
        SWAP_CONTRACT_ADDRESS,
        abiUniswap,
        provider
      );

      const token0Address = await uniswapProvider.token0();
      const token1Address = await uniswapProvider.token1();

      // console.log(token0Address);
      // console.log(token1Address);

      setTokenAddresses({ a: token0Address, b: token1Address });

      const tokenA = new ethers.Contract(token0Address, abiTokenMini, provider);

      tokenA
        .name()
        .then((result) => {
          setSourceTokenName(result);
        })
        .catch("error", console.error);

      tokenA
        .symbol()
        .then((result) => {
          setSourceTokenSymbol(result);
        })
        .catch("error", console.error);

      updateSwapReserves(token0Address);

      const tokenB = new ethers.Contract(token1Address, abiTokenMini, provider);

      tokenB
        .name()
        .then((result) => {
          setTargetTokenName(result);
        })
        .catch("error", console.error);

      tokenB
        .symbol()
        .then((result) => {
          setTargetTokenSymbol(result);
        })
        .catch("error", console.error);

      return;

      uniswapProvider
        .token0()
        .then((result) => {
          tmpAddressObj["a"] = result;

          // setTokenAddresses(result);

          const tokenA = new ethers.Contract(result, abiTokenMini, provider);

          tokenA
            .name()
            .then((result) => {
              setSourceTokenName(result);
            })
            .catch("error", console.error);

          tokenA
            .symbol()
            .then((result) => {
              setSourceTokenSymbol(result);
            })
            .catch("error", console.error);

          updateSwapReserves(result);
        })
        .catch("error", console.error);

      uniswapProvider
        .token1()
        .then((result) => {
          tmpAddressObj["b"] = result;
          // setTokenAddresses((tokenAddresses) => [...tokenAddresses, result]);

          const tokenB = new ethers.Contract(result, abiTokenMini, provider);

          tokenB
            .name()
            .then((result) => {
              setTargetTokenName(result);
            })
            .catch("error", console.error);

          tokenB
            .symbol()
            .then((result) => {
              setTargetTokenSymbol(result);
            })
            .catch("error", console.error);
        })
        .catch("error", console.error);

      // setTokenAddresses(tmpAddressObj);
    };

    init();
  }, []);

  useEffect(() => {
    console.log("useEffect: tokenAddresses");
    if (tokenAddresses["a"] && tokenAddresses["b"]) {
      updateTokenBalances();
    }
  }, [tokenAddresses]);
  // useEffect(() => {
  //   // console.log("tokenAddresses", tokenAddresses);
  //   console.log("useEffect: set token balances for currentAccount");

  //   // console.log("currentAccount", currentAccount);

  //   if (!window.ethereum) return undefined;
  //   if (!currentAccount) {
  //     setSourceTokenBalance(undefined);
  //     setTargetTokenBalance(undefined);
  //     return undefined;
  //   }

  //   console.log("tokenAddresses", tokenAddresses);
  //   updateTokenBalances();
  // }, [currentAccount]);

  const handleSourceTokenAmount = (inputAmount) => {
    console.log("change on source token input: calc & set SwapTargetAmount");

    if (!window.ethereum) return undefined;

    setFocusInputPos("up");
    setSourceTokenAmt(inputAmount);
    calcSwapTargetAmount(sourceTokenID, inputAmount);
  };

  const handleTargetTokenAmount = (inputAmount) => {
    console.log("change on target token input: calc & set SwapSourceAmount");

    if (!window.ethereum) return undefined;

    setFocusInputPos("down");
    setTargetTokenAmt(inputAmount);
    calcSwapSourceAmount(targetTokenID, inputAmount);
  };

  const handleDirectionClick = () => {
    console.log(
      "click on direction button: replace token normal info, calc & set related SwapAmount"
    );

    if (!window.ethereum) return undefined;

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

    updateSwapReserves(tokenAddresses[targetTokenID]);
  };

  const handleDoSwapClick = () => {
    console.log("click on swap button: swap tokens");

    uniswapSigner
      .swap(tokenAddresses[sourceTokenID], parseEther(sourceTokenAmt))
      .then((tr) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`);
        tr.wait().then((receipt) => {
          console.log("transfer receipt", receipt);

          updateTokenBalances();
          setSourceTokenAmt(ethers.utils.formatEther(0));
          setTargetTokenAmt(ethers.utils.formatEther(0));
        });
      })
      .catch("error", console.error);
  };

  function updateSwapReserves(sourceTokenAddress) {
    console.log("function: update swap reserve amounts");

    uniswapProvider
      .token0()
      .then((result) => {
        const swapToken0Addr = result;

        uniswapProvider
          .getReserves()
          .then((result) => {
            const swapReserve0 =
              swapToken0Addr === sourceTokenAddress
                ? ethers.utils.formatEther(result._reserve0)
                : ethers.utils.formatEther(result._reserve1);

            const swapReserve1 =
              swapToken0Addr != sourceTokenAddress
                ? ethers.utils.formatEther(result._reserve0)
                : ethers.utils.formatEther(result._reserve1);

            setSwapPoolReserve0(swapReserve0);
            setSwapPoolReserve1(swapReserve1);
          })
          .catch("error", console.error);
      })
      .catch("error", console.error);
  }

  function updateTokenBalances() {
    console.log("function: update source,target token balances");
    console.log("tokenAddresses", tokenAddresses);
    // return;
    const tokenA = new ethers.Contract(
      tokenAddresses[sourceTokenID],
      abiTokenMini,
      provider
    );
    const tokenB = new ethers.Contract(
      tokenAddresses[targetTokenID],
      abiTokenMini,
      provider
    );

    tokenA
      .balanceOf(currentAccount)
      .then((result) => {
        setSourceTokenBalance(ethers.utils.formatEther(result));
      })
      .catch("error", console.error);

    tokenB
      .balanceOf(currentAccount)
      .then((result) => {
        setTargetTokenBalance(ethers.utils.formatEther(result));
      })
      .catch("error", console.error);

    // if (parseInt(r0) === 0 || parseInt(r1) === 0) {
    // const signer = provider.getSigner();
    // const uniswapSigner = new ethers.Contract(SWAP_CONTRACT_ADDRESS, abiUniswap, signer);

    // uniswapSigner
    // .addLiquidity(tokenAddresses[sourceTokenID], parseEther("5.0"), tokenAddresses[targetTokenID], parseEther("10.0"))
    // .then((tr) => {
    //     console.log(`TransactionResponse TX hash: ${tr.hash}`)
    //     tr.wait().then((receipt)=>{console.log("transfer receipt",receipt)});
    // })
    // .catch((e)=>console.log(e));
    // }
  }

  function calcSwapTargetAmount(tokenID, inputAmount) {
    console.log("function: calc & set SwapTargetAmount");

    if (Number(inputAmount) === 0) {
      setTargetTokenAmt(ethers.utils.formatEther(0));
      return;
    }

    uniswapProvider
      .getSwapTargetAmount(tokenAddresses[tokenID], parseEther(inputAmount))
      .then((result) => {
        setTargetTokenAmt(ethers.utils.formatEther(result));
      })
      .catch("error", console.error);
  }

  function calcSwapSourceAmount(tokenID, inputAmount) {
    console.log("function: calc & set SwapSourceAmount");

    if (Number(inputAmount) === 0) {
      setSourceTokenAmt(ethers.utils.formatEther(0));
      return;
    }

    uniswapProvider
      .getSwapSourceAmount(tokenAddresses[tokenID], parseEther(inputAmount))
      .then((result) => {
        setSourceTokenAmt(ethers.utils.formatEther(result));
      })
      .catch("error", console.error);
  }

  return (
    <div className="p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-center text-2xl">Swap</h2>

      <SwapCurrencyInput
        formType="Source"
        tokenName={sourceTokenName}
        tokenSymbol={sourceTokenSymbol}
        tokenAmount={sourceTokenAmt}
        tokenBalance={sourceTokenBalance}
        onTokenAmountChange={handleSourceTokenAmount}
      />

      <div className="w-full flex">
        <button
          className="mx-auto bg-sky-600 hover:bg-sky-700 text-white rounded-full px-[12px] py-[6px]"
          onClick={handleDirectionClick}
        >
          <b>&darr;</b>
        </button>
      </div>

      <SwapCurrencyInput
        formType="Target"
        tokenName={targetTokenName}
        tokenSymbol={targetTokenSymbol}
        tokenAmount={targetTokenAmt}
        tokenBalance={targetTokenBalance}
        onTokenAmountChange={handleTargetTokenAmount}
      />

      {currentAccount ? (
        <button
          className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-25"
          disabled={
            Number(sourceTokenAmt) === 0 || Number(targetTokenAmt) === 0
          }
          onClick={handleDoSwapClick}
        >
          <b>Swap</b>
        </button>
      ) : (
        <></>
      )}

      <SwapContractInfo
        swapContractAddress={SWAP_CONTRACT_ADDRESS}
        swapContractReserve0={swapPoolReserve0}
        swapContractReserve1={swapPoolReserve1}
        srcTokenName={sourceTokenName}
        srcTokenSymbol={sourceTokenSymbol}
        srcTokenAddress={tokenAddresses[sourceTokenID]}
        tarTokenName={targetTokenName}
        tarTokenSymbol={targetTokenSymbol}
        tarTokenAddress={tokenAddresses[targetTokenID]}
      />
    </div>
  );
}

export default SwapPage;