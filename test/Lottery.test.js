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

// Assert.ok() checks if value is 'truthy'
describe('Lottery Contract', () => {
    it('Deploys a Contract', () => { 
        assert.ok(lottery.options.address); // Make sure contract address is a value
        console.log(`Contract deployed to: ${lottery.options.address}`);
    });

    it('Manager is assigned', async () => {
        const manager = await lottery.methods.manager().call(); // Call manager variable and verify it has a value assigned
        assert.ok(manager);
        console.log(`Manager address is: ${manager}`);
    });

    it('More than 1 participant', async () => {
        const participants = await lottery.methods.getParticipants().call();
        assert.ok(participants.length == 0);
    });
    
});

