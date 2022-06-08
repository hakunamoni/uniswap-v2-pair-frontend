import React from "react";

function PoolContractInfo(props) {
  const {
    swapContractAddress,
    poolReserve,
    tokenInfo,
    liquidityRate,
    shareOfPool,
    totalSupply,
    liquidityBalance,
    liquidityNewEstimate,
    txHash,
  } = props;

  return (
    <fieldset className="overflow-auto h-48 w-96 mx-auto bg-slate-100 rounded-xl">
      {txHash ? (
        <p className="p-1 text-slate-500">
          Provide Tx hash:{" "}
          <a
            href={"https://ropsten.etherscan.io/tx/" + txHash}
            className="text-blue-800"
            target="_blank"
            rel="noreferrer"
          >
            {txHash.slice(0, 15)}...{txHash.slice(-5)}
          </a>
        </p>
      ) : (
        <></>
      )}

      <p className="pt-2 p-1">Prices and pool share</p>
      {liquidityRate.bPerARate && liquidityRate.aPerBRate ? (
        <p className="p-1 text-slate-500">
          {tokenInfo.b.symbol} per {tokenInfo.a.symbol}:{" "}
          {liquidityRate.bPerARate}
          {", "}
          {tokenInfo.a.symbol} per {tokenInfo.b.symbol}:{" "}
          {liquidityRate.aPerBRate}
        </p>
      ) : (
        <></>
      )}

      {shareOfPool ? (
        <p className="p-1 text-slate-500">Share of Pool: {shareOfPool}%</p>
      ) : (
        <></>
      )}
      {liquidityNewEstimate ? (
        <p className="p-1 text-slate-500">
          Estimated liquidity: {liquidityNewEstimate}
        </p>
      ) : (
        <></>
      )}

      <p className="pt-2 p-1">Pool contract information</p>

      {swapContractAddress ? (
        <p className="p-1 text-slate-500">
          Contract:{" "}
          <a
            href={"https://ropsten.etherscan.io/token/" + swapContractAddress}
            className="text-blue-800"
            target="_blank"
            rel="noreferrer"
          >
            {swapContractAddress.slice(0, 15)}...{swapContractAddress.slice(-5)}
          </a>
        </p>
      ) : (
        <></>
      )}

      {poolReserve.a && poolReserve.b ? (
        <p className="p-1 text-slate-500">
          Pool reserves:
          {" ["}
          {Number(poolReserve.a).toFixed(7)}, {Number(poolReserve.b).toFixed(7)}
          {"]"}
        </p>
      ) : (
        <></>
      )}

      <p className="p-1 text-slate-500">Total supply: {totalSupply}</p>
      {liquidityBalance ? (
        <p className="p-1 text-slate-500">Balance of: {liquidityBalance}</p>
      ) : (
        <></>
      )}

      <p className="pt-2 p-1">Token A information</p>
      {tokenInfo.a.address ? (
        <p className="p-1 text-slate-500">
          Token:{" "}
          <a
            href={"https://ropsten.etherscan.io/token/" + tokenInfo.a.address}
            className="text-blue-800"
            target="_blank"
            rel="noreferrer"
          >
            {tokenInfo.a.address.slice(0, 15)}...
            {tokenInfo.a.address.slice(-5)}
          </a>
        </p>
      ) : (
        <></>
      )}
      <p className="p-1 text-slate-500">
        Token symbol: {tokenInfo.a.symbol}, Token name: {tokenInfo.a.name}
      </p>

      <p className="pt-2 p-1">Token B information</p>
      {tokenInfo.b.address ? (
        <p className="p-1 text-slate-500">
          Token:{" "}
          <a
            href={"https://ropsten.etherscan.io/token/" + tokenInfo.b.address}
            className="text-blue-800"
            target="_blank"
            rel="noreferrer"
          >
            {tokenInfo.b.address.slice(0, 15)}...
            {tokenInfo.b.address.slice(-5)}
          </a>
        </p>
      ) : (
        <></>
      )}
      <p className="p-1 text-slate-500">
        Token symbol: {tokenInfo.b.symbol}, Token name: {tokenInfo.b.name}
      </p>
    </fieldset>
  );
}

export default PoolContractInfo;
