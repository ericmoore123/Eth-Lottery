const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");

const dotenv = require("dotenv");
dotenv.config();

const provider = new HDWalletProvider(
  process.env.METAMASK_PHRASE, // updated to use environment variables for security reasons
  "https://rinkeby.infura.io/v3/03b894913cb6484a938b6e46cbbbdeeb"
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode }) // No initial arguments needed for this contract
    .send({ gas: "1000000", gasPrice: '500000000', from: accounts[0] });

  console.log("Contract deployed to", result.options.address);
};
deploy();
