import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import abiUniswap from "../abi/UniswapV2MiniABI";
import abiTokenMini from "../abi/TokenMiniABI";
import PoolCurrencyInput from "../components/PoolCurrencyInput";
import PoolContractInfo from "../components/PoolContractInfo";
import { SWAP_CONTRACT_ADDRESS } from "../constants/misc";

function usePoolReserves() {
  console.log("function: get uniswap pool reserves");

  const [poolReserve, setPoolReserve] = useState({
    a: ethers.utils.formatEther(0),
    b: ethers.utils.formatEther(0),
  });

  uniswapProvider
    .getReserves()
    .then((result) => {
      console.log(result);
      tmpReserveObj = { a: result._reserve0, b: result._reserve1 };
      setPoolReserve(tmpReserveObj);
    })
    .catch("error", console.error);

  return poolReserve;
}

function PoolPage(props) {
  const { currentAccount, provider, connectMetamask } = props;

  const [tokenAddresses, setTokenAddresses] = useState({
    a: undefined,
    b: undefined,
  });
  const [tokenNameSymbol, setTokenNameSymbol] = useState({
    a: { name: undefined, symbol: undefined },
    b: { name: undefined, symbol: undefined },
  });
  const [tokenBalances, setTokenBalances] = useState({
    a: undefined,
    b: undefined,
  });
  const [tokenAllowances, setTokenAllowances] = useState({
    a: undefined,
    b: undefined,
  });
  const [poolReserve, setPoolReserve] = usePoolReserves();
  const [addLiquidityRate, setAddLiquidityRate] = useState({
    targetPerSource: undefined, // poolReserve.b / poolReserve.a
    sourcePerTarget: undefined, // poolReserve.a / poolReserve.b
  });
  const [sourceTokenAmt, setSourceTokenAmt] = useState(
    ethers.utils.formatEther(0)
  );
  const [targetTokenAmt, setTargetTokenAmt] = useState(
    ethers.utils.formatEther(0)
  );
  const [liquidityTokenAmtTotal, setLiquidityTokenAmtTotal] = useState(
    ethers.utils.formatEther(0)
  );
  const [liquidityTokenAmtMine, setLiquidityTokenAmtMine] = useState(
    ethers.utils.formatEther(0)
  );
  const [liquidityTokenAmtEstimate, setLiquidityTokenAmtEstimate] = useState(
    ethers.utils.formatEther(0)
  );
  const [shareOfPool, setShareOfPool] = useState(0);
  // liquidityTokenAmtEstimate / (liquidityTokenAmtTotal + liquidityTokenAmtEstimate)
  const [isEmptyLiquidityPool, setIsEmptyLiquidityPool] = useState(true);

  const uniswapProvider = new ethers.Contract(
    SWAP_CONTRACT_ADDRESS,
    abiUniswap,
    provider
  );

  useEffect(() => {
    console.log(
      "useEffect(mount): initialize pool & tokens normal information"
    );

    const tmpPoolReserveObj = getPoolReserves();
    const tmpLiquidityTokenAmtTotal = getTotalSupply();
    let tmpAddressesObj = { a: undefined, b: undefined };
    let tmpNameSymbolObj = {
      a: { name: undefined, symbol: undefined },
      b: { name: undefined, symbol: undefined },
    };

    uniswapProvider
      .token0()
      .then((result) => {
        console.log(result);
        tmpAddressesObj.a = result;

        const tokenA = new ethers.Contract(result, abiTokenMini, provider);

        tokenA
          .name()
          .then((result) => {
            tmpNameSymbolObj.a.name = result;
          })
          .catch("error", console.error);

        tokenA
          .symbol()
          .then((result) => {
            tmpNameSymbolObj.a.symbol = result;
          })
          .catch("error", console.error);
      })
      .catch("error", console.error);

    uniswapProvider
      .token1()
      .then((result) => {
        tmpAddressesObj.b = result;

        const tokenB = new ethers.Contract(result, abiTokenMini, provider);

        tokenB
          .name()
          .then((result) => {
            tmpNameSymbolObj.b.name = result;
          })
          .catch("error", console.error);

        tokenB
          .symbol()
          .then((result) => {
            tmpNameSymbolObj.b.symbol = result;
          })
          .catch("error", console.error);
      })
      .catch("error", console.error);

    console.log("tmpPoolReserveObj", tmpPoolReserveObj);
    console.log("tmpLiquidityTokenAmtTotal", tmpLiquidityTokenAmtTotal);
    console.log("tmpAddressesObj", tmpAddressesObj);
    console.log("tmpNameSymbolObj", tmpNameSymbolObj);

    setPoolReserve(tmpPoolReserveObj);
    setLiquidityTokenAmtTotal(tmpLiquidityTokenAmtTotal);
    setTokenAddresses(tmpAddressesObj);
    setTokenNameSymbol(tmpNameSymbolObj);
  }, []);

  useEffect(() => {
    console.log(
      "useEffect: set token,lquidity balances & allowance for currentAccount,tokenAddresses"
    );

    let tmpTokenBalancesObj = { a: undefined, b: undefined };
    let tmpTokenAllowancesObj = { a: undefined, b: undefined };

    if (currentAccount && tokenAddresses.a && tokenAddresses.b) {
      tmpTokenBalancesObj = getTokenBalances();
      tmpTokenAllowancesObj = getTokenAllowances();
    }

    setTokenBalances(tmpTokenBalancesObj);
    setTokenAllowances(tmpTokenAllowancesObj);
  }, [currentAccount, tokenAddresses]);

  useEffect(() => {
    console.log("useEffect: set lquidity balance for currentAccount");

    let tmpLiquidityTokenAmtMine = ethers.utils.formatEther(0);

    if (currentAccount) {
      tmpLiquidityTokenAmtMine = getBalanceOf();
    }

    setLiquidityTokenAmtMine(tmpLiquidityTokenAmtMine);
  }, [currentAccount]);

  useEffect(() => {
    console.log("useEffect: update add liquidity rate for poolReserve");

    let tmpAddLiquidityRateObj = {
      targetPerSource: undefined,
      sourcePerTarget: undefined,
    };

    if (Number(poolReserve.a) == 0 || Number(poolReserve.b) == 0) {
      // set undefined
    } else {
      tmpAddLiquidityRateObj = {
        targetPerSource: Number(poolReserve.b) / Number(poolReserve.a),
        sourcePerTarget: Number(poolReserve.a) / Number(poolReserve.b),
      };

      // tmpAddLiquidityRateObj = {
      //   targetPerSource: (
      //     Number(poolReserve.b) / Number(poolReserve.a)
      //   ).toFixed(6),
      //   sourcePerTarget: (
      //     Number(poolReserve.a) / Number(poolReserve.b)
      //   ).toFixed(6),
      // };
    }

    setAddLiquidityRate(tmpAddLiquidityRateObj);
  }, [poolReserve]);

  useEffect(() => {
    console.log(
      "useEffect: update share of pool for liquidityTokenAmt Estimate"
    );

    const tmpShareOfPool = calcShareOfPool(
      liquidityTokenAmtEstimate,
      liquidityTokenAmtTotal
    );

    setShareOfPool(tmpShareOfPool);
  }, [liquidityTokenAmtEstimate, liquidityTokenAmtTotal]);

  useEffect(() => {
    console.log(
      "useEffect: update isEmpty LiquidityPool for liquidityTokenAmt Total (totalsupply)"
    );

    const tmpIsEmptyLiquidityPool =
      Number(liquidityTokenAmtTotal) == 0 ? true : false;

    setIsEmptyLiquidityPool(tmpIsEmptyLiquidityPool);
  }, [liquidityTokenAmtTotal]);

  const handleSourceTokenAmount = (inputAmount) => {
    console.log(
      "change on source token input: calc target & set token amounts"
    );

    const tmpSourceTokenAmt = inputAmount;
    const tmpTargetTokenAmt = isEmptyLiquidityPool
      ? targetTokenAmt
      : Number(tmpSourceTokenAmt) * Number(addLiquidityRate.targetPerSource);
    // : calcTargetTokenAmt(tmpSourceTokenAmt);
    const tmpLiquidityTokenAmtEstimate = isEmptyLiquidityPool
      ? calcAddLiquidityTokenZero(tmpSourceTokenAmt, tmpTargetTokenAmt)
      : calcAddLiquidityTokenExist(
          tmpSourceTokenAmt,
          poolReserve.a,
          liquidityTokenAmtTotal
        );

    setSourceTokenAmt(tmpSourceTokenAmt);
    setTargetTokenAmt(tmpTargetTokenAmt);
    setLiquidityTokenAmtEstimate(tmpLiquidityTokenAmtEstimate);
  };

  const handleTargetTokenAmount = (inputAmount) => {
    console.log(
      "change on target token input: calc source & set token amounts"
    );

    const tmpTargetTokenAmt = inputAmount;
    const tmpSourceTokenAmt = isEmptyLiquidityPool
      ? sourceTokenAmt
      : Number(tmpTargetTokenAmt) * Number(addLiquidityRate.sourcePerTarget);
    // : calcSourceTokenAmt(tmpTargetTokenAmt);
    const tmpLiquidityTokenAmtEstimate = isEmptyLiquidityPool
      ? calcAddLiquidityTokenZero(tmpSourceTokenAmt, tmpTargetTokenAmt)
      : calcAddLiquidityTokenExist(
          tmpTargetTokenAmt,
          poolReserve.b,
          liquidityTokenAmtTotal
        );

    setSourceTokenAmt(tmpSourceTokenAmt);
    setTargetTokenAmt(tmpTargetTokenAmt);
    setLiquidityTokenAmtEstimate(tmpLiquidityTokenAmtEstimate);
  };

  const handleDoProvideClick = () => {
    console.log("click on provide button: add liquidity");

    // if (isEmptyLiquidityPool) {
    //   // first time to add tokens to liquidity
    // } else {
    //   // add tokens to existing liquidity
    // }

    const signer = provider.getSigner();
    const uniswapSigner = new ethers.Contract(
      SWAP_CONTRACT_ADDRESS,
      abiUniswap,
      signer
    );

    uniswapSigner
      .addLiquidity(
        tokenAddresses.a,
        parseEther(sourceTokenAmt),
        tokenAddresses.b,
        parseEther(targetTokenAmt)
      )
      .then((tr) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`);
        tr.wait().then((receipt) => {
          console.log("transfer receipt", receipt);

          setPoolReserve(getPoolReserves());
          setTokenBalances(getTokenBalances());
          setTokenAllowances(getTokenAllowances());
          setLiquidityTokenAmtMine(getBalanceOf());
          setLiquidityTokenAmtTotal(getTotalSupply());
          setSourceTokenAmt(ethers.utils.formatEther(0));
          setTargetTokenAmt(ethers.utils.formatEther(0));
        });
      })
      .catch((e) => console.log(e));
  };

  // function calcTargetTokenAmt(tmpSourceTokenAmt) {
  //   return (Number(poolReserve.b) * tmpSourceTokenAmt) / Number(poolReserve.a);
  // }

  // function calcSourceTokenAmt(tmpTargetTokenAmt) {
  //   return (Number(poolReserve.a) * tmpTargetTokenAmt) / Number(poolReserve.b);
  // }

  function calcAddLiquidityTokenZero(tmpAddTokenAmountA, tmpAddTokenAmountB) {
    return Math.sqrt(Number(tmpAddTokenAmountA) * Number(tmpAddTokenAmountB));
  }

  function calcAddLiquidityTokenExist(
    tmpAddTokenAmt,
    tmpTokenReserve,
    tmpTotalSupply
  ) {
    return (
      (Number(tmpTotalSupply) * Number(tmpAddTokenAmt)) /
      Number(tmpTokenReserve)
    );
  }

  function calcShareOfPool(tmpLiquidityAdd, tmpLiquidityTotalSupply) {
    return (
      Number(tmpLiquidityAdd) /
      (Number(tmpLiquidityAdd) + Number(tmpLiquidityTotalSupply))
    );
  }

  function getTokenBalances() {
    console.log("function: get source,target token balances");

    let tmpTokenBalancesObj = { a: undefined, b: undefined };

    const tokenA = new ethers.Contract(
      tokenAddresses.a,
      abiTokenMini,
      provider
    );
    const tokenB = new ethers.Contract(
      tokenAddresses.b,
      abiTokenMini,
      provider
    );

    tokenA
      .balanceOf(currentAccount)
      .then((result) => {
        tmpTokenBalancesObj.a = ethers.utils.formatEther(result);
      })
      .catch("error", console.error);

    tokenB
      .balanceOf(currentAccount)
      .then((result) => {
        tmpTokenBalancesObj.b = ethers.utils.formatEther(result);
      })
      .catch("error", console.error);

    return tmpTokenBalancesObj;
  }

  function getTokenAllowances() {
    console.log("function: get source,target token allowances");

    let tmpTokenAllowancesObj = { a: undefined, b: undefined };

    const tokenA = new ethers.Contract(
      tokenAddresses.a,
      abiTokenMini,
      provider
    );
    const tokenB = new ethers.Contract(
      tokenAddresses.b,
      abiTokenMini,
      provider
    );

    tokenA
      .allowance(currentAccount, SWAP_CONTRACT_ADDRESS)
      .then((result) => {
        tmpTokenAllowancesObj.a = ethers.utils.formatEther(result);
      })
      .catch("error", console.error);

    tokenB
      .allowance(currentAccount, SWAP_CONTRACT_ADDRESS)
      .then((result) => {
        tmpTokenAllowancesObj.b = ethers.utils.formatEther(result);
      })
      .catch("error", console.error);

    return tmpTokenAllowancesObj;
  }

  function getTotalSupply() {
    console.log("function: get uniswap total supply");

    let tmpTotalSupply;

    uniswapProvider
      .totalSupply()
      .then((result) => {
        tmpTotalSupply = result;
      })
      .catch("error", console.error);

    return tmpTotalSupply;
  }

  function getBalanceOf() {
    console.log("function: get uniswap balance");

    let tmpBalance;

    return uniswapProvider
      .balanceOf(currentAccount)
      .then((result) => {
        tmpBalance = result;
      })
      .catch("error", console.error);
  }

  return (
    <div className="p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-center text-2xl">Add Liquidity</h2>

      <PoolCurrencyInput
        formType="A"
        tokenName={tokenNameSymbol.a.name}
        tokenSymbol={tokenNameSymbol.a.symbol}
        tokenAmount={sourceTokenAmt}
        tokenBalance={tokenBalances.a}
        onTokenAmountChange={handleSourceTokenAmount}
      />

      <div className="w-full flex">
        <span className="mx-auto">+</span>
      </div>

      <PoolCurrencyInput
        formType="B"
        tokenName={tokenNameSymbol.b.name}
        tokenSymbol={tokenNameSymbol.b.symbol}
        tokenAmount={targetTokenAmt}
        tokenBalance={tokenBalances.b}
        onTokenAmountChange={handleTargetTokenAmount}
      />

      {/* {Number(tokenAllowances[sourceTokenID]) < Number(sourceTokenAmt) ? (
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
      )} */}

      {/* {currentAccount ? (
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
      )} */}

      <PoolContractInfo
        // tar2srcRate={target2sourceRate}
        swapContractAddress={SWAP_CONTRACT_ADDRESS}
        swapContractReserve0={poolReserve.a}
        swapContractReserve1={poolReserve.b}
        srcTokenName={tokenNameSymbol.a.name}
        srcTokenSymbol={tokenNameSymbol.a.symbol}
        srcTokenAddress={tokenAddresses.a}
        tarTokenName={tokenNameSymbol.b.name}
        tarTokenSymbol={tokenNameSymbol.b.symbol}
        tarTokenAddress={tokenAddresses.b}
      />
    </div>
  );
}

export default PoolPage;
