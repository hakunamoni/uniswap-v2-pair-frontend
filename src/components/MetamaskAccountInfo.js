import React from "react";

function MetamaskAccountInfo(props) {
  const { currentAccount, ethBalance, chainId, chainName } = props;

  return (
    <fieldset className="w-96 mx-auto bg-slate-100 rounded-xl">
      <p className="pt-2 p-1">Account information</p>

      {currentAccount ? (
        <p className="p-1 text-slate-500">
          Account:{" "}
          <a
            href={"https://ropsten.etherscan.io/address/" + currentAccount}
            className="text-blue-800"
            target="_blank"
            rel="noreferrer"
          >
            {currentAccount.slice(0, 15)}...
            {currentAccount.slice(-5)}
          </a>
        </p>
      ) : (
        <></>
      )}

      <p className="p-1 text-slate-500">Eth balance: {ethBalance}</p>

      <p className="pt-2 p-1">Chain information</p>
      <p className="p-1 text-slate-500">
        Chain id: {chainId}, Chain name: {chainName}
      </p>
    </fieldset>
  );
}

export default MetamaskAccountInfo;
