import React from 'react';

function SwapCurrencyInput(props) {
  const {
    formType,
    tokenAmount,
    tokenBalance,
    tokenName,
    tokenSymbol
  } = props;

  function handleTokenInputChange(e){
    console.log("handle on token input: pass input value");

    props.onTokenAmountChange(e.target.value);
  }

  return (
    <fieldset className="mb-3 p-2 w-96 mx-auto bg-slate-100 rounded-xl">
      <legend
        className="p-1">
        {formType} Token - <b>{tokenSymbol} </b>
      </legend>
      <input
        value={tokenAmount}
        onChange={handleTokenInputChange}
        className='p-1 border-2 border-white w-full bg-slate-100 rounded-xl' />
      <p 
        className="p-1 text-slate-500">
        Balance: {tokenBalance}
      </p>
    </fieldset>
  )
}

export default SwapCurrencyInput;