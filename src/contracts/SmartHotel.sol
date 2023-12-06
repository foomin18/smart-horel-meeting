//SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.0 <0.9.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/@openzeppelin/contracts/utils/math/Math.sol";

import './HotelToken.sol';
import './TimeManager.sol';

contract SmartHotel {
    string public constant name = 'SmartHotel';
    HotelToken public hotelToken;// 1 token = 1 day 
    TimeManager private timeManager;//time manager
    address payable public owner;
    uint16 public roomNum;
    uint64 public hotelTokenPrice;// price of one token in ETH
    uint256 public deployTime;
    

    struct RoomPass {
        uint256 password;
        bool set;
    }

    struct Appointment {  
        bool isAppointment;
        string partyName;
        address userAddress;
    }

    struct UserBooking {
        uint256 timestamp;
        uint8 numDays;
        bool isCheckedIn;
        uint16 roomId;
    }

    mapping(uint16 => RoomPass) private roomPasses;  //roomid => roompass
    mapping(uint16 => bool) public roomKeyStates;  //is room key opening
    //key is mod 86400
    mapping(uint16 => mapping(uint256 => Appointment)) scheduleByTimestamp;  //部屋分けはネストで表現roomiduint=>timestampuint=>appo
    mapping(address => UserBooking[]) public userBookings;

    event TokenPriceChanged(uint64 indexed oldPrice, uint64 indexed newPrice);
    event TokenBought(address indexed from, uint256 sum, uint64 indexed price);
    event AppoScheduled(address indexed from, uint256 indexed timestamp, uint256 indexed span, uint16 room);
    event AppoRefunded(address indexed from, uint256 indexed timestamp, uint256 indexed span, uint8 index);
    event CheckedIn(address indexed user, uint256 indexed timestamp);
    event CheckedOut(address indexed user, uint256 indexed timestamp);
    event roomPassOK(address indexed user, uint256 indexed timestamp);
    event keyOpened(address indexed user, uint256 indexed timestamp);
    event keyLocked(address indexed user, uint256 indexed timestamp);
    event checkKeyState(bool indexed state, uint256 indexed timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    modifier validMonth(uint8 _m) {
        require(_m > 0 && _m < 13, "1-12");
        _;
    }

    modifier validDay(uint8 _d) {
        require(_d > 0 && _d < 32, "Invalid day");
        _;
    }

    modifier validNumDays(uint8 _num) {
        require(_num > 0, "above 0");
        _;
    }

    modifier validTimestamp(uint256 _t) {
        validateTimestamp(_t);
        _;
    }

    modifier validRoomId(uint16 _id) {
        require(0 <= _id && _id <= roomNum, "Invalid room Id");
        _;
    }

    modifier validAppoRange(uint256 _t, uint8 _r) {
        isMod86400(_t);
        require(_r <= 365 && _r > 0, "1-365");
        _;
    }

    modifier validName(string memory _s) {
        require(bytes(_s).length != 0, "blank");
        _;
    }

    constructor(
        uint64 _initialPrice,
        uint16 _roomNum
    ) {
        deployTime = block.timestamp;
        hotelToken = new HotelToken(address(this));
        owner = payable(msg.sender);
        timeManager = new TimeManager();
        hotelTokenPrice = _initialPrice;
        roomNum = _roomNum;
    }

    function validateTimestamp(uint256 _t) private view {
        require(
            _t > deployTime,
            "before deploy"
        );
        isMod86400(_t);
    }

    function isMod86400(uint256 _t) private pure {
        require(
            _t % 86400 == 0,
            "mod 86400"
        );
    }

    //フロントエンドから使用
    function getUnixTimestamp(
        uint16 _year,
        uint8 _month,
        uint8 _day
    ) external view returns (uint256) {
        return timeManager.toTimestamp(_year, _month, _day);
    }

    //ユーザのトークン残高
    function getTokenBalance(address _addr) external view returns (uint256) {
        return hotelToken.balanceOf(_addr);
    }

    //ユーザの予約確認
    function getUserAppo(address _addr)
        external
        view
        returns (UserBooking[] memory)
    {
        return userBookings[_addr];  //UserBooking型配列が返る
    }

    //予約表確認
    function getAppoList(uint16 _roomId, uint256 _start, uint8 _numDays) 
        external
        view
        validRoomId(_roomId)
        validAppoRange(_start, _numDays)
        returns (uint256[] memory)
    {

        // up to 31 days in a month
        uint256[] memory monthlyAppointments = new uint256[](_numDays);
        for (uint256 i = 0; i < _numDays; ) {
            Appointment memory foundAppointment = scheduleByTimestamp[_roomId][_start + (i * 86400)];
            if (foundAppointment.isAppointment) {
                monthlyAppointments[i] = 1;
            }
            unchecked{ i++; }
        }

        return monthlyAppointments;
    }

    function bookAppo(
        uint16 _roomId,
        string calldata _name,
        uint256 _timestamp,
        uint8 _numDays
    )
        external
        validRoomId(_roomId)
        validName(_name)
        validTimestamp(_timestamp)
        validNumDays(_numDays)
    {
        hotelToken.burnToken(msg.sender, _numDays);

        for (uint256 i = 0; i < _numDays; ) {
            require(
                scheduleByTimestamp[_roomId][_timestamp + (86400 * i)].isAppointment !=
                    true,
                "Appointment already exists"
            );

            scheduleByTimestamp[_roomId][_timestamp + (86400 * i)] = Appointment(
                true,
                _name,
                msg.sender
            );
            unchecked{ i++; }
        }
        userBookings[msg.sender].push(UserBooking(_timestamp, _numDays, false, _roomId));

        emit AppoScheduled(msg.sender, _timestamp, _numDays, _roomId);
    }

    function removeUserBooking(uint8 _indexToDelete) internal {
        require(_indexToDelete < userBookings[msg.sender].length);
        userBookings[msg.sender][_indexToDelete] = userBookings[msg.sender][
            userBookings[msg.sender].length - 1
        ];
        userBookings[msg.sender].pop();
    }

    // 予約キャンセル
    function refundAppo(uint8 _index) external {
        // first get the timestamp and numdays from timestamp from the index
        require(userBookings[msg.sender][_index].isCheckedIn != true, "You have already checked in");
        uint256 timestamp = userBookings[msg.sender][_index].timestamp;
        uint8 numDays = userBookings[msg.sender][_index].numDays;
        uint16 roomId = userBookings[msg.sender][_index].roomId;
        require(timestamp > 0 && numDays > 0, "no booking found");
        validateTimestamp(timestamp);
        // cannot cancel past
        require(
            timestamp > block.timestamp,
            "cannot cancel events in the past"
        );
        
        for (uint256 i = 0; i < numDays; ) {
            uint256 currDay = timestamp + (86400 * i);
            require(
                scheduleByTimestamp[roomId][currDay].isAppointment == true,
                "not exist appo"
            );
            require(
                scheduleByTimestamp[roomId][currDay].userAddress == msg.sender,
                "You haven't appo"
            );
            //delete
            scheduleByTimestamp[roomId][currDay].isAppointment = false;
            unchecked{ i++; }
        }
        //予約の削除
        removeUserBooking(_index);
        //トークンの返済
        hotelToken.mintToken(msg.sender, numDays);
        //UIに反映するためのイベントのemit
        emit AppoRefunded(msg.sender, timestamp, numDays, _index);
    }

    //1トークンごとのETHを指定する
    function changeTokenPrice(uint64 _newPrice) external onlyOwner {
        require(_newPrice > 0, "above zero");
        uint64 temp = hotelTokenPrice;
        hotelTokenPrice = _newPrice;
        emit TokenPriceChanged(temp, _newPrice);
    }

    function buyTokens(uint256 _numTokens) external payable {
        require(msg.value > 0, "no ether");
        require(msg.value >= (hotelTokenPrice * _numTokens), "not enough ether");
        // transfer ETH to owner account
        (bool sent, ) = owner.call{value: hotelTokenPrice * _numTokens}("");  //call function
        require(sent, "Failed to send");

        uint64 excessEth = uint64(msg.value - (hotelTokenPrice * _numTokens));
    
        if (excessEth > 0) {
            payable(msg.sender).transfer(excessEth);
        }
        
        hotelToken.mintToken(msg.sender, _numTokens);
        // use hotelTokenPrice for easy human-readable USD value
        emit TokenBought(msg.sender, _numTokens, hotelTokenPrice);
    }

    function checkIn(uint256 _timestamp, uint8 _index) external validTimestamp(_timestamp) { //チェックインする日にち予約番号
        uint16 roomId = userBookings[msg.sender][_index].roomId;
        Appointment memory appointment = scheduleByTimestamp[roomId][_timestamp];
        //実際にはblock.timestampをmod86400できりおとし、それと_timestampが一致するか同課のrequireを追加する
        //require(_timestamp == timeManager.marume86400(block.timestamp), "This is not today");  ///test
        require(appointment.isAppointment, "No appo exists");
        require(appointment.userAddress == msg.sender, "You have no appo");
        require(userBookings[msg.sender][_index].isCheckedIn != true, "already checked in");

        //チェックイン
        userBookings[msg.sender][_index].isCheckedIn = true;

        emit CheckedIn(msg.sender, block.timestamp);
    }

    function checkOut(uint256 _timestamp, uint8 _index) external validTimestamp(_timestamp) {
        uint16 roomId = userBookings[msg.sender][_index].roomId;
        Appointment memory appointment = scheduleByTimestamp[roomId][_timestamp];
        require(appointment.isAppointment, "No appo exists");
        require(appointment.userAddress == msg.sender, "You have no appo");
        require(userBookings[msg.sender][_index].isCheckedIn == true, "You have not checked in");

        //チェックアウト
        roomPasses[roomId].set = false;
        userBookings[msg.sender][_index].isCheckedIn = false;
        removeUserBooking(_index);  //予約を削除
        emit CheckedOut(msg.sender, block.timestamp);
    }

    //チェックインして部屋に入る前に実行する関数
    function roomPassSet(uint256[6] calldata _input, uint256 _timestamp, uint8 _index) external validTimestamp(_timestamp) {
        uint16 roomId = userBookings[msg.sender][_index].roomId;
        Appointment memory appointment = scheduleByTimestamp[roomId][_timestamp];
        require(roomPasses[roomId].set == false, "You have already set pass");
        require(appointment.isAppointment, "No appo exists");
        require(appointment.userAddress == msg.sender, "You have no appo");
        require(userBookings[appointment.userAddress][_index].isCheckedIn, "You have not checked in");

        for (uint256 i = 0; i < 6; ) {
            require(0 <= _input[i] && _input[i] < 10, "password must be 6num");
            unchecked{ i++; }
        }

        roomPasses[roomId].password = uint256(keccak256(abi.encodePacked(_input)));//

        roomPasses[roomId].set = true;  //issue
        // Emit an event with the one-time code
        emit roomPassOK(appointment.userAddress, block.timestamp);
    }

    function isPassSet(uint16 _roomId) external view returns (bool) {
        return roomPasses[_roomId].set;
    }

    //開錠関数
    function keyOpen(uint256[6] calldata _input, uint256 _timestamp, uint8 _index) external validTimestamp(_timestamp) {
        uint16 roomId = userBookings[msg.sender][_index].roomId;
        Appointment memory appointment = scheduleByTimestamp[roomId][_timestamp];
        require(appointment.isAppointment, "No appo exists");
        require(appointment.userAddress == msg.sender, "You have no appo");
        require(userBookings[appointment.userAddress][_index].isCheckedIn, "You have not checked in");
        require(roomKeyStates[roomId] == false, "already opened");
        require(roomPasses[roomId].set == true, "Please set your password");
        require(roomPasses[roomId].password == uint256(keccak256(abi.encodePacked(_input))), "incorrect password");

        roomKeyStates[roomId] = true;

        emit keyOpened(appointment.userAddress, block.timestamp);  //roomnum
    }

    function keyLock(uint256 _timestamp, uint8 _index) external validTimestamp(_timestamp) {
        uint16 roomId = userBookings[msg.sender][_index].roomId;
        Appointment memory appointment = scheduleByTimestamp[roomId][_timestamp];
        require(appointment.isAppointment, "No appo exists");
        require(appointment.userAddress == msg.sender, "You have no appo");
        require(userBookings[appointment.userAddress][_index].isCheckedIn, "You have not checked in");
        require(roomKeyStates[roomId] == true, "already closed");
        require(roomPasses[roomId].set == true, "Please set your password");
        //require(roomPass.used == true, "Room key must be used before locking");

        // Lock the room key
        roomKeyStates[roomId] = false;

        // Emit an event to indicate that the key is locked
        emit keyLocked(appointment.userAddress, block.timestamp);
    }

    function isDoorOpenStrict(uint256 _timestamp, uint8 _index) external validTimestamp(_timestamp) {
        uint16 roomId = userBookings[msg.sender][_index].roomId;
        Appointment memory appointment = scheduleByTimestamp[roomId][_timestamp];
        require(appointment.isAppointment, "No appo exists");
        require(appointment.userAddress == msg.sender, "You have no appo");
        require(userBookings[appointment.userAddress][_index].isCheckedIn, "You have not checked in");
        require(roomPasses[roomId].set == true, "Please set your password");

        emit checkKeyState(roomKeyStates[roomId], _timestamp);
    }

    //以下テスト用関数
    function showAppo(uint16 _roomId, uint256 _timestamp) external view validTimestamp(_timestamp) returns (Appointment memory appo) {
        appo = scheduleByTimestamp[_roomId][_timestamp];
    }

    function isCheckedIn(uint8 _index) external view returns (UserBooking memory booking) {
        booking = userBookings[msg.sender][_index];
    }

    function isDoorOpen(uint16 _roomId) external view returns (bool) {
        return roomKeyStates[_roomId];
    }
}