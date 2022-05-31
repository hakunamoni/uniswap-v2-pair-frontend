import React, { useEffect, useState, useCallback, useContext } from "react";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import abiUniswap from "../abi/UniswapV2MiniABI";
import abiTokenMini from "../abi/TokenMiniABI";
import SwapCurrencyInput from "../components/SwapCurrencyInput";
import SwapContractInfo from "../components/SwapContractInfo";
import { SWAP_CONTRACT_ADDRESS } from "../constants/misc";

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
  const [poolReserve, setPoolReserve] = useState({
    a: ethers.utils.formatEther(0),
    b: ethers.utils.formatEther(0),
  });
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
  const [totalLiquidityTokenAmt, setTotalLiquidityTokenAmt] = useState(
    ethers.utils.formatEther(0)
  );
  const [myLiquidityTokenAmt, setMyLiquidityTokenAmt] = useState(
    ethers.utils.formatEther(0)
  );
  const [newLiquidityTokenAmt, setNewLiquidityTokenAmt] = useState(
    ethers.utils.formatEther(0)
  );
  const [shareOfPool, setShareOfPool] = useState(undefined); // newLiquidityTokenAmt / totalLiquidityTokenAmt

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
    const tmpTotalLiquidityTokenAmt = getTotalSupply();
    let tmpAddressesObj = { a: undefined, b: undefined };
    let tmpNameSymbolObj = {
      a: { name: undefined, symbol: undefined },
      b: { name: undefined, symbol: undefined },
    };

    uniswapProvider
      .token0()
      .then((result) => {
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

    setPoolReserve(tmpPoolReserveObj);
    setTotalLiquidityTokenAmt(tmpTotalLiquidityTokenAmt);
    setTokenAddresses(tmpAddressesObj);
    setTokenNameSymbol(tmpNameSymbolObj);
  }, []);

  useEffect(() => {
    console.log("useEffect: update token balances for tokenAddresses");

    if (!currentAccount) return undefined;

    if (tokenAddresses["a"] && tokenAddresses["b"]) {
      setTokenBalances(getTokenBalances());
    }
  }, [tokenAddresses]);

  useEffect(() => {
    console.log("useEffect: set lquidity,token balances for currentAccount");

    if (!currentAccount) {
      setMyLiquidityTokenAmt(getBalanceOf());
      setTokenBalances({ a: undefined, b: undefined });
      return undefined;
    }

    setMyLiquidityTokenAmt(getBalanceOf());

    if (tokenAddresses.a && tokenAddresses.b) {
      setTokenBalances(getTokenBalances());
    }
  }, [currentAccount]);

  useEffect(() => {
    console.log("useEffect: update add liquidity rate for poolReserve");

    setMyLiquidityTokenAmt(getBalanceOf());

    // if (Number(poolReserve.a) == 0 || Number(poolReserve.b) == 0) {
    //   // set undefined
    // } else {

    // }
  }, [poolReserve]);

  const handleDoProvideClick = () => {
    console.log("click on provide button: add liquidity");

    // if (parseInt(poolReserve.a) === 0 || parseInt(poolReserve.b) === 0) {
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
          setSourceTokenAmt(ethers.utils.formatEther(0));
          setTargetTokenAmt(ethers.utils.formatEther(0));
        });
      })
      .catch((e) => console.log(e));
  };

  function getTokenBalances() {
    console.log("function: get source,target token balances");

    let tmpTokenBalances = { a: undefined, b: undefined };

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
        tmpTokenBalances.a = ethers.utils.formatEther(result);
      })
      .catch("error", console.error);

    tokenB
      .balanceOf(currentAccount)
      .then((result) => {
        tmpTokenBalances.b = ethers.utils.formatEther(result);
      })
      .catch("error", console.error);

    return tmpTokenBalances;
  }

  function getPoolReserves() {
    let tmpReserveObj = { a: undefined, b: undefined };

    uniswapProvider
      .getReserves()
      .then((result) => {
        tmpReserveObj = { a: result._reserve0, b: result._reserve1 };
      })
      .catch("error", console.error);

    return tmpReserveObj;
  }

  function getTotalSupply() {
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
    let tmpBalance;

    uniswapProvider
      .balanceOf(currentAccount)
      .then((result) => {
        tmpBalance = result;
      })
      .catch("error", console.error);

    return tmpBalance;
  }
}

export default PoolPage;
