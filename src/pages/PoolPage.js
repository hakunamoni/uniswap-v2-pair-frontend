import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { SWAP_CONTRACT_ADDRESS } from "../constants/misc";
import abiUniswap from "../abi/UniswapV2MiniABI";
import abiTokenMini from "../abi/TokenMiniABI";
import PoolCurrencyInput from "../components/PoolCurrencyInput";
import PoolContractInfo from "../components/PoolContractInfo";
import ButtonSpin from "../components/ButtonSpin";

function PoolPage(props) {
  const { currentAccount, provider, connectMetamask } = props;

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
    a: undefined,
    b: undefined,
  });
  const [aTokenInputAmt, setATokenInputAmt] = useState(undefined);
  const [bTokenInputAmt, setBTokenInputAmt] = useState(undefined);
  const [liquidityTotal, setLiquidityTotal] = useState(undefined);
  const [liquidityBalance, setLiquidityBalance] = useState(undefined);
  const [liquidityNewEstimate, setLiquidityNewEstimate] = useState(undefined);
  const [isProvideClick, setIsProvideClick] = useState(false);
  const [isApproveClick, setIsApproveClick] = useState(false);
  const [isProcessingProvide, setIsProcessingProvide] = useState(false);
  const [isProcessingApproveA, setIsProcessingApproveA] = useState(false);
  const [isProcessingApproveB, setIsProcessingApproveB] = useState(false);
  const [provideTxHash, setProvideTxHash] = useState(undefined);

  const addLiquidityRate =
    poolReserve.a &&
    poolReserve.b &&
    Number(poolReserve.a) !== 0 &&
    Number(poolReserve.b) !== 0
      ? {
          bPerARate: (Number(poolReserve.b) / Number(poolReserve.a)).toFixed(6),
          aPerBRate: (Number(poolReserve.a) / Number(poolReserve.b)).toFixed(6),
        }
      : {
          bPerARate: undefined,
          aPerBRate: undefined,
        };
  const shareOfPool =
    liquidityNewEstimate && Number(liquidityNewEstimate) !== 0
      ? (
          (Number(liquidityNewEstimate) * 100) /
          (Number(liquidityNewEstimate) + Number(liquidityTotal))
        ).toFixed(2)
      : undefined;
  const isLiquidityEmpty = Number(liquidityTotal) === 0 ? true : false;

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
    }
    fetchData();
  }, []);

  // get pool reserves
  useEffect(() => {
    console.log("useEffect: get pool reserves");

    uniswapProvider
      .getReserves()
      .then((result) => {
        setPoolReserve({
          a: ethers.utils.formatEther(result._reserve0),
          b: ethers.utils.formatEther(result._reserve1),
        });
      })
      .catch("error", console.error);
  }, [isProvideClick]);

  // get liquidity totalsupply
  useEffect(() => {
    console.log("useEffect: get liquidity totalsupply");

    uniswapProvider
      .totalSupply()
      .then((result) => {
        setLiquidityTotal(ethers.utils.formatEther(result));
      })
      .catch("error", console.error);
  }, [isProvideClick]);

  // get liquidity balance
  useEffect(() => {
    console.log("useEffect: set lquidity balance for currentAccount");

    if (currentAccount)
      uniswapProvider
        .balanceOf(currentAccount)
        .then((result) => {
          setLiquidityBalance(ethers.utils.formatEther(result));
        })
        .catch("error", console.error);
  }, [currentAccount, isProvideClick]);

  // get token balances
  useEffect(() => {
    console.log("useEffect(mount): get token balances");

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
  }, [currentAccount, tokens, isProvideClick]);

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
      } else {
        setTokenAllowances({ a: undefined, b: undefined });
      }
    }
    fetchData();
  }, [currentAccount, tokens, isProvideClick, isApproveClick]);

  // reset A/B token amount as 0
  useEffect(() => {
    console.log("useEffect: set A,B TokenAmt for Provide Click");
    setATokenInputAmt(undefined);
    setBTokenInputAmt(undefined);
  }, [isProvideClick]);

  const handleATokenAmount = (inputAmount) => {
    console.log("change on A token input: calc B & new estimate amounts");

    const tmpBTokenInputAmt = isLiquidityEmpty
      ? bTokenInputAmt
      : Number(inputAmount) * Number(addLiquidityRate.bPerARate);
    const tmpliquidityNewEstimate = isLiquidityEmpty
      ? calcAddLiquidityTokenZero(inputAmount, tmpBTokenInputAmt)
      : calcAddLiquidityTokenExist(inputAmount, poolReserve.a, liquidityTotal);

    setATokenInputAmt(inputAmount);
    setBTokenInputAmt(tmpBTokenInputAmt);
    setLiquidityNewEstimate(tmpliquidityNewEstimate);
  };

  const handleBTokenAmount = (inputAmount) => {
    console.log("change on B token input: calc A & new estimate amounts");

    const tmpATokenInputAmt = isLiquidityEmpty
      ? aTokenInputAmt
      : Number(inputAmount) * Number(addLiquidityRate.aPerBRate);
    const tmpliquidityNewEstimate = isLiquidityEmpty
      ? calcAddLiquidityTokenZero(tmpATokenInputAmt, inputAmount)
      : calcAddLiquidityTokenExist(inputAmount, poolReserve.b, liquidityTotal);

    setATokenInputAmt(tmpATokenInputAmt);
    setBTokenInputAmt(inputAmount);
    setLiquidityNewEstimate(tmpliquidityNewEstimate);
  };

  const handleDoProvideClick = () => {
    console.log("click on provide button: add liquidity");

    const signer = provider.getSigner();
    const uniswapSigner = new ethers.Contract(
      SWAP_CONTRACT_ADDRESS,
      abiUniswap,
      signer
    );

    uniswapSigner
      .addLiquidity(
        tokenInfo.a.address,
        parseEther(aTokenInputAmt.toString()),
        tokenInfo.b.address,
        parseEther(bTokenInputAmt.toString())
      )
      .then((tr) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`);
        setIsProcessingProvide(true);
        setProvideTxHash(tr.hash);

        tr.wait().then((receipt) => {
          console.log("transfer receipt", receipt);

          setIsProcessingProvide(false);
          setIsProvideClick(!isProvideClick);
        });
      })
      .catch((e) => console.log(e));
  };

  const handleProtocolApproveAClick = () => {
    console.log("click on approve A protocol button: approve 1000 ethers");

    const signer = provider.getSigner();
    const tokenASigner = new ethers.Contract(
      tokenInfo.a.address,
      abiTokenMini,
      signer
    );

    tokenASigner
      .approve(SWAP_CONTRACT_ADDRESS, ethers.utils.parseEther(aTokenInputAmt))
      .then((tr) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`);
        setIsProcessingApproveA(true);

        tr.wait().then((receipt) => {
          console.log("transfer receipt", receipt);

          setIsProcessingApproveA(false);
          setIsApproveClick(!isApproveClick);
        });
      })
      .catch("error", console.error);
  };

  const handleProtocolApproveBClick = () => {
    console.log("click on approve B protocol button: approve 1000 ethers");

    const signer = provider.getSigner();
    const tokenBSigner = new ethers.Contract(
      tokenInfo.b.address,
      abiTokenMini,
      signer
    );

    tokenBSigner
      .approve(SWAP_CONTRACT_ADDRESS, ethers.utils.parseEther(bTokenInputAmt))
      .then((tr) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`);
        setIsProcessingApproveB(true);

        tr.wait().then((receipt) => {
          console.log("transfer receipt", receipt);

          setIsProcessingApproveB(false);
          setIsApproveClick(!isApproveClick);
        });
      })
      .catch("error", console.error);
  };

  // get liquidity amount for empty pool
  function calcAddLiquidityTokenZero(tmpAddTokenAmountA, tmpAddTokenAmountB) {
    return Math.sqrt(Number(tmpAddTokenAmountA) * Number(tmpAddTokenAmountB));
  }

  // get liquidity amount for existing pool
  function calcAddLiquidityTokenExist(addTokenAmt, tokenReserve, totalSupply) {
    return (Number(totalSupply) * Number(addTokenAmt)) / Number(tokenReserve);
  }

  return (
    <div className="p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-center text-2xl">Add Liquidity</h2>

      <PoolCurrencyInput
        formType="A"
        tokenSymbol={tokenInfo.a.symbol}
        tokenAmount={aTokenInputAmt}
        tokenBalance={tokenBalances.a}
        onTokenAmountChange={handleATokenAmount}
      />

      <div className="w-full mt-3 flex">
        <span className="mx-auto">+</span>
      </div>

      <PoolCurrencyInput
        formType="B"
        tokenSymbol={tokenInfo.b.symbol}
        tokenAmount={bTokenInputAmt}
        tokenBalance={tokenBalances.b}
        onTokenAmountChange={handleBTokenAmount}
      />

      {Number(tokenAllowances.a) < Number(aTokenInputAmt) &&
      Number(tokenAllowances.b) < Number(bTokenInputAmt) ? (
        <div className="w-96">
          <ButtonSpin
            className="w-full mt-3 flex mx-auto bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-[6px] disabled:opacity-50"
            disabled={isProcessingApproveA}
            isLoading={isProcessingApproveA}
            onClick={handleProtocolApproveAClick}
          >
            <b>Allow this protocol to use your {tokenInfo.a.symbol}</b>
          </ButtonSpin>
          <ButtonSpin
            className="w-full mt-3 flex mx-auto bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-[6px] disabled:opacity-50"
            disabled={isProcessingApproveB}
            isLoading={isProcessingApproveB}
            onClick={handleProtocolApproveBClick}
          >
            <b>Allow this protocol to use your {tokenInfo.b.symbol}</b>
          </ButtonSpin>
        </div>
      ) : Number(tokenAllowances.a) < Number(aTokenInputAmt) ? (
        <div className="w-96">
          <ButtonSpin
            className="w-full mt-3 flex mx-auto bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-[6px] disabled:opacity-50"
            disabled={isProcessingApproveA}
            isLoading={isProcessingApproveA}
            onClick={handleProtocolApproveAClick}
          >
            <b>Allow this protocol to use your {tokenInfo.a.symbol}</b>
          </ButtonSpin>
        </div>
      ) : Number(tokenAllowances.b) < Number(bTokenInputAmt) ? (
        <div className="w-96">
          <ButtonSpin
            className="w-full mt-3 flex mx-auto bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-[6px] disabled:opacity-50"
            disabled={isProcessingApproveB}
            isLoading={isProcessingApproveB}
            onClick={handleProtocolApproveBClick}
          >
            <b>Allow this protocol to use your {tokenInfo.b.symbol}</b>
          </ButtonSpin>
        </div>
      ) : (
        <></>
      )}

      {currentAccount ? (
        !aTokenInputAmt ||
        !bTokenInputAmt ||
        Number(aTokenInputAmt) === 0 ||
        Number(bTokenInputAmt) === 0 ? (
          <button
            className="w-full mt-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={true}
          >
            <b>Enter an amount</b>
          </button>
        ) : Number(aTokenInputAmt) > Number(tokenBalances.a) &&
          Number(bTokenInputAmt) > Number(tokenBalances.b) ? (
          <button
            className="w-full mt-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={true}
          >
            <b>
              Insufficient {tokenInfo.a.symbol},{tokenInfo.b.symbol} balances
            </b>
          </button>
        ) : Number(aTokenInputAmt) > Number(tokenBalances.a) ? (
          <button
            className="w-full mt-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={true}
          >
            <b>Insufficient {tokenInfo.a.symbol} balance</b>
          </button>
        ) : Number(bTokenInputAmt) > Number(tokenBalances.b) ? (
          <button
            className="w-full mt-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={true}
          >
            <b>Insufficient {tokenInfo.b.symbol} balance</b>
          </button>
        ) : (
          <ButtonSpin
            className="w-full mt-3 flex mx-auto bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-[6px] disabled:opacity-50"
            disabled={
              isProcessingProvide ||
              Number(tokenAllowances.a) < Number(aTokenInputAmt) ||
              Number(tokenAllowances.b) < Number(bTokenInputAmt)
            }
            isLoading={isProcessingProvide}
            onClick={handleDoProvideClick}
          >
            <b>Supply</b>
          </ButtonSpin>
        )
      ) : (
        <button
          className="w-full mt-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
          onClick={connectMetamask}
        >
          <b>Connect MetaMask</b>
        </button>
      )}

      <PoolContractInfo
        swapContractAddress={SWAP_CONTRACT_ADDRESS}
        poolReserve={poolReserve}
        tokenInfo={tokenInfo}
        liquidityRate={addLiquidityRate}
        shareOfPool={shareOfPool}
        totalSupply={liquidityTotal}
        liquidityBalance={liquidityBalance}
        liquidityNewEstimate={liquidityNewEstimate}
        txHash={provideTxHash}
      />
    </div>
  );
}

export default PoolPage;
