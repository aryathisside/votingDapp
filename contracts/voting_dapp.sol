// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract votingDapp {
    address public immutable i_owner;

    // Structure to define a candidate
    struct Candidate {
        address candidateAddress; // Address of the candidate
        uint256 voteCount; // Number of votes the candidate received
    }

    // Structure to define each poll
    struct Poll {
        string title;
        Candidate[] candidates; // Array of candidates for the poll
        bool isActive; // Status of the poll (true: active, false: closed)
        uint256 totalVotes; // Total number of votes cast in the poll
        uint256 creationTime; // Timestamp when the poll was created
    }

    Poll[] public polls; // Array to store all the polls

    // Mapping to track voters who have voted in a specific poll
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => address[]) winnerTrack;
    mapping(uint256 => bool) winnerDeclared;

    
    // Event for poll creation
    event PollCreated(
        uint256 indexed pollId,
        string title,
        address[] candidates
    );

    // Event for vote casted
    event VoteCasted(
        uint256 indexed pollId,
        address indexed voter,
        address indexed candidate
    );

    // Event for poll closure
    event PollClosed(uint256 indexed pollId);

    // Event for winner declaration
    event WinnerDeclared(
        uint256 indexed pollId,
        address[] winners
    );

    // Modifier to allow only the owner to perform certain actions
    modifier onlyOwner() {
        require(msg.sender == i_owner, "Only owner can call this function");
        _;
    }

    constructor() {
        i_owner = msg.sender;
    }

    // Function to create a new poll
    function createPoll(string memory _title, address[] memory _candidates) public onlyOwner {
        require(_candidates.length > 0, "Poll must have at least one candidate");

        // Push a new poll to the end of the polls array
        polls.push();

        // Get the index of the newly added poll
        uint256 pollId = polls.length - 1;

        // Set the properties of the new poll
        polls[pollId].title = _title;
        polls[pollId].isActive = true;
        polls[pollId].totalVotes = 0;
        polls[pollId].creationTime = block.timestamp;

        // Add candidates to the poll
        for (uint256 i = 0; i < _candidates.length; i++) {
            polls[pollId].candidates.push(
                Candidate({
                    candidateAddress: _candidates[i],
                    voteCount: 0
                })
            );
        }

        winnerDeclared[pollId] = false;

        // Emit the event
        emit PollCreated(pollId, _title, _candidates);
    }

    // Function to cast a vote for a candidate in a specific poll
    function vote(uint256 pollId, address _candidate) public {
        Poll storage poll = polls[pollId]; // Access the specific poll

        require(poll.isActive, "Poll is not active");
        require(!hasVoted[pollId][msg.sender], "You have already voted in this poll");

        bool isValidCandidate = false;
        uint256 totalVotesBefore = poll.totalVotes;

        for (uint256 i = 0; i < poll.candidates.length; i++) {
            if (poll.candidates[i].candidateAddress == _candidate) {
                poll.candidates[i].voteCount++; // Increment vote count for the candidate
                isValidCandidate = true;
                break;
            }
        }

        require(isValidCandidate, "Candidate is not registered in this poll");

        hasVoted[pollId][msg.sender] = true;
        poll.totalVotes++;

        require(poll.totalVotes == totalVotesBefore + 1, "Total votes did not increment correctly");

        emit VoteCasted(pollId, msg.sender, _candidate);
    }

    // Function to close a poll after voting has finished
    function closePoll(uint256 pollId) public onlyOwner {
        Poll storage poll = polls[pollId];
        require(poll.isActive, "Poll is already closed");
        
        poll.isActive = false;
        emit PollClosed(pollId);
    }

    // Function to declare the winner(s) of a poll
    function declareWinner(uint256 pollId) public onlyOwner returns (address[] memory) {
        require(!polls[pollId].isActive, "Poll must be closed to declare winners");
        require(!winnerDeclared[pollId], "Winner already declared");
        Poll memory poll = polls[pollId];
        uint256 maxVotes = 0;
        address[] memory winners = new address[](poll.candidates.length);

        // Find the maximum number of votes
        for (uint256 i = 0; i < poll.candidates.length; i++) {
            if (poll.candidates[i].voteCount > maxVotes) {
                maxVotes = poll.candidates[i].voteCount;
            }
        }

        // Find all candidates with the maximum number of votes
        uint256 winnerCount = 0;
        for (uint256 i = 0; i < poll.candidates.length; i++) {
            if (poll.candidates[i].voteCount == maxVotes && maxVotes > 0) {
                winners[winnerCount] = poll.candidates[i].candidateAddress;
                winnerCount++;
            }
        }

        // Trim the array to only include actual winners
        address[] memory result = new address[](winnerCount);
        for (uint256 i = 0; i < winnerCount; i++) {
            result[i] = winners[i];
        }

        winnerTrack[pollId] = result;
        winnerDeclared[pollId] = true;

        emit WinnerDeclared(pollId, result);
        return result;
    }

    // Function to get the status of a specific poll
    function getPollStatus(uint256 pollId) public view returns (bool) {
        return polls[pollId].isActive;
    }

    // Function to get the total number of votes cast in a poll
    function getTotalVotes(uint256 pollId) public view returns (uint256) {
        return polls[pollId].totalVotes;
    }

    // Function to get the list of all candidates in a specific poll
    function getCandidates(uint256 pollId) public view returns (address[] memory) {
        uint256 candidateCount = polls[pollId].candidates.length;
        address[] memory candidateAddresses = new address[](candidateCount);

        for (uint256 i = 0; i < candidateCount; i++) {
            candidateAddresses[i] = polls[pollId].candidates[i].candidateAddress;
        }

        return candidateAddresses;
    }

    // Function to get the total number of polls
    function getTotalPolls() public view returns (uint256) {
        return polls.length;
    }

    // Function to get the creation time of a poll
    function getPollCreationTime(uint256 pollId) public view returns (uint256) {
        return polls[pollId].creationTime;
    }

    // Function to retrieve the results of a specific poll
    function getPollResults(uint256 pollId) 
        public 
        view 
        returns (address[] memory, uint256[] memory) 
    {
        require(!polls[pollId].isActive, "Poll must be closed to view results");
        
        Poll memory poll = polls[pollId];
        uint256[] memory results = new uint256[](poll.candidates.length);
        address[] memory candidateAddresses = new address[](poll.candidates.length);

        for (uint256 i = 0; i < poll.candidates.length; i++) {
            results[i] = poll.candidates[i].voteCount;
            candidateAddresses[i] = poll.candidates[i].candidateAddress;
        }

        return (candidateAddresses, results);
    }

    // New struct to return poll ID along with title
    struct PollInfo {
        uint256 pollId;
        string title;
    }

    // Function to get all poll IDs with their titles
    function getAllPollIdsWithTitles() public view returns (PollInfo[] memory) {
        PollInfo[] memory pollInfos = new PollInfo[](polls.length);

        for (uint256 i = 0; i < polls.length; i++) {
            pollInfos[i] = PollInfo(i, polls[i].title);
        }
        return pollInfos;
    }

    function getWinner(uint256 pollId) public view returns (address[] memory){
        return winnerTrack[pollId];
    }


}
