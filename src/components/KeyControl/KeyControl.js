import React, { useState } from 'react';
import './KeyControl.css';

const KeyControl = ({ backToRoot, timestamp, keyState, keyOpen, keyLock, choosedAppoIndex}) => {
  const [roomPassword, setRoomPassword] = useState([]);

  const handlePassInput = (event) => {
    let passArr = event.target.value.split('').map(digit => parseInt(digit, 10));
    setRoomPassword(passArr);
  }

  return (
    <div className="keycontainer">
      <button className="home-button bstr ttu" onClick={backToRoot}>Home</button>
      {keyState === false && 
        <div>
          <div className='doorinfo ttu'>Door is closing now.</div>
          <input className='password ttu' type="tex" placeholder="Input Room Pass" onChange={handlePassInput}/>
          <div className='passinfo1 ttu'>password is 6 number</div>
          <button className='roombutton bstr ttu' onClick={() => keyOpen(roomPassword, timestamp, choosedAppoIndex)}>Open room key</button>
        </div>
      }
      {keyState === true && 
        <div>
          <div className='doorinfo ttu'>Door is now open.</div>
          <button className='home-button bstr ttu' onClick={() => keyLock(timestamp, choosedAppoIndex)}>close room key</button>
        </div>
      }
    </div>
  );
};

export default KeyControl;
