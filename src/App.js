import React, { useEffect, useState, useCallback } from "react";
// import logo from './logo.svg';
import "./App.css";
import SwapPage from "./components/swap_page";
import { ethers } from "ethers";

// // put the infura id in the .env file.
// const provider = new ethers.getDefaultProvider("homestead", {
//   infura: "c303c2e21a314ab6abd7a092e39c151c",
// });

function App() {
  const [isSwapPool, setSwapPool] = useState(true);
  // isSwapPool ? 'swap window' : 'liquidity window'

  const onClickSwapButton = () => {
    setSwapPool(true);
  };
  const onClickPoolButton = () => {
    setSwapPool(false);
  };

  let formPage;

  if (isSwapPool) {
    formPage = <SwapPage/>;
  } else {
    formPage = <button>Pool</button>;
  }

  return (
    // <div className="App max-w-screen-xl	m-auto">
    <div className="h-screen w-screen	m-auto bg-sky-100">
      <h1 className="text-center text-3xl font-bold pt-8">
        V2 Pair (Mini) - D. S.
      </h1>
    
      <div className="m-5 p-2 w-fit mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-2">
        <button
          onClick={onClickSwapButton}
          className="content-center bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[32px] py-[12px]"
        >
          <b>Swap</b>
        </button>
        <button
          onClick={onClickPoolButton}
          className="content-center bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[32px] py-[12px]"
        >
          <b>Pool</b>
        </button>
      </div>

      {/* <div className="p-3 w-fit mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4"> */}
      <div className="p-3">
        {/* <div className="shadow-md border border-grey-500 rounded-md"> */}
          {formPage}
        {/* </div> */}
      </div>

    </div>
  );
}

export default App;
