import React, { useEffect, useState, useCallback, useContext } from "react";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import abiUniswap from "../abi/UniswapV2MiniABI";
import abiTokenMini from "../abi/TokenMiniABI";
import SwapCurrencyInput from "../components/SwapCurrencyInput";
import SwapContractInfo from "../components/SwapContractInfo";
import { SWAP_CONTRACT_ADDRESS } from "../constants/misc";

function SwapPage(props) {
  const { currentAccount, provider, connectMetamask } = props;

  const [tokenAddresses, setTokenAddresses] = useState({
    a: undefined,
    b: undefined,
  });
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
  const [target2sourceRate, setTarget2sourceRate] = useState(undefined);
  const [tokenAllowances, setTokenAllowances] = useState({
    a: undefined,
    b: undefined,
  });

  const uniswapProvider = new ethers.Contract(
    SWAP_CONTRACT_ADDRESS,
    abiUniswap,
    provider
  );

  useEffect(() => {
    console.log(
      "useEffect(mount): initialize swap & tokens normal information"
    );

    let tmpAddressesObj = { a: undefined, b: undefined };

    uniswapProvider
      .token0()
      .then((result) => {
        tmpAddressesObj["a"] = result;

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
        tmpAddressesObj["b"] = result;

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

    setTokenAddresses(tmpAddressesObj);
  }, []);

  useEffect(() => {
    console.log(
      "useEffect: update token balances,allowances for tokenAddresses"
    );

    if (!currentAccount) return undefined;

    if (tokenAddresses["a"] && tokenAddresses["b"]) {
      updateTokenBalances();
      updateTokenAllowances();
    }
  }, [tokenAddresses]);

  useEffect(() => {
    console.log("useEffect: set token balances,allowances for currentAccount");

    if (!currentAccount) {
      setSourceTokenBalance(undefined);
      setTargetTokenBalance(undefined);
      setTokenAllowances({ a: undefined, b: undefined });
      return undefined;
    }

    if (tokenAddresses["a"] && tokenAddresses["b"]) {
      updateTokenBalances();
      updateTokenAllowances();
    }
  }, [currentAccount]);

  useEffect(() => {
    console.log(
      "useEffect: update target2source rate for sourceTokenAmt, targetTokenAmt"
    );

    if (Number(targetTokenAmt) == 0 || Number(sourceTokenAmt) == 0) {
      setTarget2sourceRate(undefined);
    } else {
      const rate = (Number(sourceTokenAmt) / Number(targetTokenAmt)).toFixed(7);
      // .toString();
      setTarget2sourceRate(rate);
    }
  }, [sourceTokenAmt, targetTokenAmt]);

  // useEffect(() => {
  //   console.log("useEffect:  for tokenAllowances");

  //   console.log(tokenAllowances);
  // }, [tokenAllowances]);

  const handleSourceTokenAmount = (inputAmount) => {
    console.log("change on source token input: calc & set SwapTargetAmount");

    setFocusInputPos("up");
    setSourceTokenAmt(inputAmount);
    calcSwapTargetAmount(sourceTokenID, inputAmount);
  };

  const handleTargetTokenAmount = (inputAmount) => {
    console.log("change on target token input: calc & set SwapSourceAmount");

    setFocusInputPos("down");
    setTargetTokenAmt(inputAmount);
    calcSwapSourceAmount(targetTokenID, inputAmount);
  };

  const handleDirectionClick = () => {
    console.log(
      "click on direction button: replace token info, calc & set related SwapAmount"
    );

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
    } else if (focusInputPos == "down") {
      setFocusInputPos("up");
      calcSwapTargetAmount(targetTokenID, targetTokenAmt);
      setSourceTokenAmt(targetTokenAmt);
    }

    updateSwapReserves(tokenAddresses[targetTokenID]);
  };

  const handleDoSwapClick = () => {
    console.log("click on swap button: swap tokens");

    const signer = provider.getSigner();
    const uniswapSigner = new ethers.Contract(
      SWAP_CONTRACT_ADDRESS,
      abiUniswap,
      signer
    );

    uniswapSigner
      .swap(tokenAddresses[sourceTokenID], parseEther(sourceTokenAmt))
      .then((tr) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`);
        tr.wait().then((receipt) => {
          console.log("transfer receipt", receipt);

          updateTokenBalances();
          updateTokenAllowances();
          setSourceTokenAmt(ethers.utils.formatEther(0));
          setTargetTokenAmt(ethers.utils.formatEther(0));
        });
      })
      .catch("error", console.error);
  };

  const handleProtocolApproveClick = () => {
    console.log("click on approve protocol button: approve 1000 ethers");

    const signer = provider.getSigner();
    const tokenASigner = new ethers.Contract(
      tokenAddresses[sourceTokenID],
      abiTokenMini,
      signer
    );

    tokenASigner
      .approve(SWAP_CONTRACT_ADDRESS, ethers.utils.parseEther("1000"))
      .then((tr) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`);
        tr.wait().then((receipt) => {
          console.log("transfer receipt", receipt);
        });
      })
      .catch("error", console.error);
  };

  function updateSwapReserves(sourceTokenAddress) {
    console.log("function: get & set swap reserve amounts");

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
    console.log("function: get & set source,target token balances");

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
  }

  function updateTokenAllowances() {
    console.log("function: get & set source,target token allowances");

    let tmpTokenAllowances = { a: undefined, b: undefined };

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
      .allowance(currentAccount, SWAP_CONTRACT_ADDRESS)
      .then((result) => {
        tmpTokenAllowances.a = ethers.utils.formatEther(result);
      })
      .catch("error", console.error);

    tokenB
      .allowance(currentAccount, SWAP_CONTRACT_ADDRESS)
      .then((result) => {
        tmpTokenAllowances.b = ethers.utils.formatEther(result);
      })
      .catch("error", console.error);

    setTokenAllowances(tmpTokenAllowances);
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

      {Number(tokenAllowances[sourceTokenID]) < Number(sourceTokenAmt) ? (
        <div className="w-96">
          <button
            className="w-full mb-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-[6px]"
            onClick={handleProtocolApproveClick}
          >
            <b>Allow this protocol to use your {sourceTokenSymbol}</b>
          </button>
        </div>
      ) : (
        <></>
      )}

      {currentAccount ? (
        Number(sourceTokenAmt) === 0 || Number(targetTokenAmt) === 0 ? (
          <button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={true}
          >
            <b>Enter an amount</b>
          </button>
        ) : Number(sourceTokenAmt) > Number(sourceTokenBalance) ? (
          <button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={true}
          >
            <b>Insufficient {sourceTokenSymbol} balance</b>
          </button>
        ) : Number(targetTokenAmt) > Number(swapPoolReserve1) ? (
          <button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={true}
          >
            <b>Insufficient Reserve {targetTokenSymbol} balance</b>
          </button>
        ) : (
          <button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={
              Number(tokenAllowances[sourceTokenID]) < Number(sourceTokenAmt)
            }
            onClick={handleDoSwapClick}
          >
            <b>Swap</b>
          </button>
        )
      ) : (
        <button
          className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
          onClick={connectMetamask}
        >
          <b>Connect MetaMask</b>
        </button>
      )}

      <SwapContractInfo
        tar2srcRate={target2sourceRate}
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
