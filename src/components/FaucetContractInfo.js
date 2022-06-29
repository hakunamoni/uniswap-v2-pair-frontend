import React from "react";

function FaucetContractInfo(props) {
  const { tokenInfo, tokenBalances } = props;

  return (
    <fieldset className="w-96 mx-auto bg-slate-100 rounded-xl shadow-lg">
      {tokenInfo ? (
        <p className="pt-2 p-1">
          <b>
            Receive 1{tokenInfo.a.symbol}, 1{tokenInfo.b.symbol} per request!
          </b>
        </p>
      ) : (
        <></>
      )}

      {tokenBalances ? (
        <p className="p-1 text-slate-500">
          {tokenInfo.a.symbol} balance: {tokenBalances.a}
          <br /> {tokenInfo.b.symbol} balance: {tokenBalances.b}
        </p>
      ) : (
        <></>
      )}
    </fieldset>
  );
}

export default FaucetContractInfo;
