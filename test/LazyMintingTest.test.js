/* eslint-disable */

const { BigNumber } = require('@ethersproject/bignumber')
const chai = require('chai')
const { expect, bignumber, assert } = chai
const { ethers, network } = require('hardhat')
const { solidity } = require('ethereum-waffle')
chai.use(solidity)

let lazyMinting, owner, addr1, addr2, addr3

describe.skip('Lazy Minting', () => {
	beforeEach(async () => {
		;[owner, addr1, addr2, addr3] = await ethers.getSigners()

		const LazyMinting = await ethers.getContractFactory('LazyMinting')

		lazyMinting = await LazyMinting.deploy()
		await lazyMinting.deployed()
	})

	describe('crowdsale contract', () => {
		it('tracks the name', async function () {
			console.log(
				'Lazy Minting contract deployed to',
				lazyMinting.address
			)
			console.log(await lazyMinting.name())
			// expect(await lazyMinting.name()).to.equal('LazyMinting')
		})
	})
})
