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
  let defaultYear = 0;
  let defaultMonth = 0;
  let after = true;
  //deploytimeよる表示の場合分け
  let today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  let date = new Date(Number(deployTime) * 1000);
  const year = date.getFullYear();
  const month = date.getMonth() + 2;
  console.log(todayDay);
  //デプロイした次の月以降を表示
  if (todayYear === year) {
    if (todayMonth + 1 === month) {
        defaultMonth = month;
        defaultYear = year;
        after = false;
    }
  } else {
    defaultMonth = todayMonth;
    defaultYear = todayYear;
  }
  //console.log(year, month);
  // State for selected room, month, and booking dates
  const [view, setView] = useState('select');
  const [selectedRoom, setSelectedRoom] = useState('0');
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelecetedYear] = useState(defaultYear);
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

  let arr;
  if (selectedYear === year && !after) { 
    arr = [...Array(13 - month).keys()].map(n => (
        <option key={n+month} value={n+month}>{n+month}</option>
    ));
  } else if (selectedYear !== year && !after) {
    arr = [...Array(12).keys()].map(n => (
        <option key={n+1} value={n+1}>{n+1}</option>
    ));
  }

  if (after && selectedYear === todayYear) {
    arr = [...Array(13 - todayMonth).keys()].map(n => (
        <option key={n+todayMonth} value={n+todayMonth}>{n+todayMonth}</option>
    ));
  } else if (after && selectedYear !== todayYear) {
    arr = [...Array(12).keys()].map(n => (
        <option key={n+1} value={n+1}>{n+1}</option>
    ));
  }

  // Handlers for room and month selection
  const handleRoomChange = (event) => {
    setSelectedRoom(event.target.value);
  };

  const handleYearChange = (event) => {
    if (event.target.value === year.toString()) { //デプロイした年を選択したら、12にリセット
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
                            <option key={n+todayYear} value={n+todayYear}>{n+todayYear}</option>
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
                    {monthlyAppoList.map((booked, index) => {
                        
                        if (after && selectedMonth === todayMonth && index > todayDay - 1) {
                            return (
                                <button
                                    key={index}
                                    disabled={booked}
                                    onClick={() => handleDateSelect(index + 1)}
                                    className={`bstr ${booked ? 'booked-date' : 'available-date'}`}
                                >
                                    {booked ? booked : index + 1}
                                </button>
                            )
                        } else if (after && selectedMonth !== todayMonth) {
                            return (
                                <button
                                    key={index}
                                    disabled={booked}
                                    onClick={() => handleDateSelect(index + 1)}
                                    className={`bstr ${booked ? 'booked-date' : 'available-date'}`}
                                >
                                    {booked ? booked : index + 1}
                                </button>
                            )
                        } else if (!after) {
                            return (
                                <button
                                    key={index}
                                    disabled={booked}
                                    onClick={() => handleDateSelect(index + 1)}
                                    className={`bstr ${booked ? 'booked-date' : 'available-date'}`}
                                >
                                    {booked ? booked : index + 1}
                                </button>
                            )
                        }
                    })}
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
