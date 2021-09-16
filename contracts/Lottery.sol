pragma solidity ^0.4.17; 

contract Lottery{
    
    address public manager;
    address[] public players;
    
    function Lottery() public {
        manager = msg.sender; // Set manager to sender of contract (owner of Lottery contract)
    }
    
    function getParticipants() public view returns (address[]){ //View because it does not change data, returns players address array
        return players;
    }
    
    function enterLottery() public payable { // If player sends 0.01 of Eth (in wei), accept them into players array
        require(msg.value > 0.01 ether);
        
        players.push(msg.sender);
    }
    
    function randomNumber() private view returns (uint) { // Take 3 pieces of pseudo-randomness and feeds them into the sha3 algorithm shaw al
        return uint(sha3(block.difficulty, now, players)); // Turns random-ish hash into uint and returns it
    }
    
    function getWinner() public restrictPermissions { // Uses function modifier
        // require(msg.sender == manager); // Require that the person calling getWinner is the manager of the contract
        
        uint player = randomNumber() % players.length; // Get player whos remainder is arrays index
        players[player].transfer(this.balance); // Transfer takes ALL money from current contract and sends to address provided
    
        players = new address[](0); // Reinitialize players array to be dynamic and initialize its starting size to zero
    }
    
    modifier restrictPermissions() { // Function modifier to avoid code redundancy and repetition
        require(msg.sender == msg.sender);
        _; // Underscore represents all code from functions you add the modifier to (is required)
    }
    
}