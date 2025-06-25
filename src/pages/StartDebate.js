import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const StartDebate = () => {
  const [topic,setTopic]=useState("");
  const [format,setFormat]=useState("Asian Parliamentary");
  const [mode, setMode]=useState("AI vs AI");
  const [team,setTeam]=useState("Government");
  const navigate=useNavigate();
  const handlemodechange=(e)=>{
    const selectmode=e.target.value;
    setMode(selectmode);
    if(selectmode==='AI VS AI')
    {
      setTeam(""); 
    }
    else
    {
      setTeam("Government")
    }
  }
  const handleStart=()=>{
    if(!topic.trim())
    {
      alert('Topic should not be empty');
      return ;
    }
    console.log({topic,format,mode,team});
    navigate("/debate-room",{state:{topic,format,mode,team}})
  }
  return (
    <div className="max-w-md mx-auto p-4 mt-10 shadow-lg border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Start a Debate</h2>
      <input
        type="text"
        placeholder="Enter Debate Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        required
      />
      <select
        className="w-full p-2 border rounded mb-4"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
      >
        <option>Asian Parliamentary</option>
        <option>British Parliamentary</option>
      </select>
      <select
        className="w-full p-2 border rounded mb-4"
        value={mode}
        onChange={handlemodechange}
      >
        <option>AI vs AI</option>
        <option>Human vs AI</option>
      </select>
      {mode === "Human vs AI" && (
        <select
          className="w-full p-2 border rounded mb-4"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        >
          <option value="Government">Join Government</option>
          <option value="Opposition">Join Opposition</option>
        </select>
      )}
      <button
        onClick={handleStart}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Start Debate
      </button>
    </div>
  )
}

export default StartDebate
