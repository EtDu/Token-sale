var Dapptoken = artifacts.require("./Dapptoken.sol");
var Dapptokensale = artifacts.require("./Dapptokensale.sol")
//artifact creates contract abstraction to be run and to interact in JS runtime environment

module.exports = function(deployer) {
  deployer.deploy(Dapptoken, 1000000).then(function(){
    //0.001 ether price
    var tokenPrice = 1000000000000000;
    return deployer.deploy(Dapptokensale, Dapptoken.address, tokenPrice);
  })
  //deploy is async, deploys promise
  //can add constructor argument as argument 
};

//truffle console is a JS runtime environment   
 