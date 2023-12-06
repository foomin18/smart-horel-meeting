import React, { useState } from 'react';
import './Main.css'; 
import BuyToken from '../BuyToken/BuyToken';
import RoomSchedule from '../RoomSchedule/RoomSchedule';
import MyAppos from '../MyAppos/MyAppos';
import KeyControl from '../KeyControl/KeyControl';

const Main = ({
    deployTime,
    roomNum,
    tokenPrice,
    myAppos,
    roomKeyState,
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
    checkOut,
    isDoorOpen,
    keyOpen,
    keyLock,
}) => {
    const [view, setView] = useState('root');
    
    const [keyState, setKeyState] = useState(false);
    const [choosedAppoIndex, setChoosedAppoIndex] = useState(0);

    const backToRoot = () => {
      setView('root');
    }

    const canHandleKey = async (index) => {
      setChoosedAppoIndex(index);
      const key = await isDoorOpen(index);
      console.log('romKeyState', roomKeyState);
      console.log('key', key);
      setKeyState(key);
      setView('KH');
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
              canHandleKey={canHandleKey}
            />
          </div>
        }
        {view === 'KH' && 
          <KeyControl 
            backToRoot={backToRoot}
            timestamp={timestamp}
            keyState={keyState}
            keyOpen={keyOpen}
            keyLock={keyLock}
            choosedAppoIndex={choosedAppoIndex}
          />
        }
      </div>
    );
}

export default Main;