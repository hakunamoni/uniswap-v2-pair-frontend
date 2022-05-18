import React, {Component} from 'react';
import SwapCurrencyInput from "./swap_currency_input";

// const tokenAddressA = "0e69be76c2574b23bcbb0203958b09aa";
// const tokenAddressB = "0e69be76c2574b23bcbb0203958b09aa";

function getTokenBalance(tokenName) {
    // const tokenAddress = tokenName === 'a' ? tokenAddressA : tokenAddressB;
    // const tokenBalance =     // _token.balanceOf(address(this))
    const tokenBalance = tokenName === 'a' ? 100 : 1000;
    return tokenBalance;
}

function calcSwapAmount(tokenIn, amountIn){
    if (Number.isNaN(amountIn) || parseFloat(amountIn) === 0) {
        return 0;
    }
    // const swapAmount =      // _amount1Out = reserve1_.mul(_amount0In).div(reserve0, "UniswapV2Mini: swap: reserve0 is zero");
    const swapAmount = tokenIn === 'a' ? amountIn / 10 : amountIn * 10;

    return swapAmount;
}

function swapTokens(tokenIn, amountIn){
    if (Number.isNaN(amountIn) || parseFloat(amountIn) === 0) {
        return 0;
    }
    // const swapAmount =      // _amount1Out = reserve1_.mul(_amount0In).div(reserve0, "UniswapV2Mini: swap: reserve0 is zero");
    const swapAmount = tokenIn === 'a' ? amountIn / 10 : amountIn * 10;

    return swapAmount;
}

class SwapPage extends Component{

    constructor(props) {
        super(props);

        this.handleSourceTokenChange = this.handleSourceTokenChange.bind(this);
        this.handleTargetTokenChange = this.handleTargetTokenChange.bind(this);
        this.onDirectionButtonClick = this.onDirectionButtonClick.bind(this);
        this.onSwapButtonClick = this.onSwapButtonClick.bind(this);
        
        this.state = {cursorInputAmt: 0, cursorInputPos: "up", sourceTokenName: 'a'};
    }

    handleSourceTokenChange(cursorInputAmt) {
        this.setState({cursorInputPos: "up", cursorInputAmt});
    }

    handleTargetTokenChange(cursorInputAmt) {
        this.setState({cursorInputPos: "do", cursorInputAmt});
    }

    onDirectionButtonClick() {
        const updatedSourceTokenName = this.state.sourceTokenName === 'a' ? 'b' : 'a';
        const updatedCursorInputPos = this.state.cursorInputPos === "up" ? "do" : "up";
        this.setState({cursorInputPos: updatedCursorInputPos, sourceTokenName: updatedSourceTokenName});
    }

    onSwapButtonClick() {
        const sourceTokenName = this.state.sourceTokenName;
        const targetTokenName = sourceTokenName === 'a' ? 'b': 'a';
        const cursorInputPos = this.state.cursorInputPos;
        const cursorInputAmt = this.state.cursorInputAmt;
        const tokenIn = cursorInputPos === "up" ? sourceTokenName : targetTokenName;
        swapTokens(tokenIn, cursorInputAmt);
        this.setState({cursorInputAmt: 0});
    }

    render() {
        const cursorInputPos = this.state.cursorInputPos;
        const cursorInputAmt = this.state.cursorInputAmt;
        const sourceTokenName = this.state.sourceTokenName;
        const targetTokenName = sourceTokenName === 'a' ? 'b': 'a';
        const sourceTokenBalance = getTokenBalance(sourceTokenName);
        const targetTokenBalance = getTokenBalance(targetTokenName);
        const sourceTokenAmount = cursorInputPos === "up" ? cursorInputAmt : calcSwapAmount(sourceTokenName, cursorInputAmt);
        const targetTokenAmount = cursorInputPos === "do" ? cursorInputAmt : calcSwapAmount(targetTokenName, cursorInputAmt);

        return (
            <div className="p-3 w-fit mx-auto bg-white rounded-xl shadow-lg">
                <h2 className="text-center text-2xl">
                    Swap
                </h2>
                <SwapCurrencyInput
                    formType = "Source"
                    tokenName={sourceTokenName}
                    tokenAmount={sourceTokenAmount}
                    tokenBalance={sourceTokenBalance}
                    onCurrencyInputChange={this.handleSourceTokenChange} />
                <div className='w-full flex'>
                    <button
                        className='mx-auto mt-3 bg-sky-600 hover:bg-sky-700 text-white rounded-full px-[12px] py-[6px]'
                        onClick = {this.onDirectionButtonClick}>
                        <b>&darr;</b>
                    </button>
                </div>
                <SwapCurrencyInput
                    formType = "Target"
                    tokenName={targetTokenName}
                    tokenAmount={targetTokenAmount}
                    tokenBalance={targetTokenBalance}
                    onCurrencyInputChange={this.handleTargetTokenChange} />
                <button
                    className='mt-3 w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-[16px] py-[6px]'
                    onClick = {this.onSwapButtonClick}>
                    <b>Swap</b>
                </button>
            </div>
        );
    }
};

export default SwapPage;