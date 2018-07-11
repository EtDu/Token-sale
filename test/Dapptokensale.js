var Dapptokensale = artifacts.require("./Dapptokensale.sol");
var Dapptoken = artifacts.require("./Dapptoken.sol");


contract('Dapptokensale', function(accounts){
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000; //in wei
    var admin = accounts[0];
    var buyer = accounts[1];
    var numberOfTokens; 
    var tokensAvailable = 750000

    it('initializes the contract with the correct values', function(){
        return Dapptokensale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(function(address){
            assert.notEqual(address, 0x0, 'has contract address')
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenSaleInstance.tokenPrice()
        }).then(function(price){
            assert.equal(price, tokenPrice, 'Token price is correct')
        })
    })

    it('facilitates token buying', function(){
        return Dapptoken.deployed().then(function(instance){
            tokenInstance = instance
            return Dapptokensale.deployed()
        }).then(function(instance){
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from:admin})
        }).then(function(receipt){
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, {from:buyer, value:numberOfTokens * tokenPrice})
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be sell event')
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs account that purchased tokens')
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs amount of tokens purchased')
            return tokenSaleInstance.tokensSold();
        }).then(function(amount){
            assert.equal(amount.toNumber(), numberOfTokens, 'increments number of tokens sold')
            return tokenInstance.balanceOf(buyer)
        }).then(function(balance){
            assert.equal(balance.toNumber(), numberOfTokens);
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);

            //try to buy tokens different from the ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, {from:buyer, value:1})
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei!')
            return tokenSaleInstance.buyTokens(800000, {from:buyer, value: numberOfTokens * tokenPrice})
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available')
        })
    })
    //for require statements, test for the opposite being true with error catching

    it ('ends the token sale', function(){
        return Dapptokensale.deployed().then(function(instance){
            tokenSaleInstance = instance
            return tokenSaleInstance.endSale({from:buyer})
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert' >=0, 'must be admin to end the sale'))
            return tokenSaleInstance.endSale({from:admin})
        }).then(function(receipt){
            return tokenInstance.balanceOf(admin) 
        }).then(function(balance){
            assert.equal(balance.toNumber(), 999990, 'returns all unsold tokens to admin')
            //check that tokenprice was reset when self destruct was called 
        })
    })
})