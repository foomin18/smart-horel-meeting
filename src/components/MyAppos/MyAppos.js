import React, { useState, useEffect } from 'react';
import './MyAppos.css';

const MyAppos = ({ backToRoot, myAppos, refundAppo, checkIn, setPassword, passBools, checkOut, timestamp }) => {
  const [roomPassword, setRoomPassword] = useState([]);

  const timestampToDate = (timestamp) => {
    let date = new Date(Number(timestamp) * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return (`${year.toString()}/${month.toString()}/${day.toString()}`)
  }

  useEffect(() => {
    console.log(myAppos);
    //console.log('appo', myAppos[2].isCheckedIn);
    // for (let i = 0; i < myAppos.length; i++) {
    //     passBool.push(isPassSet(myAppos[i].roomId));
    // }
    // console.log(passBool);
  }, [])

  const handlePassInput = (event) => {
    let passArr = event.target.value.split('').map(digit => parseInt(digit, 10));
    setRoomPassword(passArr);
  }

  return (
    <div className="my-appos-container">
      <button className="home-button bstr ttu" onClick={backToRoot}>Home</button>
      <h2 className='ttu'>My Appointments</h2>
      <div className="appointments-grid">
        {myAppos.map((appo, index) => (
          <div key={index} className="appointment">
            <div className='str ttu'>Appointment No: {index + 1}</div>
            <div className='str ttu'>Start Date: {timestampToDate(appo.timestamp)}</div>
            <div className='str ttu'>Duration: {appo.numDays.toString()} days</div>
            <div className='str ttu'>Room No: {appo.roomId.toString()}</div>
            {appo.timestamp > timestamp ? (
              <button className='appobutton str ttu' onClick={() => refundAppo(index)}>Cancel Appointment</button>
            ) : !appo.isCheckedIn ? (
              <button className='appobutton str ttu' onClick={() => checkIn(Number(timestamp), index)}>Check In</button>
            ) : !passBools[index] ? (
                <div>
                    <input className='pass ttu' type="tex" placeholder="Set Room Pass" onChange={handlePassInput}/>
                    <div className='passinfo ttu'>password is 6 number</div>
                    <button className='appobutton str ttu' onClick={() => setPassword(roomPassword, timestamp, index)}>Set Password</button>
                </div>
            ) : (
                <div>
                    <div className='ttu str ttu'>Please press the checkout button when leaving.</div>
                    <button className='appobutton str ttu' onClick={() => checkOut(timestamp, index)}>Check Out</button>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppos;
