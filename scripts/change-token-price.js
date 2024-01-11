const SmartHotel = artifacts.require('SmartHotel');

module.exports = async function changeTokenPrice(callback) {
    let smartHotel = await SmartHotel.deployed();
    await smartHotel.changeTokenPrice(process.argv[4].toString());
    console.log('Token price have been changed successfully.');
    callback();
}

//truffle exec scripts/change-token-price.js 20000000000000000