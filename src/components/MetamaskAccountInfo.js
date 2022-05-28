import React from "react";

function MetamaskAccountInfo(props) {

  const {
    currentAccount,
    ethBalance,
    chainId,
    chainName
  } = props;

  return (
    <fieldset className="w-96 mx-auto bg-slate-100 rounded-xl">
      <p className="pt-2 p-1">
        {/* <b className=""> */}
          Account information
        {/* </b> */}
      </p>
      <p 
        className="p-1 text-slate-500">
        Account: {currentAccount}
      </p>
      <p 
        className="p-1 text-slate-500">
        ETH Balance: {ethBalance}
      </p>
      <p 
        className="p-1 text-slate-500">
        Chain Info: ChainId-{chainId}, ChainName-{chainName}
      </p>
    </fieldset>
  )
}

export default MetamaskAccountInfo;