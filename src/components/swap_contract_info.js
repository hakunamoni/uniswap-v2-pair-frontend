import React from "react";

function SwapContractInfo(props) {
  let swapContractAddress, swapContractReserve0, swapContractReserve1, srcTokenName, srcTokenSymbol, srcTokenAddress, tarTokenName, tarTokenSymbol, tarTokenAddress;
  [swapContractAddress, swapContractReserve0, swapContractReserve1, srcTokenName, srcTokenSymbol, srcTokenAddress, tarTokenName, tarTokenSymbol, tarTokenAddress] 
    = [props.swapContractAddress, props.swapContractReserve0, props.swapContractReserve1, props.srcTokenName, props.srcTokenSymbol, props.srcTokenAddress, props.tarTokenName, props.tarTokenSymbol, props.tarTokenAddress];

  return (
    <fieldset className="overflow-auto h-32 w-96 mx-auto bg-slate-100 rounded-xl">
      <p className="pt-2 p-1">
        {/* <b className=""> */}
          Swap contract information
        {/* </b> */}
      </p>
      <p className="p-1 text-slate-500">
        Address: <span className="text-sm">{swapContractAddress}</span>
      </p>
      <p className="p-1 text-slate-500">
        Reserves: {"["}{swapContractReserve0}, {swapContractReserve1}{"]"}
      </p>

      <p className="pt-2 p-1">
        {/* <b className=""> */}
          Source token information
        {/* </b> */}
      </p>
      <p className="p-1 text-slate-500">
        TokenSymbol: {srcTokenSymbol}, TokenName: {srcTokenName}
      </p>
      <p className="p-1 text-slate-500">
        Address: <span className="text-sm">{srcTokenAddress}</span>
      </p>

      <p className="pt-2 p-1">
        {/* <b className=""> */}
          Target token information
        {/* </b> */}
      </p>
      <p className="p-1 text-slate-500">
        TokenSymbol: {tarTokenSymbol}, TokenName: {tarTokenName}
      </p>
      <p className="p-1 text-slate-500">
        Address: <span className="text-sm">{tarTokenAddress}</span>
      </p>
     </fieldset>
  )
}

export default SwapContractInfo;