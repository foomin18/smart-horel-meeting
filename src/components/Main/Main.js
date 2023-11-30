import React, { useState } from 'react';
import './Main.css'; 
import BuyToken from '../BuyToken/BuyToken';
import RoomSchedule from '../RoomSchedule/RoomSchedule';
import MyAppos from '../MyAppos/MyAppos';

const Main = ({
    account,
    smartHotel,
    deployTime,
    roomNum,
    tokenPrice,
    myAppos,
    passBools,
    tokenBalance,
    timestamp,
    changeToTimestamp,
    getMonthlyAppoList,
    buyTokens,
    bookAppo, 
    refundAppo, 
    checkIn, 
    setPassword, 
    checkOut
}) => {
    const [view, setView] = useState('root');

    const backToRoot = () => {
      setView('root');
    }

    return (
      <div className="main-container">
        {view === 'root' && (
          <div className="button-container shadow-3">
            <button className="nav-button bstr ttu shadow-3" onClick={() => setView('BT')}>Buy HotelToken</button>
            <button className="nav-button bstr ttu shadow-3" onClick={() => setView('RS')}>See room schedule</button>
            <button className="nav-button bstr ttu shadow-3" onClick={() => setView('MA')}>Check my appointments</button>
          </div>
        )}
        
        {view === 'BT' && 
          <BuyToken 
            backToRoot={backToRoot} 
            tokenBalance={tokenBalance} 
            tokenPrice={tokenPrice}
            buyTokens={buyTokens} 
          />
        }
        {view === 'RS' && 
          <div>
            <div className='adjust'></div>
            <RoomSchedule 
              backToRoot={backToRoot} 
              roomNum={roomNum}
              bookAppo={bookAppo} 
              tokenBalance={tokenBalance}  
              changeToTimestamp={changeToTimestamp}
              getMonthlyAppoList={getMonthlyAppoList}
              deployTime={deployTime}
            />
          </div>
        }
        {view === 'MA' && 
          <div>
            <div className='adjust2'></div>
            <MyAppos
              backToRoot={backToRoot}
              myAppos={myAppos}
              refundAppo={refundAppo}
              checkIn={checkIn}
              setPassword={setPassword}
              passBools={passBools}
              checkOut={checkOut}
              timestamp={timestamp}
            />
          </div>
        }
      </div>
    );
}

export default Main;