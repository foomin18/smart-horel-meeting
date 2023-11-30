// eslint-disable-next-line no-undef
const SmartHotel = artifacts.require('SmartHotel');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(SmartHotel, '10000000000000000', '10');
    //const hotel = await SmartHotel.deployed();
}