import React from "react";

function MetamaskAccountInfo(props) {
    const currentAccount = props.currentAccount;
    const ethereumBalance = props.ethereumBalance;
    const chainId = props.chainId;
    const chainName = props.chainName;

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
          ETH balance: {ethereumBalance}
        </p>
        <p 
          className="p-1 text-slate-500">
          Chain info: chainid-{chainId} chainname-{chainName}
        </p>
      </fieldset>
    )
}

export default MetamaskAccountInfo;