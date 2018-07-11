pragma solidity ^0.4.23;

contract Dapptoken {

    string public name = "Dapptoken";
    string public symbol = "DAPP";
    string public standard = "Dapptoken V1.0";

    event Transfer (
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval (
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
    
    uint public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    //geter function for free because pubic variable
    //first addy allowing second addy to transfer x amount of tokens
    
    constructor(uint256 _initialSupply) public {
        //underscore is convention for vars only available inside function (local)
        totalSupply = _initialSupply;
        // state variable, accessable to entire contract
        balanceOf[msg.sender] = _initialSupply;
        // msg.sender in this case is the first addy in ganache, defaults to [0]
    }
    //TRANSFER
    function transfer(address _to, uint256 _value) public returns (bool success){
        //must throw if sender doesn't have enough
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        //must return transfer event
        emit Transfer(msg.sender, _to, _value);

        //must return a boolean
        return true;
    
    }

    //approve function
    function approve(address _spender, uint256 _value) public returns (bool success){
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;

    }
    //transfer from function
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        require(allowance[_from][msg.sender] >= _value);
        require(balanceOf[_from] >= _value);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;

    }
}