App = {
    web3Provider : null,
    contracts: {},
    account: "0x0",
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000 ,
    init: function() {
        console.log("App initialized")
        return App.initWeb3();
    },
    initWeb3: function(){
        if (typeof web3 != "undefined") {
            //if web3 instance is already provided by metamask
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider)
        } else {
            //specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContracts();
    },
    initContracts: function() {
        //browsersync knows contracts directory- can reference abstractions directly, its exposed to root of project
        //here we are: summoning the contract abstractions created by truffle
        $.getJSON('Dapptokensale.json', function(dappTokenSale){
            App.contracts.Dapptokensale = TruffleContract(dappTokenSale);
            App.contracts.Dapptokensale.setProvider(App.web3Provider);
            App.contracts.Dapptokensale.deployed().then(function(dappTokenSale){
                console.log("Dapp Token Sale Address", dappTokenSale.address);
            })
        }).done(function(){
            $.getJSON("Dapptoken.json", function(dappToken){
                App.contracts.Dapptoken = TruffleContract(dappToken);
                App.contracts.Dapptoken.setProvider(App.web3Provider);
                App.contracts.Dapptoken.deployed().then(function(dappToken){
                    console.log("Dapp token address", dappToken.address)
                })
                App.listenForEvents();
                return App.render();
            })
        })
    },
    listenForEvents: function(){
        App.contracts.Dapptokensale.deployed().then(function(instance){
            instance.Sell({},{
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function(error, event){
                console.log("event trigggered", event);
                App.render();
            })
        })

    },
    render: function() {
        if (App.loading) {
            return;
        }
        App.loading = true;

        var loader = $('#loader')
        var content = $('#content')

        loader.show()
        content.hide()

        //load account data
        web3.eth.getCoinbase(function(err, account){
            if(err === null){
                App.account = account
                $('#accountAddress').html("Your account: " + account);
            }
        })
        //load tokensale contract
        App.contracts.Dapptokensale.deployed().then(function(instance){
            dappTokenSaleInstance = instance;
            return dappTokenSaleInstance.tokenPrice();
        }).then(function(tokenPrice){
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
            return dappTokenSaleInstance.tokensSold()
        }).then(function(tokensSold){
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold)
            $('.tokens-available').html(App.tokensAvailable)

            var progressPercent = (App.tokensSold / App.tokensAvailable) * 100
            $('#progress').css('width', progressPercent + '%')

            //load token contract
            App.contracts.Dapptoken.deployed().then(function(instance){
                dappTokenInstance = instance
                return dappTokenInstance.balanceOf(App.account)
            }).then(function(balance){
                $('.dapp-balance').html(balance.toNumber())
                
                //wait until async activity is done to hide loader and show content
                App.loading = false
                loader.hide()
                content.show()
            })

        })         


    },
    buyTokens: function(){
        $('#content').hide();
        $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.Dapptokensale.deployed().then(function(instance){
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 900000
            })
        }).then(function(result){
            console.log("Tokens bought...")
            $('#form').trigger('reset');
        })
    }

}

$(function(){
    $(window).load(function(){
        App.init();
    })
})