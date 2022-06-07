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
  } = props;

  return (
    <fieldset className="overflow-auto h-48 w-96 mx-auto bg-slate-100 rounded-xl">
      <p className="pt-2 p-1">
        {/* <b className=""> */}
        Prices and pool share
        {/* </b> */}
      </p>
      {liquidityRate.bPerARate ? (
        <p className="p-1 text-slate-500">
          {tokenInfo.b.symbol} per {tokenInfo.a.symbol}:{" "}
          {liquidityRate.bPerARate}
          {/* <span className="text-sm">{swapContractAddress}</span> */}
        </p>
      ) : (
        <></>
      )}
      {liquidityRate.aPerBRate ? (
        <p className="p-1 text-slate-500">
          {tokenInfo.a.symbol} per {tokenInfo.b.symbol}:{" "}
          {liquidityRate.aPerBRate}
          {/* <span className="text-sm">{swapContractAddress}</span> */}
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

      <p className="pt-2 p-1">
        {/* <b className=""> */}
        Pool contract information
        {/* </b> */}
      </p>
      <p className="p-1 text-slate-500">
        Address: <span className="text-sm">{swapContractAddress}</span>
      </p>
      <p className="p-1 text-slate-500">
        Reserves: <br />
        <span className="text-sm">
          {"["}
          {poolReserve.a}, {poolReserve.b}
          {"]"}
        </span>
      </p>
      <p className="p-1 text-slate-500">Total supply: {totalSupply}</p>
      {liquidityBalance ? (
        <p className="p-1 text-slate-500">Balance of: {liquidityBalance}</p>
      ) : (
        <></>
      )}

      <p className="pt-2 p-1">
        {/* <b className=""> */}
        Source token information
        {/* </b> */}
      </p>
      <p className="p-1 text-slate-500">
        TokenSymbol: {tokenInfo.a.symbol}, TokenName: {tokenInfo.a.name}
      </p>
      <p className="p-1 text-slate-500">
        Address: <span className="text-sm">{tokenInfo.a.address}</span>
      </p>

      <p className="pt-2 p-1">
        {/* <b className=""> */}
        Target token information
        {/* </b> */}
      </p>
      <p className="p-1 text-slate-500">
        TokenSymbol: {tokenInfo.b.symbol}, TokenName: {tokenInfo.b.name}
      </p>
      <p className="p-1 text-slate-500">
        Address: <span className="text-sm">{tokenInfo.b.address}</span>
      </p>
    </fieldset>
  );
}

export default PoolContractInfo;
