const {
	time,
	loadFixture,
} = require('@nomicfoundation/hardhat-network-helpers')
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs')
const { expect } = require('chai')
const { useTabs } = require('prettier-plugin-solidity/src/options')
const nodes = require('prettier-plugin-solidity/src/nodes')
const { ThrowStatement } = require('prettier-plugin-solidity/src/nodes')
const { ethers, tasks } = require('hardhat')

// const voucher = { tokenId, uri, minPrice }
// const domain = await this._signingDomain()
let voucher
const types = {
	NFTVoucher: [
		{ name: 'tokenId', type: 'uint256' },
		{ name: 'minPrice', type: 'uint256' },
		{ name: 'uri', type: 'string' },
		{ name: 'buyer', type: 'address' },
	],
}
describe('LazyMinting', async function () {
	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshopt in every test.
	async function deployTokenFixture() {
		// Contracts are deployed using the first signer/account by default
		const [owner, user] = await ethers.getSigners()

		const LazyMinting = await ethers.getContractFactory('LazyMinting')
		const lazyMinting = await LazyMinting.deploy()
		console.log('lazy Minting address:', lazyMinting.address)

		voucher = { tokenId: 1, minPrice: 1, uri: '', buyer: owner.address }
		return { lazyMinting, owner, user }
	}
	describe('Name & symbol', function () {
		it('Should have same Name', async function () {
			const { lazyMinting } = await loadFixture(deployTokenFixture)
			expect(await lazyMinting.name()).to.equal('LazyMinting')
		})

		it('Should have same symbol', async function () {
			const { lazyMinting } = await loadFixture(deployTokenFixture)

			expect(await lazyMinting.symbol()).to.equal('LM')
		})

		it('Reddem NFT', async function () {
			const { lazyMinting, owner, user } = await loadFixture(
				deployTokenFixture
			)
			const signature = await user._signTypedData(
				{
					name: 'LazyMntng',
					version: '1',
					chainId: 80001,
					verifyingContract: lazyMinting.address,
				},
				types,
				voucher
			)
			// console.log(signature)
			// console.log('user Addss', user.address)
			// console.log('owner addsss', owner.address)
			await lazyMinting.connect(user).redeem(voucher, signature, {
				value: ethers.utils.parseEther('0.05'),
			})

			console.log(
				await lazyMinting
					.connect(user)
					.totalWithdrawAmount(owner.address)
			)
		})
		it('error if Reddem same  NFT multiple times', async function () {
			const { lazyMinting, owner, user } = await loadFixture(
				deployTokenFixture
			)
			const signature = await user._signTypedData(
				{
					name: 'LazyMntng',
					version: '1',
					chainId: 80001,
					verifyingContract: lazyMinting.address,
				},
				types,
				voucher
			)

			await lazyMinting.connect(user).redeem(voucher, signature, {
				value: ethers.utils.parseEther('0.05'),
			})

			await expect(
				lazyMinting.connect(user).redeem(voucher, signature, {
					value: ethers.utils.parseEther('1'),
				})
			).to.be.reverted
		})

		it('if Reddem different  NFT multiple times', async function () {
			const { lazyMinting, owner, user } = await loadFixture(
				deployTokenFixture
			)
			let signature = await user._signTypedData(
				{
					name: 'LazyMntng',
					version: '1',
					chainId: 80001,
					verifyingContract: lazyMinting.address,
				},
				types,
				voucher
			)
			await lazyMinting.connect(user).redeem(voucher, signature, {
				value: ethers.utils.parseEther('1'),
			})

			await lazyMinting
				.connect(user)
				.redeem(
					{ tokenId: 2, minPrice: 1, uri: '', buyer: owner.address },
					signature,
					{
						value: ethers.utils.parseEther('0.001'),
					}
				)
		})
	})
})
