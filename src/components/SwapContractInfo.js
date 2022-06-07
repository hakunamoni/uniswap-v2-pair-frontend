import React from "react";

function SwapContractInfo(props) {
  const {
    tar2srcRate,
    swapContractAddress,
    poolReserve,
    tokenInfo,
    srcTokenID,
    tarTokenID,
  } = props;

  return (
    <fieldset className="overflow-auto h-48 w-96 mx-auto bg-slate-100 rounded-xl">
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
      <p className="pt-2 p-1">
        {/* <b className=""> */}
        Swap contract information
        {/* </b> */}
      </p>
      <p className="p-1 text-slate-500">
        Address: <span className="text-sm">{swapContractAddress}</span>
      </p>
      <p className="p-1 text-slate-500">
        Reserves: <br />
        <span className="text-sm">
          {" "}
          {"["}
          {poolReserve[srcTokenID]}, {poolReserve[tarTokenID]}
          {"]"}
        </span>
      </p>

      <p className="pt-2 p-1">
        {/* <b className=""> */}
        Source token information
        {/* </b> */}
      </p>
      <p className="p-1 text-slate-500">
        TokenSymbol: {tokenInfo[srcTokenID].symbol}, TokenName:{" "}
        {tokenInfo[srcTokenID].name}
      </p>
      <p className="p-1 text-slate-500">
        Address:{" "}
        <span className="text-sm">{tokenInfo[srcTokenID].address}</span>
      </p>

      <p className="pt-2 p-1">
        {/* <b className=""> */}
        Target token information
        {/* </b> */}
      </p>
      <p className="p-1 text-slate-500">
        TokenSymbol: {tokenInfo[tarTokenID].symbol}, TokenName:{" "}
        {tokenInfo[tarTokenID].name}
      </p>
      <p className="p-1 text-slate-500">
        Address:{" "}
        <span className="text-sm">{tokenInfo[tarTokenID].address}</span>
      </p>
    </fieldset>
  );
}

export default SwapContractInfo;
