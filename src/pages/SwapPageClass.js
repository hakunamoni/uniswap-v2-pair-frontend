import React, { Component } from "react";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import abiUniswap from "../abi/UniswapV2MiniABI";
import abiTokenMini from "../abi/TokenMiniABI";
import SwapCurrencyInput from "../components/SwapCurrencyInput";
import SwapContractInfo from "../components/SwapContractInfo";
import { SWAP_CONTRACT_ADDRESS } from "../constants/misc";

class SwapPageClass extends Component {
  constructor(props) {
    super(props);

    this.handleSourceTokenAmount = this.handleSourceTokenAmount.bind(this);
    this.handleTargetTokenAmount = this.handleTargetTokenAmount.bind(this);
    this.handleDirectionClick = this.handleDirectionClick.bind(this);
    this.handleDoSwapClick = this.handleDoSwapClick.bind(this);
    this.handleApproveClick = this.handleApproveClick.bind(this);

    this.state = {
      focusInputPos: true,
      sourceTokenID: "a",
      sourceTokenAmt: undefined,
      targetTokenAmt: undefined,
      isDirectionClick: undefined,
      isDoSwapClick: undefined,
      isApproveClick: undefined,
      isProcessing: undefined,
      swapTxHash: undefined,
      tokens: { a: undefined, b: undefined },
      tokenBalances: { a: undefined, b: undefined },
      tokenAllowances: { a: undefined, b: undefined },
      poolReserve: { a: undefined, b: undefined },
      tokenInfo: {
        a: { name: undefined, symbol: undefined, address: undefined },
        b: { name: undefined, symbol: undefined, address: undefined },
      },
    };
  }

  // get token info
  async fetchDataTokenInfo() {
    console.log("fetchData: get token info");

    // get token addrs
    const [addr0, addr1] = await Promise.all([
      this.uniswapProvider.token0(),
      this.uniswapProvider.token1(),
    ]);

    // set tokens
    const tokenA = new ethers.Contract(
      addr0,
      abiTokenMini,
      this.props.provider
    );
    const tokenB = new ethers.Contract(
      addr1,
      abiTokenMini,
      this.props.provider
    );

    // get token name,symbol
    const [name0, symbol0, name1, symbol1] = await Promise.all([
      tokenA.name(),
      tokenA.symbol(),
      tokenB.name(),
      tokenB.symbol(),
    ]);

    this.setState({
      tokenInfo: {
        a: { name: name0, symbol: symbol0, address: addr0 },
        b: { name: name1, symbol: symbol1, address: addr1 },
      },
      tokens: { a: tokenA, b: tokenB },
    });
  }

  // get pool reserves
  async fetchDataPoolReserves() {
    console.log("fetchData: get pool reserves");

    if (this.state.tokenInfo.a.address && this.state.tokenInfo.b.address) {
      const [addr0, reserveObj] = await Promise.all([
        this.uniswapProvider.token0(),
        this.uniswapProvider.getReserves(),
      ]);
      this.state.tokenInfo.a.address === addr0
        ? this.setState({
            poolReserve: {
              a: ethers.utils.formatEther(reserveObj._reserve0),
              b: ethers.utils.formatEther(reserveObj._reserve1),
            },
          })
        : this.setState({
            poolReserve: {
              a: ethers.utils.formatEther(reserveObj._reserve1),
              b: ethers.utils.formatEther(reserveObj._reserve0),
            },
          });
    } else {
      this.setState({
        poolReserve: { a: undefined, b: undefined },
      });
    }
  }

  // get token balances
  async fetchDataTokenBalances() {
    console.log("fetchData: get token balances");

    if (
      this.props.currentAccount &&
      this.state.tokens.a &&
      this.state.tokens.b
    ) {
      const [bal0, bal1] = await Promise.all([
        this.state.tokens.a.balanceOf(this.props.currentAccount),
        this.state.tokens.b.balanceOf(this.props.currentAccount),
      ]);
      this.setState({
        tokenBalances: {
          a: ethers.utils.formatEther(bal0),
          b: ethers.utils.formatEther(bal1),
        },
      });
    } else {
      this.setState({
        tokenBalances: { a: undefined, b: undefined },
      });
    }
  }

  // get token allowances
  async fetchDataTokenAllowances() {
    console.log("fetchData: get token allowances");

    if (
      this.props.currentAccount &&
      this.state.tokens.a &&
      this.state.tokens.b
    ) {
      const [allow0, allow1] = await Promise.all([
        this.state.tokens.a.allowance(
          this.props.currentAccount,
          SWAP_CONTRACT_ADDRESS
        ),
        this.state.tokens.b.allowance(
          this.props.currentAccount,
          SWAP_CONTRACT_ADDRESS
        ),
      ]);
      this.setState({
        tokenAllowances: {
          a: ethers.utils.formatEther(allow0),
          b: ethers.utils.formatEther(allow1),
        },
      });
    } else {
      this.setState({
        tokenAllowances: { a: undefined, b: undefined },
      });
    }
  }

  // get target token amount
  async fetchDataTargetTokenAmt() {
    console.log("fetchData: get target token amount");

    if (this.state.focusInputPos) {
      if (
        this.state.sourceTokenAmt &&
        Number(this.state.sourceTokenAmt) !== 0
      ) {
        this.uniswapProvider
          .getSwapTargetAmount(
            this.state.tokenInfo[this.state.sourceTokenID].address,
            parseEther(this.state.sourceTokenAmt.toString())
          )
          .then((result) => {
            this.setState({
              targetTokenAmt: ethers.utils.formatEther(result),
            });
          })
          .catch("error", console.error);
      } else {
        this.setState({
          targetTokenAmt: undefined,
        });
      }
    }
  }

  // get source token amount
  async fetchDataSourceTokenAmt() {
    console.log("fetchData: get source token amount");

    if (!this.state.focusInputPos) {
      if (
        this.state.targetTokenAmt &&
        Number(this.state.targetTokenAmt) !== 0
      ) {
        if (
          Number(this.state.targetTokenAmt) <
          Number(this.state.poolReserve[this.targetTokenID])
        ) {
          this.uniswapProvider
            .getSwapSourceAmount(
              this.state.tokenInfo[this.targetTokenID].address,
              parseEther(this.state.targetTokenAmt.toString())
            )
            .then((result) => {
              this.setState({
                sourceTokenAmt: ethers.utils.formatEther(result),
              });
            })
            .catch("error", console.error);
        }
      } else {
        this.setState({
          sourceTokenAmt: undefined,
        });
      }
    }
  }

  // do direction
  doDirection() {
    console.log("function: do direction");

    this.state.focusInputPos
      ? this.setState({
          focusInputPos: !this.state.focusInputPos,
          sourceTokenID: this.targetTokenID,
          targetTokenAmt: this.state.sourceTokenAmt,
        })
      : this.setState({
          focusInputPos: !this.state.focusInputPos,
          sourceTokenID: this.targetTokenID,
          sourceTokenAmt: this.state.targetTokenAmt,
        });
  }

  // reset source/target token amount as 0
  resetTokenAmount0() {
    console.log("function: reset source/target token amount as 0");

    this.setState({
      sourceTokenAmt: undefined,
      targetTokenAmt: undefined,
    });
  }

  componentDidMount() {
    console.log("componentDidMount");

    this.uniswapProvider = new ethers.Contract(
      SWAP_CONTRACT_ADDRESS,
      abiUniswap,
      this.props.provider
    );

    // get token info
    this.fetchDataTokenInfo();
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate");

    this.targetTokenID = this.state.sourceTokenID === "a" ? "b" : "a";

    if (
      this.state.tokenInfo !== prevState.tokenInfo ||
      this.state.isDoSwapClick !== prevState.isDoSwapClick
    ) {
      // get pool reserves
      this.fetchDataPoolReserves();
    }

    if (
      this.props.currentAccount !== prevProps.currentAccount ||
      this.state.tokens !== prevState.tokens ||
      this.state.isDoSwapClick !== prevState.isDoSwapClick
    ) {
      // get token balances
      this.fetchDataTokenBalances();

      // get token allowances
      this.fetchDataTokenAllowances();
    }

    if (
      this.state.sourceTokenAmt !== prevState.sourceTokenAmt ||
      this.state.sourceTokenID !== prevState.sourceTokenID ||
      this.state.tokenInfo !== prevState.tokenInfo ||
      this.state.focusInputPos !== prevState.focusInputPos
    ) {
      // get target token amount
      this.fetchDataTargetTokenAmt();
    }

    if (
      this.state.targetTokenAmt !== prevState.targetTokenAmt ||
      // this.state.targetTokenID !== prevState.targetTokenID ||
      this.state.tokenInfo !== prevState.tokenInfo ||
      this.state.poolReserve !== prevState.poolReserve ||
      this.state.focusInputPos !== prevState.focusInputPos
    ) {
      // get source token amount
      this.fetchDataSourceTokenAmt();
    }

    if (this.state.isDirectionClick !== prevState.isDirectionClick) {
      // do direction
      this.doDirection();
    }

    if (this.state.isDoSwapClick !== prevState.isDoSwapClick) {
      // reset source/target token amount as 0
      this.resetTokenAmount0();
    }
  }

  handleSourceTokenAmount(inputAmount) {
    console.log("change on source token input: calc & set SwapTargetAmount");
    this.setState({ focusInputPos: true, sourceTokenAmt: inputAmount });
  }

  handleTargetTokenAmount(inputAmount) {
    console.log("change on target token input: calc & set SwapSourceAmount");
    this.setState({ focusInputPos: false, targetTokenAmt: inputAmount });
  }

  handleDirectionClick() {
    console.log("click on direction button");
    this.setState({ isDirectionClick: !this.state.isDirectionClick });
  }

  handleDoSwapClick() {
    console.log("click on swap button: swap tokens");

    const signer = this.props.provider.getSigner();
    const uniswapSigner = new ethers.Contract(
      SWAP_CONTRACT_ADDRESS,
      abiUniswap,
      signer
    );

    uniswapSigner
      .swap(
        this.state.tokenInfo[this.state.sourceTokenID].address,
        parseEther(this.state.sourceTokenAmt.toString())
      )
      .then((tr) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`);
        this.setState({ isProcessing: true, swapTxHash: tr.hash });

        tr.wait().then((receipt) => {
          console.log("transfer receipt", receipt);
          this.setState({
            isProcessing: false,
            isDoSwapClick: !this.state.isDoSwapClick,
          });
        });
      })
      .catch("error", console.error);
  }

  handleApproveClick() {
    console.log("click on approve protocol button: approve 1000 ethers");

    const signer = this.props.provider.getSigner();
    const tokenASigner = new ethers.Contract(
      this.state.tokenInfo[this.state.sourceTokenID].address,
      abiTokenMini,
      signer
    );

    tokenASigner
      .approve(
        SWAP_CONTRACT_ADDRESS,
        ethers.utils.parseEther(this.state.sourceTokenAmt)
      )
      .then((tr) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`);
        tr.wait().then((receipt) => {
          console.log("transfer receipt", receipt);
          this.setState({ isApproveClick: !this.state.isApproveClick });
        });
      })
      .catch("error", console.error);
  }

  render() {
    const { currentAccount, provider, connectMetamask } = this.props;

    const {
      sourceTokenID,
      sourceTokenAmt,
      targetTokenAmt,
      isProcessing,
      swapTxHash,
      tokenBalances,
      tokenAllowances,
      poolReserve,
      tokenInfo,
    } = this.state;

    const targetTokenID = sourceTokenID === "a" ? "b" : "a";
    const target2sourceRate =
      targetTokenAmt &&
      sourceTokenAmt &&
      Number(targetTokenAmt) !== 0 &&
      Number(sourceTokenAmt) !== 0
        ? (Number(sourceTokenAmt) / Number(targetTokenAmt)).toFixed(7)
        : undefined;

    return (
      <div className="p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
        <h2 className="text-center text-2xl">Swap</h2>
        <SwapCurrencyInput
          formType="Source"
          tokenSymbol={tokenInfo[sourceTokenID].symbol}
          tokenAmount={sourceTokenAmt}
          tokenBalance={tokenBalances[sourceTokenID]}
          onTokenAmountChange={this.handleSourceTokenAmount}
        />
        <div className="w-full flex">
          <button
            className="mx-auto bg-sky-600 hover:bg-sky-700 text-white rounded-full px-[12px] py-[6px]"
            onClick={this.handleDirectionClick}
          >
            <b>&darr;</b>
          </button>
        </div>
        <SwapCurrencyInput
          formType="Target"
          tokenSymbol={tokenInfo[targetTokenID].symbol}
          tokenAmount={targetTokenAmt}
          tokenBalance={tokenBalances[targetTokenID]}
          onTokenAmountChange={this.handleTargetTokenAmount}
        />

        {Number(tokenAllowances[sourceTokenID]) < Number(sourceTokenAmt) ? (
          <div className="w-96">
            <button
              className="w-full mb-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-[6px]"
              onClick={this.handleApproveClick}
            >
              <b>
                Allow this protocol to use your{" "}
                {tokenInfo[sourceTokenID].symbol}
              </b>
            </button>
          </div>
        ) : (
          <></>
        )}

        {isProcessing ? (
          <button
            className="w-full flex bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={true}
          >
            {" "}
            <div className="flex mx-auto">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <b>Processing...</b>
            </div>
          </button>
        ) : Number(targetTokenAmt) > Number(poolReserve[targetTokenID]) ? (
          <button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            disabled={true}
          >
            <b>
              Insufficient Reserve {tokenInfo[targetTokenID].symbol} balance
            </b>
          </button>
        ) : currentAccount ? (
          !sourceTokenAmt ||
          !targetTokenAmt ||
          Number(sourceTokenAmt) === 0 ||
          Number(targetTokenAmt) === 0 ? (
            <button
              className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
              disabled={true}
            >
              <b>Enter an amount</b>
            </button>
          ) : Number(sourceTokenAmt) > Number(tokenBalances[sourceTokenID]) ? (
            <button
              className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
              disabled={true}
            >
              <b>Insufficient {tokenInfo[sourceTokenID].symbol} balance</b>
            </button>
          ) : (
            <button
              className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
              disabled={
                Number(tokenAllowances[sourceTokenID]) < Number(sourceTokenAmt)
              }
              onClick={this.handleDoSwapClick}
            >
              <b>Swap</b>
            </button>
          )
        ) : (
          <button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px] disabled:opacity-50"
            onClick={connectMetamask}
          >
            <b>Connect MetaMask</b>
          </button>
        )}

        <SwapContractInfo
          tar2srcRate={target2sourceRate}
          swapContractAddress={SWAP_CONTRACT_ADDRESS}
          poolReserve={poolReserve}
          tokenInfo={tokenInfo}
          srcTokenID={sourceTokenID}
          tarTokenID={targetTokenID}
          txHash={swapTxHash}
        />
      </div>
    );
  }
}

export default SwapPageClass;
