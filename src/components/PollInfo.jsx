import React, { useEffect, useState, useCallback } from "react";

const PollInfo = ({ votingDappContract, totalNoOfPolls }) => {
  const [pollInfo, setPollInfo] = useState([]);

  const blockchainData = useCallback(async () => {
    let pollData = [];
    for (let i = 0; i < totalNoOfPolls; i++) {
      try {
        const pollCreationTime = await votingDappContract.getPollCreationTime(i);
        const date = new Date(Number(pollCreationTime) * 1000);
        const pollStatus = await votingDappContract.getPollStatus(i);
        const candidates = await votingDappContract.getCandidates(i);
        const totalVotes = await votingDappContract.getTotalVotes(i);
        const winner = await votingDappContract.getWinner(i);
        const allpolls = await votingDappContract.getAllPollIdsWithTitles();

        const pollDetails = {
          id: i,
          pollTitle: allpolls[i].title,
          status: pollStatus,
          time: date.toString(),
          winner: winner,
          candidates: candidates,
          totalVotes: totalVotes,
        };

        pollData.push(pollDetails);
      } catch (error) {
        console.error(`Error fetching poll details for poll ID ${i}:`, error);
      }
    }
    setPollInfo(pollData);
  }, [totalNoOfPolls, votingDappContract]);

  useEffect(() => {
    blockchainData();
  }, [blockchainData]);

  return (
    <div className="info">
      {pollInfo.length > 0 ? (
        <ul>
          {pollInfo.map((poll) => (
            <li key={poll.id}>
              <strong>Poll ID:</strong> {poll.id} <br />
              <strong>Title:</strong> {poll.pollTitle} <br />
              <strong>Status:</strong>{" "}
              <span style={{ color: poll.status ? "green" : "red", fontWeight: "bold" }}>
                {poll.status ? "Live" : "Ended"}
              </span>
              <br />
              <strong>Creation Time:</strong> {poll.time} <br />
              <strong>Winner:</strong> {poll.winner || "N/A"} <br />
              <strong>Candidates:</strong>
              {poll.candidates.map((candidate) => (
                <ul key={candidate}>{candidate}</ul>
              ))}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-polls-message">No polls available.</p>
      )}
    </div>
  );
};

export default PollInfo;
