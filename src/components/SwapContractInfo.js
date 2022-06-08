import React from "react";

function SwapContractInfo(props) {
  const {
    tar2srcRate,
    swapContractAddress,
    poolReserve,
    tokenInfo,
    srcTokenID,
    tarTokenID,
    txHash,
  } = props;

  return (
    <fieldset className="overflow-auto h-48 w-96 mx-auto bg-slate-100 rounded-xl">
      {txHash ? (
        <p className="p-1 text-slate-500">
          Swap Tx hash:{" "}
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

      {tar2srcRate ? (
        <p className="p-1 text-slate-500">
          <b>
            1 {tokenInfo[tarTokenID].symbol} = {tar2srcRate}{" "}
            {tokenInfo[srcTokenID].symbol}
          </b>
        </p>
      ) : (
        <></>
      )}

      <p className="pt-2 p-1">Swap contract information</p>
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

      {poolReserve[srcTokenID] && poolReserve[tarTokenID] ? (
        <p className="p-1 text-slate-500">
          Pool reserves:
          {" ["}
          {Number(poolReserve[srcTokenID]).toFixed(7)},{" "}
          {Number(poolReserve[tarTokenID]).toFixed(7)}
          {"]"}
        </p>
      ) : (
        <></>
      )}

      <p className="pt-2 p-1">Source token information</p>
      {tokenInfo[srcTokenID].address ? (
        <p className="p-1 text-slate-500">
          Token:{" "}
          <a
            href={
              "https://ropsten.etherscan.io/token/" +
              tokenInfo[srcTokenID].address
            }
            className="text-blue-800"
            target="_blank"
            rel="noreferrer"
          >
            {tokenInfo[srcTokenID].address.slice(0, 15)}...
            {tokenInfo[srcTokenID].address.slice(-5)}
          </a>
        </p>
      ) : (
        <></>
      )}

      <p className="p-1 text-slate-500">
        Token symbol: {tokenInfo[srcTokenID].symbol}, Token name:{" "}
        {tokenInfo[srcTokenID].name}
      </p>

      <p className="pt-2 p-1">Target token information</p>
      {tokenInfo[tarTokenID].address ? (
        <p className="p-1 text-slate-500">
          Token:{" "}
          <a
            href={
              "https://ropsten.etherscan.io/token/" +
              tokenInfo[tarTokenID].address
            }
            className="text-blue-800"
            target="_blank"
            rel="noreferrer"
          >
            {tokenInfo[tarTokenID].address.slice(0, 15)}...
            {tokenInfo[tarTokenID].address.slice(-5)}
          </a>
        </p>
      ) : (
        <></>
      )}

      <p className="p-1 text-slate-500">
        Token symbol: {tokenInfo[tarTokenID].symbol}, Token name:{" "}
        {tokenInfo[tarTokenID].name}
      </p>
    </fieldset>
  );
}

export default SwapContractInfo;
