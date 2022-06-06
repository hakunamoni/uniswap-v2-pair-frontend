import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import abiUniswap from "../abi/UniswapV2MiniABI";
import abiTokenMini from "../abi/TokenMiniABI";
import SwapCurrencyInput from "../components/SwapCurrencyInput";
import SwapContractInfo from "../components/SwapContractInfo";
import { SWAP_CONTRACT_ADDRESS } from "../constants/misc";

function SwapPage(props) {
  const { currentAccount, provider, connectMetamask } = props;

  const [focusInputPos, setFocusInputPos] = useState(true); // true: "up", false: "down"
  const [sourceTokenID, setSourceTokenID] = useState("b"); // "a" or "b"
  const [targetTokenID, setTargetTokenID] = useState("a"); // "a" or "b"
  const [tokens, setTokens] = useState({ a: undefined, b: undefined });
  const [tokenInfo, setTokenInfo] = useState({
    a: { name: undefined, symbol: undefined, address: undefined },
    b: { name: undefined, symbol: undefined, address: undefined },
  });
  const [tokenBalances, setTokenBalances] = useState({
    a: undefined,
    b: undefined,
  });
  const [tokenAllowances, setTokenAllowances] = useState({
    a: undefined,
    b: undefined,
  });
  const [poolReserve, setPoolReserve] = useState({
    a: ethers.utils.formatEther(0),
    b: ethers.utils.formatEther(0),
  });
  const [sourceTokenAmt, setSourceTokenAmt] = useState(undefined);
  const [targetTokenAmt, setTargetTokenAmt] = useState(undefined);
  const [target2sourceRate, setTarget2sourceRate] = useState(undefined);
  const [isDirectionClick, setIsDirectionClick] = useState(true);
  const [isDoSwapClick, setIsDoSwapClick] = useState(false);
  // const [isApproveClick, setIsApproveClick] = useState(false);

  const uniswapProvider = new ethers.Contract(
    SWAP_CONTRACT_ADDRESS,
    abiUniswap,
    provider
  );

  // get token info
  useEffect(() => {
    console.log("useEffect(mount): get token info");

    async function fetchData() {
      // get token addrs
      const [addr0, addr1] = await Promise.all([
        uniswapProvider.token0(),
        uniswapProvider.token1(),
      ]);

      // set tokens
      const tokenA = new ethers.Contract(addr0, abiTokenMini, provider);
      const tokenB = new ethers.Contract(addr1, abiTokenMini, provider);

      // get token name,symbol
      const [name0, symbol0, name1, symbol1] = await Promise.all([
        tokenA.name(),
        tokenA.symbol(),
        tokenB.name(),
        tokenB.symbol(),
      ]);

      setTokenInfo({
        a: { name: name0, symbol: symbol0, address: addr0 },
        b: { name: name1, symbol: symbol1, address: addr1 },
      });

      setTokens({ a: tokenA, b: tokenB });

      console.log("tokeninfo", addr0, addr1, name0, symbol0, name1, symbol1);
    }
    fetchData();
  }, []);

  // get pool reserves
  useEffect(() => {
    console.log("useEffect: get pool reserves");

    async function fetchData() {
      if (tokenInfo.a.address && tokenInfo.b.address) {
        const [addr0, reserveObj] = await Promise.all([
          uniswapProvider.token0(),
          uniswapProvider.getReserves(),
        ]);
        tokenInfo.a.address === addr0
          ? setPoolReserve({
              a: ethers.utils.formatEther(reserveObj._reserve0),
              b: ethers.utils.formatEther(reserveObj._reserve1),
            })
          : setPoolReserve({
              a: ethers.utils.formatEther(reserveObj._reserve1),
              b: ethers.utils.formatEther(reserveObj._reserve0),
            });
      } else {
        setPoolReserve({ a: undefined, b: undefined });
      }
    }
    fetchData();
  }, [tokenInfo, isDoSwapClick]);

  // get token balances
  useEffect(() => {
    console.log("useEffect: get token balances");
    async function fetchData() {
      if (currentAccount && tokens.a && tokens.b) {
        const [bal0, bal1] = await Promise.all([
          tokens.a.balanceOf(currentAccount),
          tokens.b.balanceOf(currentAccount),
        ]);
        setTokenBalances({
          a: ethers.utils.formatEther(bal0),
          b: ethers.utils.formatEther(bal1),
        });
      } else {
        setTokenBalances({ a: undefined, b: undefined });
      }
    }
    fetchData();
  }, [currentAccount, tokens, isDoSwapClick]);

  // get token allowances
  useEffect(() => {
    console.log("useEffect: get token allowances");
    async function fetchData() {
      if (currentAccount && tokens.a && tokens.b) {
        const [allow0, allow1] = await Promise.all([
          tokens.a.allowance(currentAccount, SWAP_CONTRACT_ADDRESS),
          tokens.b.allowance(currentAccount, SWAP_CONTRACT_ADDRESS),
        ]);
        setTokenAllowances({
          a: ethers.utils.formatEther(allow0),
          b: ethers.utils.formatEther(allow1),
        });
        console.log(
          "allow0, allow1",
          ethers.utils.formatEther(allow0),
          ethers.utils.formatEther(allow1)
        );
      } else {
        setTokenAllowances({ a: undefined, b: undefined });
      }
    }
    fetchData();
  }, [currentAccount, tokens, isDoSwapClick]);

  // set target-to-source rate
  useEffect(() => {
    console.log("useEffect: set target-to-source rate");

    if (
      targetTokenAmt &&
      sourceTokenAmt &&
      Number(targetTokenAmt) !== 0 &&
      Number(sourceTokenAmt) !== 0
    ) {
      const rate = (Number(sourceTokenAmt) / Number(targetTokenAmt)).toFixed(7);
      setTarget2sourceRate(rate);
    } else {
      setTarget2sourceRate(undefined);
    }
  }, [sourceTokenAmt, targetTokenAmt]);

  // set target token amount
  useEffect(() => {
    console.log("useEffect: set target token amount");

    if (focusInputPos && sourceTokenAmt && Number(sourceTokenAmt) !== 0) {
      uniswapProvider
        .getSwapTargetAmount(
          tokenInfo[sourceTokenID].address,
          parseEther(sourceTokenAmt)
        )
        .then((result) => {
          setTargetTokenAmt(ethers.utils.formatEther(result));
        })
        .catch("error", console.error);
    }
  }, [sourceTokenAmt, focusInputPos, sourceTokenID, tokenInfo]);

  // set source token amount
  useEffect(() => {
    console.log("useEffect: set source token amount");

    if (!focusInputPos && targetTokenAmt && Number(targetTokenAmt) !== 0) {
      if (Number(targetTokenAmt) < Number(poolReserve[targetTokenID]))
        uniswapProvider
          .getSwapSourceAmount(
            tokenInfo[targetTokenID].address,
            parseEther(targetTokenAmt)
          )
          .then((result) => {
            setSourceTokenAmt(ethers.utils.formatEther(result));
          })
          .catch("error", console.error);
    }
  }, [targetTokenAmt, focusInputPos, poolReserve, targetTokenID, tokenInfo]);

  // do direction
  useEffect(() => {
    console.log("useEffect: for direction click");

    // invert selected currency input position
    setFocusInputPos(!focusInputPos);

    // exchange source,target token id
    setSourceTokenID(targetTokenID);
    setTargetTokenID(sourceTokenID);

    // update source/target token amount
    focusInputPos
      ? setTargetTokenAmt(sourceTokenAmt)
      : setSourceTokenAmt(targetTokenAmt);
  }, [isDirectionClick]);

  // reset source/target token amount as 0
  useEffect(() => {
    console.log("useEffect: set source,target TokenAmt for DoSwap Click");
    setSourceTokenAmt(undefined);
    setTargetTokenAmt(undefined);
  }, [isDoSwapClick]);

  const handleSourceTokenAmount = (inputAmount) => {
    console.log("change on source token input: calc & set SwapTargetAmount");
    setFocusInputPos(true);
    setSourceTokenAmt(inputAmount);
  };

  const handleTargetTokenAmount = (inputAmount) => {
    console.log("change on target token input: calc & set SwapSourceAmount");
    setFocusInputPos(false);
    setTargetTokenAmt(inputAmount);
  };

  const handleDirectionClick = () => {
    console.log("click on direction button");
    setIsDirectionClick(!isDirectionClick);
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
      .swap(tokenInfo[sourceTokenID].address, parseEther(sourceTokenAmt))
      .then((tr) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`);
        tr.wait().then((receipt) => {
          console.log("transfer receipt", receipt);

          setIsDoSwapClick(!isDoSwapClick);
        });
      })
      .catch("error", console.error);
  };

  const handleProtocolApproveClick = () => {
    console.log("click on approve protocol button: approve 1000 ethers");

    const signer = provider.getSigner();
    const tokenASigner = new ethers.Contract(
      tokenInfo[sourceTokenID].address,
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

  return (
    <div className="p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-center text-2xl">Swap</h2>
      <SwapCurrencyInput
        formType="Source"
        tokenName={tokenInfo[sourceTokenID].name}
        tokenSymbol={tokenInfo[sourceTokenID].symbol}
        tokenAmount={sourceTokenAmt}
        tokenBalance={tokenBalances[sourceTokenID]}
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
        tokenName={tokenInfo[targetTokenID].name}
        tokenSymbol={tokenInfo[targetTokenID].symbol}
        tokenAmount={targetTokenAmt}
        tokenBalance={tokenBalances[targetTokenID]}
        onTokenAmountChange={handleTargetTokenAmount}
      />

      {Number(tokenAllowances[sourceTokenID]) < Number(sourceTokenAmt) ? (
        <div className="w-96">
          <button
            className="w-full mb-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-[6px]"
            onClick={handleProtocolApproveClick}
          >
            <b>
              Allow this protocol to use your {tokenInfo[targetTokenID].symbol}
            </b>
          </button>
        </div>
      ) : (
        <></>
      )}

      {Number(targetTokenAmt) > Number(poolReserve[targetTokenID]) ? (
        <button
          className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
          disabled={true}
        >
          <b>Insufficient Reserve {tokenInfo[targetTokenID].symbol} balance</b>
        </button>
      ) : currentAccount ? (
        Number(sourceTokenAmt) === 0 || Number(targetTokenAmt) === 0 ? (
          <button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={true}
          >
            <b>Enter an amount</b>
          </button>
        ) : Number(sourceTokenAmt) > Number(tokenBalances[sourceTokenID]) ? (
          <button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={true}
          >
            <b>Insufficient {tokenInfo[sourceTokenID].symbol} balance</b>
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
        swapContractReserve0={poolReserve[sourceTokenID]}
        swapContractReserve1={poolReserve[targetTokenID]}
        srcTokenName={tokenInfo[sourceTokenID].name}
        srcTokenSymbol={tokenInfo[sourceTokenID].symbol}
        srcTokenAddress={tokenInfo[sourceTokenID].address}
        tarTokenName={tokenInfo[targetTokenID].name}
        tarTokenSymbol={tokenInfo[targetTokenID].symbol}
        tarTokenAddress={tokenInfo[targetTokenID].address}
      />
    </div>
  );
}

export default SwapPage;
