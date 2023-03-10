const {ethers, upgrades} = require('hardhat')
const {expect} = require('chai')
const hre = require('hardhat')
const {
    getProxyAdminFactory,
} = require('@openzeppelin/hardhat-upgrades/dist/utils')
const {loadFixture} = require('@nomicfoundation/hardhat-network-helpers')

describe('Clone Logic Test with no constructor', function () {
    let deployer, alice, bob


    it('Exploit', async function () {
        [deployer, alice, bob] = await ethers.getSigners();
        const BaseContract = await hre.ethers.getContractFactory("ECR20BaseTokenV1")
        const contractInstance = await BaseContract.deploy();

        const FactoryBaseContract = await hre.ethers.getContractFactory("ERC20CloneFactory")
        const factoryContractInstance = await FactoryBaseContract.deploy(contractInstance.address);
        //
        const tnx1 = await factoryContractInstance.createClone()
        const receipt = await tnx1.wait();
        const firstEvent = (receipt.events.filter((event) => {
            return event?.topics[0] === '0x1a0f921ce3c6f2f0f6be5b624a487bc1d5143e1fd1833154f39ab63e13d89755'
        }))[0]

        const clonedContract = await BaseContract.attach(firstEvent.args[0]);
        await clonedContract.initialize("FGF","DFG",1000n*10n*18n)
        expect(await contractInstance.name()).to.be.equal("")
        expect(await clonedContract.name()).to.be.equal("FGF")

    })
})
