import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { SWAP_CONTRACT_ADDRESS } from "../constants/misc";
import abiUniswap from "../abi/UniswapV2MiniABI";
import abiTokenMini from "../abi/TokenMiniABI";
import FaucetContractInfo from "../components/FaucetContractInfo";
import ButtonSpin from "../components/ButtonSpin";

function FaucetPage(props) {
  const { currentAccount, provider } = props;

  const [tokens, setTokens] = useState({ a: undefined, b: undefined });
  const [tokenInfo, setTokenInfo] = useState({
    a: { name: undefined, symbol: undefined, address: undefined },
    b: { name: undefined, symbol: undefined, address: undefined },
  });
  const [tokenBalances, setTokenBalances] = useState({
    a: undefined,
    b: undefined,
  });
  const [isFaucetClick, setIsFaucetClick] = useState(false);
  const [isProcessingFaucet, setIsProcessingFaucet] = useState(false);

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
  }, [currentAccount, tokens, isFaucetClick]);

  const handleDoFaucetClick = () => {
    console.log("click on faucet button: give tokens");

    setIsProcessingFaucet(true);

    async function fetchData() {
      if (currentAccount && tokens.a && tokens.b) {
        const signer = provider.getSigner();
        const tokenASigner = new ethers.Contract(
          tokenInfo.a.address,
          abiTokenMini,
          signer
        );
        const tokenBSigner = new ethers.Contract(
          tokenInfo.b.address,
          abiTokenMini,
          signer
        );

        await Promise.all([
          tokenASigner.faucet(currentAccount, parseEther("1")),
          tokenBSigner.faucet(currentAccount, parseEther("1")),
        ]);
        setIsProcessingFaucet(false);
        setIsFaucetClick(!isFaucetClick);
      } else {
      }
    }
    fetchData();
  };

  return (
    <div className="p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-center text-2xl">Faucet</h2>

      <ButtonSpin
        className="w-full mt-3 flex mx-auto bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-[6px] disabled:opacity-50"
        disabled={!currentAccount}
        isLoading={isProcessingFaucet}
        onClick={handleDoFaucetClick}
      >
        <b>
          Give me {tokenInfo.a.symbol}, {tokenInfo.b.symbol}
        </b>
      </ButtonSpin>

      <FaucetContractInfo tokenInfo={tokenInfo} tokenBalances={tokenBalances} />
    </div>
  );
}

export default FaucetPage;
