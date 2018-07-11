pragma solidity ^0.4.23;

import "./Dapptoken.sol";

contract Dapptokensale {
    address admin;
    //admin not public because do not want to expose
    Dapptoken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell (
        address _buyer,
        uint256 _amount
    );

    constructor(Dapptoken _tokenContract, uint256 _tokenPrice) public { 
        admin = msg.sender; 
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    } 
    function multiply(uint x, uint y) internal pure returns (uint z)  {
        require(y == 0 || (z = x * y) / y == x);
    }
    //buy tokens
    //declare function payable when it is sending tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        //in order to call function, need metadata: callers address and smount of ether sent in wei
        //msg.value is amount of wei being sent
        require(msg.value == multiply(_numberOfTokens, tokenPrice)); 
        require(tokenContract.balanceOf(this) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokensSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);

    }
    function endSale() public{
        require(msg.sender == admin);
        //return remaining tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));
        //destroy contract
        selfdestruct(admin);

    }
}