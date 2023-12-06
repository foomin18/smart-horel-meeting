import React, { useState } from 'react';
import './BuyToken.css';

const BuyToken = ({ backToRoot, tokenBalance, tokenPrice, buyTokens }) => {
  const [amount, setAmount] = useState(1); // 初期値は1に設定

  const handleChange = (event) => {
    setAmount(event.target.value);
  };

  //console.log('tokenBalance',tokenBalance);
  //このconsole.logでは6nと出る

  return (
    <div className="buy-token-container">
      <div className="form-container">
        <button className="home-button bstr ttu" onClick={backToRoot}>Home</button>
        <div className='attention-container'>
            <div className="token-info ttu">1 Day = 1 Token</div>
            <span className='attention ttu'>
                Attention! Hoteltokens are non-refundable. please purchase only for the number of days you intend to book.
            </span>
        </div>
        <span className="tokenprice ttu">HotelToken Price：{window.web3.utils.fromWei(tokenPrice, 'ether')}ETH</span>
            <div className="amount-setter">
                <span className='st ttu'>↓Set Token amount↓</span>
                <div className="form-container dib">
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={handleChange} 
                        min="1" 
                        className="token-amount-input"
                    />
                    <button className="buy-button bstr ttu" onClick={() => buyTokens(amount)}>Buy Tokens</button>
                </div>
            </div>
      </div>
      <span className="tokenbalance ttu">Your HotelToken blance：{tokenBalance.toString()}</span>
      
    </div>
  );
};

export default BuyToken;
