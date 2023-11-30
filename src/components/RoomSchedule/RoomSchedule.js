import React, { useState } from 'react';
import './RoomSchedule.css';

const RoomSchedule = ({ 
    backToRoot, 
    roomNum, 
    bookAppo, 
    tokenBalance, 
    changeToTimestamp, 
    getMonthlyAppoList, 
    deployTime 
}) => {
  // State for selected room, month, and booking dates
  const [view, setView] = useState('select');
  const [selectedRoom, setSelectedRoom] = useState('0');
  const [selectedMonth, setSelectedMonth] = useState('12');
  const [selectedYear, setSelecetedYear] = useState('2023');
  const [startDate, setStartDate] = useState('');
  const [bookSpan, setBookSpan] = useState(1);
  const [partyName, setPartyName] = useState('');
  const [monthlyAppoList, setMonthlyAppoList] = useState([]);
  //console.log(selectedRoom, selectedYear, selectedMonth, startDate, bookSpan, partyName);

  const goReservation = async () => {
    //console.log(selectedMonth);
    const monthStart = await changeToTimestamp(selectedYear, selectedMonth, 1);
    //console.log('month start', monthStart, deployTime, selectedRoom, selectedYear, selectedMonth);

    const fetchedAppoList = await getMonthlyAppoList(Number(selectedRoom), Number(selectedYear),Number(selectedMonth));
    setMonthlyAppoList(fetchedAppoList);

    if (monthStart > deployTime) {
        setView('calender');
    }
  }
  //deploytimeよる表示の場合分け
  let date = new Date(Number(deployTime) * 1000);
  const year = date.getFullYear();
  const month = date.getMonth() + 2;

  let arr;
  if (selectedYear === year.toString()) {  //2023年11月にdeployしたので11月までは表示しない
    arr = [...Array(13 - month).keys()].map(n => (
    <option key={n+month} value={n+month}>{n+month}</option>
    ));
  } else {
    arr = [...Array(12).keys()].map(n => (
        <option key={n+1} value={n+1}>{n+1}</option>
        ));
  }

  // Handlers for room and month selection
  const handleRoomChange = (event) => {
    setSelectedRoom(event.target.value);
  };

  const handleYearChange = (event) => {
    if (event.target.value === '2023') { //デプロイした年を選択したら、12にリセット
        setSelectedMonth('12');
    }
    setSelecetedYear(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleDateSelect = (date) => {
    if (!monthlyAppoList[date - 1]) { // Check if the date is not already booked
      setStartDate(date);
    }
  };

  const handleSpanChange = (event) => {
    setBookSpan(event.target.value);
  };

  const handlePartyName = (event) => {
    setPartyName(event.target.value);
  };

  return (
    <div className="room-schedule-container">
        <button className="home-button bstr ttu" onClick={backToRoot}>Home</button>
        {view === 'select' && (
            <div>
                <div className='selectinfo ttu'>Please select the room, year, and month for the reservation schedule you would like to check</div>
                <div className='allselects'>
                    <div className='minicontainer'>
                        <div className='selectsug1 ttu'>Select room number：</div>
                        <select className='select' value={selectedRoom} onChange={handleRoomChange}>
                            {[...Array(Number(roomNum)).keys()].map(n => (
                            <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div className='minicontainer'>
                        <div className='selectsug2 ttu'>Select Year：</div>
                        <select className='select' value={selectedYear} onChange={handleYearChange}>
                            {[...Array(10).keys()].map(n => (
                            <option key={n+2023} value={n+2023}>{n+2023}</option>
                            ))}
                        </select>
                    </div>
                    <div className='minicontainer'>
                        <div className='selectsug3 ttu'>Select Month：</div>
                        <select className='select' value={selectedMonth} onChange={handleMonthChange}>
                            {arr}
                        </select>
                    </div>
                </div>
                <div className='minicontainer' >
                    <button className="home-button bstr ttu" onClick={goReservation}>Check Schedule</button>
                </div>
            </div>
        )}
        {view === 'calender' && (
            <div>
                <div className='rym'>
                    <div className='selectdayinfo ttu'>Please select a reservation start date.</div>
                    <div className='selectryminfo ttu'>roomId：{selectedRoom} Year：{selectedYear} Month：{selectedMonth} </div>
                </div>
                <div className="calendar">
                    {monthlyAppoList.map((booked, index) => (
                    <button
                        key={index}
                        disabled={booked}
                        onClick={() => handleDateSelect(index + 1)}
                        className={`bstr ${booked ? 'booked-date' : 'available-date'}`}
                    >
                        {booked ? booked : index + 1}
                    </button>
                    ))}
                </div>
                
                <div className='confirm'>
                    <div className='selectdayinfo ttu'>Selected start day：{startDate}</div>
                    <div className='selectdayinfo ttu'>Your HotelToken balance：{tokenBalance.toString()}</div>
                    <div className='selectspan'>
                        <div className='spaninfo ttu'>Set booking span：</div>
                        <input 
                            type="number" 
                            value={bookSpan} 
                            onChange={handleSpanChange} 
                            min="1" 
                            className="bookspan-input"
                        />
                    </div>
                    <div className='selectspan'>
                        <div className='partyinfo ttu'>partyname：</div>
                        <input className='ttu bstr partyname' type='tex' onChange={handlePartyName} />
                    </div>
                    <button
                        onClick={() => bookAppo(selectedRoom, partyName, selectedYear, selectedMonth, startDate, bookSpan)}
                        disabled={bookSpan > tokenBalance}
                        className={`bstr ttu ${bookSpan > tokenBalance ? 'lack' : 'home-button'}`}
                    >
                        {bookSpan > tokenBalance ? 'Insufficient tokens' : 'confirm booking'}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default RoomSchedule;
