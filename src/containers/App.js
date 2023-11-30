import { React, Component } from 'react';
import './App.css';
import Web3 from 'web3';
import SmartHotel from '../truffle_abis/SmartHotel.json';
import Navbar from '../components/Navbar/Navbar';
import Main from '../components/Main/Main';
import MonthDay from './MonthDay';


class App extends Component {

  async componentDidMount() {
    await this.loadweb3(); //web3をload
    await this.loadBlockChainData();
    await this.getTodayTimestamp();
    await this.isPassSet(this.state.myAppos);
    
    // await this.buyTokens(3);
    // const start = await this.state.smartHotel.methods.getUnixTimestamp(2023, 12, 11).call();
    // await this.bookAppo(0, 'foomin', start, 3);
    // await this.refundAppo(0);
    // let arr = await this.getMonthlyAppoList(0, 2023, 12);
    // console.log(arr);
    // await this.getTokenBalance();
    // console.log(this.state);
    // let appos = await this.getMyAppos();
    // if (appos[0]) {
    //   console.log(appos);
    // }
    // let time = appos[0].timestamp;
    // console.log(time);
    // const time = await this.state.smartHotel.methods.getUnixTimestamp(2023, 12, 11).call();
    // await this.checkIn(time, 0);
    await this.getTokenBalance();
    console.log(this.state);
    // appos = await this.getMyAppos();
    // console.log(appos);
    // const password = [0, 0, 0, 0, 0, 0];
    // await this.setPassword(password, time, 0);
    // await this.checkOut(time, 1);
    // appos = await this.getMyAppos();
    // console.log(appos);
    // arr = await this.getMonthlyAppoList(0, 2023, 12);
    // console.log(arr);

    this.setState({timestamp: '1705276800'}) //checkIn test
  }

  loadweb3 = async () => {
    if (window.ethereum) { //ethereumを探知したら
      window.web3 = new Web3(window.ethereum); //インスタンス生成
      await window.ethereum.enable(); //window.ethereumを有効にする
    } else if (window.web3) { //windowにweb3を検知
      window.web3 = new Web3(window.web3.currentProvider); //現在のプロバイダを使用
    } else {
      window.alert('No ethereum browser and Metamask.');
    }
  };

  loadBlockChainData = async () => {
    const web3 = window.web3;
    const account = await web3.eth.getAccounts();
    this.setState({account: account[0]});
    const networkId = await web3.eth.net.getId(); 

    //SmartHotelをload
    const smartHotelData = SmartHotel.networks[networkId];
    if (smartHotelData) {
      const smartHotel = new web3.eth.Contract(SmartHotel.abi, smartHotelData.address);
      this.setState({smartHotel: smartHotel});
      let price = await smartHotel.methods.hotelTokenPrice().call();
      this.setState({tokenPrice: price});
      let roomNum = await smartHotel.methods.roomNum().call();
      this.setState({roomNum: roomNum});
      const deployTime = await smartHotel.methods.deployTime().call();
      this.setState({deployTime: deployTime});
      let tokenBalance = await smartHotel.methods.getTokenBalance(this.state.account).call();
      this.setState({tokenBalance: tokenBalance});
      let myAppos = await smartHotel.methods.getUserAppo(this.state.account).call()
      this.setState({myAppos: myAppos});

    } else {
      window.alert('No detect contract');
    }

    this.setState({loading: false});
  };

  changeToTimestamp = async (year, month, day) => {
    const timestamp = await this.state.smartHotel.methods.getUnixTimestamp(year, month, day).call();
    return timestamp;
  }

  getTodayTimestamp = async () => {  //mod86400timestamp取得
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();

    const unixTimestamp = await this.state.smartHotel.methods.getUnixTimestamp(year, month, day).call();
    this.setState({timestamp: unixTimestamp});
  };

  getTokenBalance = async () => { //userのトークン表示更新
    const tokenBalance = await this.state.smartHotel.methods.getTokenBalance(this.state.account).call();
    this.setState({tokenBalance: tokenBalance});
  };

  getMonthlyAppoList = async (roomId, year, month) => { //部屋の予約表を確認
    const monthDay = MonthDay(year, month);
    //console.log('monthday', monthDay);
    const start = await this.state.smartHotel.methods.getUnixTimestamp(year, month, 1).call();
    const AppoList = await this.state.smartHotel.methods.getAppoList(roomId, start, monthDay).call();
    return AppoList;
  };

  // getMyAppos = async () => {  //自分の予約確認
  //   const appos = await this.state.smartHotel.methods.getUserAppo(this.state.account).call();
  //   return appos;
  // };

  buyTokens = async (tokenNum) => {
    this.setState({loading: true});
    await this.state.smartHotel.methods.buyTokens(tokenNum).send({
      from: this.state.account, 
      gasLimit: 3000000,
      value: (tokenNum * Number(this.state.tokenPrice))
    })
    .on('transactioHash', (hash) => {});
    let tokenBalance = await this.state.smartHotel.methods.getTokenBalance(this.state.account).call();
    this.setState({tokenBalance: tokenBalance});
    this.setState({loading: false});
  };

  bookAppo = async (roomId, partyName, year, month, day, span) => {  //startにはtimestampを入れる
    this.setState({loading: true});
    const start = await this.changeToTimestamp(year, month, day);
    await this.state.smartHotel.methods.bookAppo(roomId, partyName, start, span).send({
      from: this.state.account,
      gasLimit: 3000000
    })
    .on('transactioHash', (hash) => {});
    let tokenBalance = await this.state.smartHotel.methods.getTokenBalance(this.state.account).call();
    this.setState({tokenBalance: tokenBalance});
    let myAppos = await this.state.smartHotel.methods.getUserAppo(this.state.account).call()
    this.setState({myAppos: myAppos});
    this.setState({loading: false});
  };

  refundAppo = async (appoIndex) => {
    this.setState({loading: true});
    await this.state.smartHotel.methods.refundAppo(appoIndex).send({
      from: this.state.account,
      gasLimit: 3000000
    })
    .on('transactioHash', (hash) => {});
    let myAppos = await this.state.smartHotel.methods.getUserAppo(this.state.account).call()
    this.setState({myAppos: myAppos});
    let tokenBalance = await this.state.smartHotel.methods.getTokenBalance(this.state.account).call();
    this.setState({tokenBalance: tokenBalance});
    this.setState({loading: false});
  };

  checkIn = async (timestamp, appoIndex) => {
    this.setState({loading: true});
    await this.state.smartHotel.methods.checkIn(timestamp, appoIndex).send({
      from: this.state.account,
      gasLimit: 3000000
    })
    .on('transactioHash', (hash) => {});
    let myAppos = await this.state.smartHotel.methods.getUserAppo(this.state.account).call()
    this.setState({myAppos: myAppos});
    await this.isPassSet(this.state.myAppos);
    this.setState({loading: false});
  };

  setPassword = async (password, timestamp, appoIndex) => {
    this.setState({loading: true});
    await this.state.smartHotel.methods.roomPassSet(password, timestamp, appoIndex).send({
      from: this.state.account,
      gasLimit: 3000000
    })
    .on('transactioHash', (hash) => {});
    await this.isPassSet(this.state.myAppos);
    this.setState({loading: false});
  }

  isPassSet = async (myAppos) => {
    let boolarr = [];
    for (let i = 0; i < myAppos.length; i++) {
      const set = await this.state.smartHotel.methods.isPassSet(Number(myAppos[i].roomId)).call();
      boolarr.push(set);
    }
    this.setState({passBools: boolarr});
  }

  checkOut = async (timestamp, appoIndex) => {
    this.setState({loading: true});
    await this.state.smartHotel.methods.checkOut(timestamp, appoIndex).send({
      from: this.state.account,
      gasLimit: 3000000
    })
    .on('transactioHash', (hash) => {});
    let myAppos = await this.state.smartHotel.methods.getUserAppo(this.state.account).call()
    this.setState({myAppos: myAppos});
    this.setState({loading: false});
  }

  constructor() {
    super();
    this.state = {
      account: '0x0',
      smartHotel: {},
      deployTime: '0',
      roomNum: '0',
      tokenPrice: '0',
      myAppos: [],
      passBools: [],
      tokenBalance: '0',
      timestamp: '',
      loading: true
    }
  }

  render() {
    let content;

    if (this.state.loading) {
      content = <p id='loader' className='load black'>
        LOADING...
      </p>
    } else {
      content = <div>
        <Navbar account={this.state.account}/>
        <Main 
          className='main'
          acount={this.state.account}
          smartHotel={this.state.smartHotel}
          deployTime={this.state.deployTime}
          roomNum={this.state.roomNum}
          tokenPrice={this.state.tokenPrice}
          myAppos={this.state.myAppos}
          passBools={this.state.passBools}
          tokenBalance={this.state.tokenBalance}
          timestamp={this.state.timestamp}
          changeToTimestamp={this.changeToTimestamp}
          getMonthlyAppoList={this.getMonthlyAppoList}
          buyTokens={this.buyTokens}
          bookAppo={this.bookAppo}
          refundAppo={this.refundAppo}
          checkIn={this.checkIn}
          setPassword={this.setPassword}
          checkOut={this.checkOut}
        />
      </div>;
    }

    return (
      <div>
        {content}
      </div>
    )
  }
}

export default App;

