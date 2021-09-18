const assert = require('assert'); // NodeJS Assert for assertion testing
const ganache = require('ganache-cli'); // Local test network
const Web3 = require('web3'); // Get web3 instance
const web3 = new Web3(ganache.provider()); //Create new web3 instance, Provider() allows us to connect to any given network
const { interface, bytecode } = require('../compile'); // Import Bytecode and ABI

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts(); // Get all accounts associated with contract
    
    lottery = await new web3.eth.Contract(JSON.parse(interface))
                .deploy({ data: bytecode })
                .send({ from: accounts[0], gas: '1000000' });
});

// Assert.ok() checks if value exists
describe('Lottery Contract', () => {
    it('Deploys a Contract', () => { 
        assert.ok(lottery.options.address); // Make sure contract address is a value
        console.log(`Contract deployed to: ${lottery.options.address}`);
    });

    it('Manager is assigned', async () => {
        const manager = await lottery.methods.manager().call(); // Call manager variable and verify it has a value assigned
        assert.ok(manager);
        // console.log(`Manager address is: ${manager}`);
    });

    it('Allows one account to enter lottery', async () => { // Make sure we can properly add a player to the players array
        await lottery.methods.enterLottery().send( //Enter us into lottery
            { from: accounts[0], value: web3.utils.toWei("0.011", 'ether') }
        );

        const players = await lottery.methods.getParticipants().call({ from: accounts[0] }); // Get all players entered into lottery

        assert.equal(accounts[0], players[0]); // Make sure address[0] is equal to the first players address added
        assert.equal(1, players.length); // Make sure players array only has 1 value
    }); 

    it('Allows multipe accounts to enter lottery', async () => { // Verify multiple players can be added to lottery
        await lottery.methods.enterLottery().send( 
            { from: accounts[0], value: web3.utils.toWei("0.011", 'ether') },
        );
        await lottery.methods.enterLottery().send( 
            { from: accounts[1], value: web3.utils.toWei("0.011", 'ether') },
        );
        await lottery.methods.enterLottery().send( 
            { from: accounts[2], value: web3.utils.toWei("0.011", 'ether') },
        );

        const players = await lottery.methods.getParticipants().call({ from: accounts[0] }); 

        assert.equal(accounts[0], players[0]); // Verify addresses correlate properly
        assert.equal(accounts[1], players[1]); 
        assert.equal(accounts[2], players[2]); 
        assert.equal(3, players.length); // Verify all 3 addresses were added
    });

    it('Requires a minimum amount of ether to enter', async () => {
        try{ //Attempt to run code in try section
            await lottery.methods.enterLottery().send(
                { from: accounts[0], value: 0 } // Sending insufficient ether
            );
            assert(false); // If this runs, test fails (Only really useful if values in try will change in future tests)
        }catch (err) { // If error in try secion, run catch error section
            assert(err); // Make sure error happened (truthy-ness)
        }
    });

    it('Only manager can pick winner', async () => { // Make sure anyone other thab manager gets kicked out o pickWinner() method
        try{
            await lottery.methods.getWinner().send(
                { from: accounts[1] } // Make call from wrong address
            );
            assert(false);
        }catch (err){
            assert(err);
        }
    });

    it('Sends money to winner, resets the players array', async () => {
        await lottery.methods.enterLottery().send( 
            { from: accounts[0], value: web3.utils.toWei("2", 'ether') },
        );
        
        const initialBalance = await web3.eth.getBalance(accounts[0]); // Returns contract balance in 'wei' assigned to an address
        await lottery.methods.getWinner().send(
            { from: accounts[0] } 
        );
        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('1.8', 'ether')); // Making sure the difference between starting and ending balance is greater than 1.8
                                                               // because we spend 'some' amount of ether on gas

    });

    
});

