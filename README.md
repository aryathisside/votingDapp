# Voting DApp

This is a decentralized voting application (DApp) built on the Ethereum blockchain using smart contracts. The application allows users to participate in various polls by casting votes for candidates in a secure, transparent, and decentralized manner.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Smart Contract Overview](#smart-contract-overview)
- [Features](#features)


## Introduction

The Voting DApp is a decentralized application where users can participate in polls hosted on the Ethereum blockchain. It ensures that votes are cast securely and are immutable once they are submitted, which promotes transparency and eliminates the risk of tampering.

## Features
- **Create Polls:** The contract owner can create new polls with a list of candidates.
- **Vote:** Users can vote for their preferred candidate in a poll.
- **Declare Winners:** Once a poll is closed, the contract owner can declare the winner(s).
- **Security Features:** Each voter can vote only once per poll, and only the owner can create polls or declare winners.
- **Track Poll Results:** View the status, total votes, candidates, and results for each poll.


## Tech Stack

- **Frontend**: React.js, Ether.js
- **Smart Contracts**: Solidity
- **Blockchain**: Ethereum
- **Development Environment**: Hardhat
- **Wallet Integration**: MetaMask

## Installation

To run the Voting DApp locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone git@github.com:aryathisside/votingDapp.git
   cd voting-dapp
   npm install
   npm start
2. **Live Link**:
    [Voting Dapp](https://voting-dapp-ruddy.vercel.app/)


3. **Compile the smart contracts: Make sure you're in the voting directory and run:**
    `npx hardhat compile`

4. **Deploy the smart contracts to a local Ethereum network:**
    ```bash
    npx hardhat node
    npx hardhat run scripts/deploy.js --network localhost

## Usage
- **Connect Wallet:** Open the DApp and connect your MetaMask wallet.
- **Select a Poll:** Choose an active poll from the dropdown list.
- **Vote for a Candidate:** Select your candidate and cast your vote.
- **Transaction:** Confirm the transaction in MetaMask to submit your vote.
- **Result:** Once the poll ends, view the results on the same page.

## Smart Contract Overview
**The Voting DApp allows:**

- Poll creation by the owner of the contract
- Users to vote for a candidate in an active poll
- The ability to track poll results, view candidates, and declare the winner(s) once voting is complete
- The contract is implemented using Solidity and includes various functionalities like handling polls, voting, and winner declarations.


