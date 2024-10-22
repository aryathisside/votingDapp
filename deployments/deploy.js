const hre = require("hardhat")

async function main() {

    const Voting = await ethers.getContractFactory("votingDapp")
    const VotingContract = await Voting.deploy()

    const VotingContractAddress = await VotingContract.getAddress()
    console.log(`Deployed Voting Contract at: ${VotingContractAddress}\n`)

}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

