const hre = require('hardhat')

async function main() {
	const [owner, user] = await ethers.getSigners()

	const LazyMinting = await ethers.getContractFactory('LazyMinting')
	const lazyMinting = await LazyMinting.deploy()
	await lazyMinting.deployed()

	console.log('Lazy minting contract address', lazyMinting.address)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
