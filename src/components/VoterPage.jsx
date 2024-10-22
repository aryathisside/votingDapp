import React, { useState, useEffect, useCallback } from "react";
import Loader from "./Loader";

const VoterPage = ({ votingDappContract, provider, totalNoOfPolls }) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pollId, setPollId] = useState();
  const [candidate, setCandidate] = useState("");
  const [pollInfo, setPollInfo] = useState([]);
  const [validPolls, setValidPolls] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (e) => {
    e.preventDefault();
    console.log("Voted");
    await vote(pollId, candidate);
  };

  const vote = async (pollId, candidate) => {
    try {
      const signer = await provider.getSigner();
      setIsLoading(true);
      const transaction = await votingDappContract
        .connect(signer)
        .vote(pollId, candidate);
      await transaction.wait();
      setSuccess("Vote cast successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Error casting vote:", err);
      setError("Transaction failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const blockchainData = useCallback(async () => {
    let pollData = [];
    let activePolls = [];
    for (let i = 0; i < totalNoOfPolls; i++) {
      try {
        const pollStatus = await votingDappContract.getPollStatus(i);
        const candidates = await votingDappContract.getCandidates(i);
        const pollDetails = {
          id: i,
          status: pollStatus,
          candidates: candidates,
        };
        pollData.push(pollDetails);
        if (pollStatus) {
          activePolls.push(i);
        }
      } catch (error) {
        console.error(`Error fetching poll details for poll ID ${i}:`, error);
      }
    }
    setPollInfo(pollData);
    setValidPolls(activePolls);
  }, [totalNoOfPolls, votingDappContract]); 

  const fetchCandidatesForPoll = useCallback(async (id) => {
    const poll = pollInfo.find((p) => p.id === Number(id));
    if (poll) {
      setCandidates(poll.candidates);
    } else {
      setCandidates([]);
    }
  }, [pollInfo]); 

  useEffect(() => {
    blockchainData(); 
  }, [blockchainData]); 

  useEffect(() => {
    if (pollId) {
      fetchCandidatesForPoll(pollId); 
    }
  }, [pollId, fetchCandidatesForPoll]); 

  return (
    <div className="pages">
      <form onSubmit={handleVote}>
        <h2>Vote</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        {isLoading ? (
          <div className="center-loader">
            <Loader />
          </div>
        ) : null}

        <select
          value={pollId}
          onChange={(e) => setPollId(e.target.value)}
          placeholder="Select Poll Id"
        >
          <option value="">Select Poll ID</option>
          {validPolls.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>

        <select
          value={candidate}
          onChange={(e) => setCandidate(e.target.value)}
          placeholder="Select Candidate Address"
          disabled={candidates.length === 0}
        >
          <option value="">Select Candidate</option>
          {candidates.map((addr) => (
            <option key={addr} value={addr}>
              {addr}
            </option>
          ))}
        </select>

        <button type="submit">Vote</button>
      </form>
    </div>
  );
};

export default VoterPage;
