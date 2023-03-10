const hre = require("hardhat");
const {ethers, upgrades} = require("hardhat");
// const {expect} = require("chai");

async function main() {
    let [deployer] = await ethers.getSigners()
    const ERC20Token = await hre.ethers.getContractFactory(
        'ERC20Token',
        deployer,
    )
    const erc20ContractProxy = await hre.upgrades.deployProxy(
        ERC20Token,
        ['DUX', 'DUX', deployer.address, 100000],
        {
            initializer: 'initialize',
        },
    )
    await erc20ContractProxy.deployed()
    console.log('erc20ContractProxy : ' + erc20ContractProxy.address)

    const ERC721Token = await ethers.getContractFactory('ERC721Token', deployer)
    const erc721ContractProxy = await upgrades.deployProxy(
        ERC721Token,
        ['GAME', 'GAM', deployer.address],
        {
            initializer: 'initialize',
        },
    )
    await erc721ContractProxy.deployed()

    console.log('erc721ContractProxy : ' + erc721ContractProxy.address)

    const AuthoritativeToken = await ethers.getContractFactory(
        'AuthoritativeToken',
        deployer,
    )
    const authoritativeTokenProxy = await upgrades.deployProxy(
        AuthoritativeToken,
        [
            erc721ContractProxy.address,
            erc20ContractProxy.address,
            deployer.address,
        ],
        {
            initializer: 'initialize',
        },
    )
    await authoritativeTokenProxy.deployed()
    console.log('authoritativeToken : ' + authoritativeTokenProxy.address)


    const erc721ContractProxyWithABISupport = await ERC721Token.attach(
        erc721ContractProxy.address,
    )
    const erc20ContractProxyWithABISupport = await ERC20Token.attach(
        erc20ContractProxy.address,
    )
    const authoritativeContractProxyWithABISupport = await AuthoritativeToken.attach(
        authoritativeTokenProxy.address,
    )

    const tnx1 = await erc721ContractProxyWithABISupport
        .connect(deployer)
        .setupExecutiveRole(authoritativeTokenProxy.address)
    await tnx1.wait()
    const tnx2 = await erc20ContractProxyWithABISupport
        .connect(deployer)
        .setupExecutiveRole(authoritativeTokenProxy.address)
    await tnx2.wait()

    console.log(await erc721ContractProxyWithABISupport.OWNER_ROLE())
    console.log(
        await erc721ContractProxyWithABISupport.getRoleAdmin(
            await authoritativeContractProxyWithABISupport.OWNER_ROLE(),
        ),
    )
    console.log(
        await erc721ContractProxyWithABISupport.hasRole(
            await authoritativeContractProxyWithABISupport.OWNER_ROLE(),
            deployer.address,
        ),
    )
    // await erc721ContractProxyWithABISupport.mintNewNFTThroughContract(deployer.address)
    const tnx3 = await erc20ContractProxyWithABISupport
        .connect(deployer)
        .approve(authoritativeTokenProxy.address, 10n ** 17n)
    await tnx3.wait()
    const tnx4 = await authoritativeContractProxyWithABISupport
        .connect(deployer)
        .mintNFT()
    await tnx4.wait()
    // await expect(
    //     erc721ContractProxyWithABISupport
    //         .connect(deployer)
    //         .mintNewNFTThroughContract(deployer.address),
    // ).to.be.reverted

    const tnx5 = await erc721ContractProxyWithABISupport.connect(deployer).approve(authoritativeContractProxyWithABISupport.address, 1)
    await tnx5.wait()
    const tnx6 = await authoritativeContractProxyWithABISupport.depositNFT(1)
    await tnx6.wait()
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});