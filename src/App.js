import React, { useEffect, useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Link,
  useMatch,
  useResolvedPath,
  Navigate,
} from "react-router-dom";
import "./App.css";
import SwapPage from "./pages/SwapPage";
import MetamaskAccountInfo from "./components/MetamaskAccountInfo";
import { ethers } from "ethers";

export const AccountContext = React.createContext(undefined);

function App() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const [ethBalance, setEthBalance] = useState(undefined);
  const [currentAccount, setCurrentAccount] = useState(undefined);
  const [chainId, setChainId] = useState(undefined);
  const [chainName, setChainName] = useState(undefined);

  useEffect(() => {
    console.log("useEffect: set account information for currentAccount");

    if (!currentAccount || !ethers.utils.isAddress(currentAccount))
      return undefined;
    if (!window.ethereum) return undefined;

    provider.getBalance(currentAccount).then((result) => {
      setEthBalance(ethers.utils.formatEther(result));
    });

    provider.getNetwork().then((result) => {
      setChainId(result.chainId);
      setChainName(result.name);
    });
  }, [currentAccount]);

  const handleConnectMetamask = () => {
    console.log("onClick: connect Metamask");

    if (!window.ethereum) {
      console.log("Please install Metamask");
      return undefined;
    }

    // MetaMask requires requesting permission to connect users accounts
    provider
      .send("eth_requestAccounts", [])
      .then((retrievedAccounts) => {
        if (retrievedAccounts.length > 0) {
          setCurrentAccount(retrievedAccounts[0]);
        }
      })
      .catch((error) => {
        console.error("Failed to retrieve wallet accounts", error);
      });
  };

  const handleDisconnectMetamask = () => {
    console.log("onClick: disconnect Metamask");
    setEthBalance(undefined);
    setCurrentAccount(undefined);
  };

  function Layout() {
    return (
      <div className="h-screen w-screen	m-auto bg-sky-100">
        <h1 className="text-center text-2xl font-bold py-5">
          Uniswap V2 Pair (Mini) - D. S.
        </h1>

        <div className="w-fit mx-auto bg-white rounded-xl shadow-lg">
          {currentAccount ? (
            <button
              className="p-1 w-96 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]"
              onClick={handleDisconnectMetamask}
            >
              <b>Disconnect MetaMask</b>
            </button>
          ) : (
            <button
              className="p-1 w-96 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]"
              onClick={handleConnectMetamask}
            >
              <b>Connect MetaMask</b>
            </button>
          )}
          {/* {currentAccount
          ? <MetamaskAccountInfo 
              currentAccount = {currentAccount}
              ethBalance = {ethBalance}
              chainId = {chainId}
              chainName = {chainName}/>
          : <div className="w-96"></div>
          } */}
        </div>

        <div className="m-5 p-1 w-fit mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-2">
          <CustomLink to="/swap">
            <b>Swap</b>
          </CustomLink>
          <CustomLink to="/pool">
            <b>Pool</b>
          </CustomLink>
        </div>

        <Outlet />
      </div>
    );
  }

  return (
    // <>
    //   {currentAccount ? (
    //     <button
    //       className="p-1 w-96 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]"
    //       onClick={handleDisconnectMetamask}
    //     >
    //       <b>Disconnect MetaMask</b>
    //     </button>
    //   ) : (
    //     <button
    //       className="p-1 w-96 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]"
    //       onClick={handleConnectMetamask}
    //     >
    //       <b>Connect MetaMask</b>
    //     </button>
    //   )}

    //   <SwapPage currentAccount={currentAccount} />
    // </>
    <AccountContext.Provider value={currentAccount}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index path="/" element={<Home />} />
            <Route path="swap" element={<SwapPage />} />
            <Route path="pool" element={<Pool />} />
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </Router>
    </AccountContext.Provider>
  );
}

function CustomLink({ children, to, ...props }) {
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  return (
    // <div className="content-center bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[32px] py-[12px]">
    <Link
      style={{
        color: match ? "white" : "rgb(2 132 199)",
        backgroundColor: match ? "rgb(2 132 199)" : "white",
      }}
      className="content-center bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[32px] py-[6px]"
      to={to}
      {...props}
    >
      {children}
    </Link>
    // </div>
  );
}

function Home() {
  return <Navigate to="swap" />;
}

// function Swap() {
//   return (
//     <div>
//       <SwapPage currentAccount={currentAccount} />
//     </div>
//   );
// }

function Pool(props) {
  return (
    <div>
      {/* <PoolPage currentAccount = {props.currentAccount}/> */}
      <h1>Pool</h1>
    </div>
  );
}

function NoMatch() {
  return (
    <div>
      <h1>Nothing to see here!</h1>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
export default App;
