import React, {Component} from 'react';

const tokenNames = {
    a: 'HAKUNA',
    b: 'MONI'
};

class SwapCurrencyInput extends Component{
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.onCurrencyInputChange(e.target.value);
    }

    render() {
        const type = this.props.type;
        const tokenAmount = this.props.tokenAmount;
        const tokenBalance = this.props.tokenBalance;
        const tokenName = this.props.tokenName;

        return (
            <fieldset className="p-2 w-96 mx-auto bg-slate-100 rounded-xl">
                <legend
                    className="p-1">
                    {type} Token - <b>{tokenNames[tokenName]}</b>
                </legend>
                <input 
                    value={tokenAmount}
                    onChange={this.handleChange}
                    className='p-1 border-2 border-white w-full bg-slate-100 rounded-xl' />
                <p 
                    className="p-1 text-slate-500">
                    Balance: {tokenBalance}
                </p>
            </fieldset>
        );
    }
};

export default SwapCurrencyInput;