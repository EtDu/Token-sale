var Dapptoken = artifacts.require("./Dapptoken.sol");

contract('Dapptoken', function(accounts){
    var tokenInstance;

    it('initializes contract with the correct values', function(){
        return Dapptoken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name){
            assert.equal(name, 'Dapptoken', 'has the corrext name')
            return tokenInstance.symbol();
        }).then(function(symbol){
            assert.equal(symbol, 'DAPP', 'has the correct symbol')
            return tokenInstance.standard();
        }).then(function(standard){
            assert.equal(standard, 'Dapptoken V1.0', 'has the correct standard')
        })
    })


    it ('allocates the total supply upon deployment', function(){
        return Dapptoken.deployed().then(function(instance){
            tokenInstance = instance
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(), 1000000, "sets the total supply to 1000000");
            return tokenInstance.balanceOf(accounts[0])
        }).then(function(adminBalance){
            assert.equal(adminBalance.toNumber(), 1000000, "allocates initial supply to admin account");
            
        })
    })

    it ('transfers ownership of tokens', function(){
        return Dapptoken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 9999999999);
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert')
            return tokenInstance.transfer.call(accounts[1], 250000, { from : accounts[0]});
        }).then(function(success){
            assert.equal(success, true, 'it returns true')
            return tokenInstance.transfer(accounts[1], 250000, { from : accounts[0] });
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the transfer event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs account tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs account tokens are sent to');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 250000, 'adds the right amount to receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 750000, 'deducts the amount from sender');
        })
    })

    it ('approves tokens for delegated transfer', function(){
        return Dapptoken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
            //call calls function in solidity without writing to the blockchain
        }).then(function(success){
            assert.equal(success, true, 'it returns true')
            return tokenInstance.approve(accounts[1], 100, {from:accounts[0]});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the approval event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs account tokens authorizes by');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs account tokens authorized to');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
            return tokenInstance.allowance(accounts[0], accounts[1],);
        }).then(function(allowance){
            assert.equal(allowance.toNumber(), 100, 'stores allowance for delegated transfer')
        })
    })

    it ('handles delegated transfer', function(){
        return Dapptoken.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            return tokenInstance.transfer(fromAccount, 100, {from:accounts[0]})
        }).then(function(receipt){
            return tokenInstance.approve(spendingAccount, 10, {from:fromAccount})
        }).then(function(receipt){
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from:spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from:spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from:spendingAccount});
            //.call just inspects the return value of the function
        }).then(function(success){
            assert.equal(success, true);
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from:spendingAccount});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the transfer event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the sending account');
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the receiving account');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the spending amount');
            return tokenInstance.balanceOf(fromAccount)
        }).then(function(balance){
            assert.equal(balance.toNumber(), 90, 'deducts amount from the sending account');
            return tokenInstance.balanceOf(toAccount)
        }).then(function(balance){
            assert.equal(balance.toNumber(), 10, 'credits amount to receiving account');
            return tokenInstance.allowance(fromAccount, spendingAccount)
        }).then(function(allowance){
            assert.equal(allowance.toNumber(), 0, 'deducts amount from allowance');
        })
    })

})
//Can run tests based on failure or success 
//do your tests without changing the block chain first