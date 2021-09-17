const assert = require('assert'); // NodeJS Assert for assertion testing
const ganache = require('ganache-cli'); // Local test network
const Web3 = require('web3'); //
const web3 = new Web3(ganache.provider()); // Provider() allows us to connect to any given network

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts(); // Get all accounts associated with contract

    lottery = await new web3.eth.Contract(JSON.parse(interface))
                .deploy({ data: bytecode })
                .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('Deploys a Contract', () => { 
        assert.ok(lottery.options.address); // Make sure contract address is a value
    });
});

