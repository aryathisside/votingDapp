import React from 'react'
import './Winner.css';

const Winner = ({winner}) => {
  return (
    <div className='Winner'>
        <h1>Winner: {winner}</h1>
    </div>
  )
}

export default Winner