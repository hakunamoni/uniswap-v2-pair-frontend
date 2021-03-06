import React, { useEffect, useState, useContext } from "react";
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
import { ethers } from "ethers";
import "./App.css";
import SwapPage from "./pages/SwapPage";
// import SwapPageClass from "./pages/SwapPageClass";
import PoolPage from "./pages/PoolPage";
import FaucetPage from "./pages/FaucetPage";
import MetamaskAccountInfo from "./components/MetamaskAccountInfo";
import { INFURA_PROJECT_ID } from "./constants/misc";

export const AccountContext = React.createContext({
  currentAccount: undefined,
  handleConnectMetamask: undefined,
  handleDisconnectMetamask: undefined,
});

function App() {
  const [currentAccount, setCurrentAccount] = useState(undefined);
  const [provider, setProvider] = useState(
    window.ethereum ? getWindowEthereumProvider() : getInfuraGoerliProvider()
  );

  const handleConnectMetamask = () => {
    console.log("onClick: connect Metamask");

    if (!window.ethereum) {
      console.log("Please install Metamask");
      setProvider(getInfuraGoerliProvider());
      return undefined;
    }

    console.log(window.ethereum);
    console.log(provider);
    console.log(currentAccount);

    const windowEthereumProvider = getWindowEthereumProvider();
    // MetaMask requires requesting permission to connect users accounts
    windowEthereumProvider
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
    setProvider(windowEthereumProvider);
  };

  const handleDisconnectMetamask = () => {
    console.log("onClick: disconnect Metamask");
    setProvider(getInfuraGoerliProvider());
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
          <Route path="/" element={<Header provider={provider} />}>
            <Route
              index
              path="/"
              element={<Navigate to="/uniswap-v2-pair-frontend" />}
            />
            <Route index path="/uniswap-v2-pair-frontend" element={<Home />} />
            {/* <Route
              index
              path="/"
              element={<Navigate to="/uniswap-v2-pair-frontend/swap" />}
            /> */}
            <Route
              path="/uniswap-v2-pair-frontend/swap"
              element={
                <SwapPage
                  currentAccount={currentAccount}
                  provider={provider}
                  connectMetamask={handleConnectMetamask}
                />
              }
            />
            <Route
              path="/uniswap-v2-pair-frontend/pool"
              element={
                <PoolPage
                  currentAccount={currentAccount}
                  provider={provider}
                  connectMetamask={handleConnectMetamask}
                />
              }
            />
            {/* <Route
              path="swapclass"
              element={
                <SwapPageClass
                  currentAccount={currentAccount}
                  provider={provider}
                  connectMetamask={handleConnectMetamask}
                />
              }
            />{" "} */}
            <Route
              path="/uniswap-v2-pair-frontend/faucet"
              element={
                <FaucetPage
                  currentAccount={currentAccount}
                  provider={provider}
                  connectMetamask={handleConnectMetamask}
                />
              }
            />
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </Router>
    </AccountContext.Provider>
  );
}

function Header(props) {
  return (
    <div className="h-screen w-screen	m-auto bg-sky-100">
      <h1 className="text-center text-2xl font-bold py-5">
        Uniswap V2 Pair (Mini) - D. S.
      </h1>

      <div className="mb-4 p-1 w-fit mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-2">
        <CustomLink to="/uniswap-v2-pair-frontend/swap">
          <b>Swap</b>
        </CustomLink>
        <CustomLink to="/uniswap-v2-pair-frontend/pool">
          <b>Pool</b>
        </CustomLink>
        {/* <CustomLink to="/swapclass">
          <b>ClassSwap</b>
        </CustomLink>{" "} */}
        <CustomLink to="/uniswap-v2-pair-frontend/faucet">
          <b>Faucet</b>
        </CustomLink>{" "}
      </div>

      <Outlet />

      <Footer provider={props.provider} />
    </div>
  );
}

function Footer(props) {
  const { currentAccount, handleDisconnectMetamask, handleConnectMetamask } =
    useContext(AccountContext);
  const { provider } = props;

  const [ethBalance, setEthBalance] = useState(undefined);
  const [chainInfo, setChainInfo] = useState({
    id: undefined,
    name: undefined,
  });

  useEffect(() => {
    console.log("useEffect: set account information for currentAccount");

    if (currentAccount && ethers.utils.isAddress(currentAccount)) {
      async function fetchData() {
        // get eth balance, chain info
        const [ethBal, chainInfo] = await Promise.all([
          provider.getBalance(currentAccount),
          provider.getNetwork(),
        ]);

        setEthBalance(ethers.utils.formatEther(ethBal));
        setChainInfo({ id: chainInfo.chainId, name: chainInfo.name });
      }
      fetchData();
    }
  }, [currentAccount, provider]);

  return (
    <div className="w-fit mx-auto mt-4 rounded-xl">
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
      {currentAccount ? (
        <MetamaskAccountInfo
          currentAccount={currentAccount}
          ethBalance={ethBalance}
          chainId={chainInfo.id}
          chainName={chainInfo.name}
        />
      ) : (
        <div className="w-96"></div>
      )}

      <p className="w-fit mx-auto mt-4 hover:text-sky-700 text-sky-600">
        <Link to="/uniswap-v2-pair-frontend">Go to the home page</Link>
      </p>
    </div>
  );
}

function CustomLink({ children, to, ...props }) {
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  return (
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
  );
}

function Home() {
  return (
    <fieldset className="p-2 w-96 mx-auto bg-slate-100 rounded-xl shadow-lg">
      <p className="p-1">
        Welcome!
        <br /> Thanks for visiting Uniswap V2 Pair {"("}Mini{")"}.
        <br />
        {/* <br />
        Please click "Swap" or "Pool" button to swap tokens and add a liquidity.
        <br />
        Or please visit the default page{" "}
        <Link to="/" className="hover:text-sky-700 text-sky-600">
          here
        </Link>
        . <br /> */}
        <br />
        This is only compatible with the Goerli testnet. <br />
        <br />
        Please provide any feedback to this email. <br />
        <a
          className="text-sky-600 hover:text-sky-700"
          href="mailto:hakunamoni@gmail.com"
        >
          hakunamoni@gmail.com
        </a>
      </p>
    </fieldset>
  );
}

function NoMatch() {
  return (
    <fieldset className="p-2 w-96 mx-auto bg-slate-100 rounded-xl shadow-lg">
      <h1>Nothing to see here!</h1>
      {/* <p className="w-fit mx-auto mt-4 hover:text-sky-700 text-sky-600">
        <Link to="/">Go to the home page</Link>
      </p> */}
    </fieldset>
  );
}

function getWindowEthereumProvider() {
  return new ethers.providers.Web3Provider(window.ethereum);
}

function getInfuraGoerliProvider() {
  return new ethers.getDefaultProvider("goerli", {
    infura: INFURA_PROJECT_ID,
  });
}

export default App;
