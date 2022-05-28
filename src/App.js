import React, { useEffect, useState, useCallback, useContext } from "react";
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
import { ethers } from "ethers";

export const AccountContext = React.createContext({
  currentAccount: undefined,
  handleConnectMetamask: undefined,
  handleDisconnectMetamask: undefined,
});

function App() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const [currentAccount, setCurrentAccount] = useState(undefined);

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
        console.log("retrievedAccounts", retrievedAccounts.length);
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
    setCurrentAccount(undefined);
  };

  return (
    <AccountContext.Provider
      value={{
        currentAccount,
        handleConnectMetamask,
        handleDisconnectMetamask,
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Header />}>
            <Route index path="/" element={<Navigate to="swap" />} />
            <Route
              path="swap"
              element={<SwapPage currentAccount={currentAccount} />}
            />
            <Route path="pool" element={<Pool />} />
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </Router>
    </AccountContext.Provider>
  );
}

function Header() {
  const { currentAccount, handleDisconnectMetamask, handleConnectMetamask } =
    useContext(AccountContext);

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

function Pool() {
  return (
    <div>
      {/* <PoolPage /> */}
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
