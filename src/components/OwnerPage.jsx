import React, { useState } from "react";
import { ethers } from "ethers"; // Import ethers.js
import Loader from "./Loader";

const OwnerPage = ({ votingDappContract, provider, setWinners }) => {
  const [pollTitle, setPollTitle] = useState("");
  const [pollId, setPollId] = useState();
  const [closePollId, setClosePollId] = useState("");
  const [candidates, setCandidates] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const handleWinner = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    await declareWinner(pollId);
  };

  const handlePollClose = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    await closePoll(closePollId);
  };

  const handlePoll = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let candidateArray;
    try {
      candidateArray = JSON.parse(candidates.replace(/'/g, '"'));
    } catch (err) {
      setError(
        'Invalid format. Please enter candidates in the format: [ "0xAddress1", "0xAddress2" ]'
      );
      return;
    }
    if (!pollTitle) {
      setError("Poll title cannot be empty");
      return;
    }
    if (candidateArray.length === 0) {
      setError("Poll must have at least one candidate");
      return;
    }

    await createPoll(pollTitle, candidateArray);
  };

  const createPoll = async (pollTitle, candidateArray) => {
    console.log("CandidateArray", candidateArray);
    setIsLoading(true); 
    try {
      const signer = await provider.getSigner();
      const transaction = await votingDappContract
        .connect(signer)
        .createPoll(pollTitle, candidateArray);
      await transaction.wait();
      console.log("Transaction Result", transaction);
      setSuccess("Poll created successfully!");

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error("Error creating poll:", err);
      setError("Transaction failed: " + err.message);
    } finally {
      setIsLoading(false); 
    }
  };

  const declareWinner = async (pollId) => {
    setIsLoading(true); 
    try {
      const signer = await provider.getSigner();
      const transaction = await votingDappContract
        .connect(signer)
        .declareWinner(pollId);
      await transaction.wait();
      console.log("Transaction Result", transaction);

      votingDappContract.on("WinnerDeclared", (pollId, winners) => {
        console.log(`Winners declared for poll ${pollId}:`, winners);
        setSuccess(`Winners declared: ${winners.join(", ")}`);
        setWinners(winners);
      });

      setSuccess("Winners declared successfully!");
    } catch (err) {
      console.error("Error declaring winner:", err);
      setError("Transaction failed: " + err.message);
    } finally {
      setIsLoading(false); 
    }
  };

  const closePoll = async (closePollId) => {
    setIsLoading(true); 
    console.log("closePoll", closePollId);
    try {
      const signer = await provider.getSigner();
      const transaction = await votingDappContract
        .connect(signer)
        .closePoll(parseInt(closePollId));
      await transaction.wait();
      console.log("Transaction Result", transaction);
      setSuccess("Poll Closed successfully!");
    } catch (err) {
      console.error("Error closing poll:", err);
      setError("Transaction failed: " + err.message);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <>
      <div className="pages">
        <form onSubmit={handlePoll}>
          <h2>Create a Poll</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          {isLoading ? (
            <div className="center-loader">
              <Loader />
            </div>
          ) : null}
          <input
            value={pollTitle}
            onChange={(e) => setPollTitle(e.target.value)}
            placeholder="Enter Poll Title"
          />

          <input
            value={candidates}
            onChange={(e) => setCandidates(e.target.value)}
            placeholder="Candidates List (comma-separated)"
          />

          <button type="submit">Create</button>
        </form>
      </div>
      <div className="pages">
        <form onSubmit={handlePollClose}>
          <h2>Close Poll</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          {isLoading ? (
            <div className="center-loader">
              <Loader />
            </div>
          ) : null}
          <input
            value={closePollId}
            onChange={(e) => setClosePollId(e.target.value)}
            placeholder="Enter Poll Id"
          />
          <button type="submit">Close</button>
        </form>
      </div>

      <div className="pages">
        <form onSubmit={handleWinner}>
          <h2>Declare Winner</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          {isLoading ? (
            <div className="center-loader">
              <Loader />
            </div>
          ) : null}
          <input
            value={pollId}
            onChange={(e) => setPollId(e.target.value)}
            placeholder="Enter Poll Id"
          />

          <button type="submit">Declare</button>
        </form>
      </div>
    </>
  );
};

export default OwnerPage;
