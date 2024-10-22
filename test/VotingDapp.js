const { expect } = require("chai");
const { ethers } = require('hardhat');

describe('Voting Dapp', () => {
    let VotingContract, VotingContractAddress;
    let deployer, candidate1, candidate2, voter1, voter2;

    beforeEach(async () => {
        [deployer, candidate1, candidate2, voter1, voter2] = await ethers.getSigners();
        const Voting = await ethers.getContractFactory('votingDapp'); // Ensure this matches your contract name
        VotingContract = await Voting.deploy();

        VotingContractAddress = await VotingContract.getAddress();
        console.log(`VotingContractAddress: ${VotingContractAddress}`);
    });

    describe('Deployment', () => {
        it('Owner', async () => {
            expect(await VotingContract.i_owner()).to.equal(deployer.address);
        });
    });

    describe('Test', () => {
        let txn;

        beforeEach(async () => {
            txn = await VotingContract.connect(deployer).createPoll("First Test", [candidate1.address, candidate2.address]);
            await txn.wait();

            txn = await VotingContract.connect(voter1).vote(0, candidate1.address);
            await txn.wait();
        });

        describe('Success', () => {
            it('Poll Status', async () => {
                expect(await VotingContract.getPollStatus(0)).to.equal(true);
            });

            it('getTotalVotes', async () => {
                expect(await VotingContract.getTotalVotes(0)).to.equal(1);
            });

            it('candidates', async () => {
                const candidates = await VotingContract.getCandidates(0);
                expect(candidates.length).to.equal(2);
                console.log('candidates', candidates);
            });

            it('getTotalPolls', async () => {
                expect(await VotingContract.getTotalPolls()).to.equal(1);
            });

            it('getAllPollIdsWithTitles', async () => {
                const getAllPollIdsWithTitles = await VotingContract.getAllPollIdsWithTitles();
                console.log('getAllPollIdsWithTitles', getAllPollIdsWithTitles);
            });

            it('PollCreated Event', async () => {
                const txn = await VotingContract.connect(deployer).createPoll("First Test", [candidate1.address, candidate2.address]);
                await expect(txn)
                    .to.emit(VotingContract, 'PollCreated')
                    .withArgs(1, "First Test", [candidate1.address, candidate2.address]);
            });

            it('VoteCasted Event', async () => {
                await expect(txn)
                    .to.emit(VotingContract, 'VoteCasted')
                    .withArgs(0, voter1.address, candidate1.address);
            });

            describe('Closing Poll', () => {
                let closeTxn;

                beforeEach(async () => {
                    closeTxn = await VotingContract.connect(deployer).closePoll(0);
                    await closeTxn.wait();
                });

                it('closePoll', async () => {
                    expect(await VotingContract.getPollStatus(0)).to.equal(false);
                });

                describe('Declare Winner', () => {
                    let declareTxn;

                    beforeEach(async () => {
                        // Call to declare the winner
                        declareTxn = await VotingContract.connect(deployer).declareWinner(0);
                        const receipt = await declareTxn.wait(); // Wait for the transaction to be mined

                        // Check if events exist in the receipt
                        if (receipt.logs) { // Use logs instead of events
                            const winnerEvent = receipt.logs.find(log => {
                                const parsedLog = VotingContract.interface.parseLog(log);
                                return parsedLog.name === 'WinnerDeclared';
                            });

                            if (winnerEvent) {
                                const winnerAddresses = winnerEvent.args.winners;
                                console.log('Winners:', winnerAddresses);
                            } else {
                                console.error('WinnerDeclared event not found in logs.');
                            }
                        } else {
                            console.error('No logs emitted for this transaction.');
                        }
                    });

                    it('should declare the correct winner', async () => {
                        const receipt = await declareTxn.wait();
                        const winnerEvent = receipt.logs.find(log => {
                            const parsedLog = VotingContract.interface.parseLog(log);
                            return parsedLog.name === 'WinnerDeclared';
                        });

                        expect(winnerEvent).to.exist; // Ensure the event is emitted
                        const winnerAddresses = winnerEvent.args.winners;
                        expect(winnerAddresses).to.include(candidate1.address); // Replace with expected winner
                    });

                    it('should return correct poll results', async () => {
                        const [candidateAddresses, results] = await VotingContract.getPollResults(0);
                        expect(candidateAddresses.length).to.equal(2); // Ensure you have 2 candidates
                        expect(results.length).to.equal(2); // Ensure you have 2 results
                        expect(results[0]).to.equal(1); // candidate1 should have 1 vote
                        expect(results[1]).to.equal(0); // candidate2 should have 0 votes
                    });
                });
            });
        });

        describe('Failure', () => {
            it('Only Owner', async () => {
                await expect(VotingContract.connect(candidate1).createPoll("First Test", [candidate1.address, candidate2.address]))
                    .to.be.revertedWith("Only owner can call this function");
            });

            it("Already Voted", async () => {
                await expect(VotingContract.connect(voter1).vote(0, candidate1.address))
                    .to.be.revertedWith("You have already voted in this poll");
            });

            it("Declare Winner on Active Poll", async () => {
                await expect(VotingContract.connect(deployer).declareWinner(0))
                    .to.be.revertedWith("Poll must be closed to declare winners");
            });

            it("Get Results on Active Poll", async () => {
                await expect(VotingContract.getPollResults(0))
                    .to.be.revertedWith("Poll must be closed to view results");
            });
        });
    });
});
    