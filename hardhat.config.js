require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
const MATIC_KEY = process.env.MATIC_PRIVATE_KEY
module.exports = {
	solidity: '0.8.9',
	networks: {
		matic: {
			url: process.env.MUMBAI_RPC_URL,
			accounts: [`0x${MATIC_KEY}`],
			chainId: 80001,
		},
	},
}
