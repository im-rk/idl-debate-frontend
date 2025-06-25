// ✅ Corrected: Ensures microphone toggling is instant.
// ✅ Integrated: Real-time transcript display in UI.
// ✅ Optimized: `useSpeechRecognition` hook usage and timing.

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, Settings, Users, Timer } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

const DebateRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const { team, topic, mode } = location.state || {};
  const isHumanMode = mode === "Human vs AI";

  const { transcript, listening, startListening, stopListening } = useSpeechRecognition();

  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [frequencyData, setFrequencyData] = useState({});
  const [isMicOn, setIsMicOn] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);

  useEffect(() => {
    if (currentSpeaker === 1 && isMicOn) startListening();
    else stopListening();
  }, [currentSpeaker, isMicOn]);

  useEffect(() => {
    if (transcript) {
      console.log("Live Transcript:", transcript);
    }
  }, [transcript]);

  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;
        source.connect(analyserNode);

        setMediaStream(stream);
        setAudioContext(audioCtx);
        setAnalyser(analyserNode);
        setIsMicOn(true);
        setCurrentSpeaker(1);
      } catch (err) {
        console.error("Microphone access denied", err);
      }
    } else {
      stopListening();
      mediaStream?.getTracks().forEach((track) => track.stop());
      audioContext?.close();
      setMediaStream(null);
      setAudioContext(null);
      setAnalyser(null);
      setIsMicOn(false);
      setCurrentSpeaker(null);
    }
  };

  useEffect(() => {
    if (currentSpeaker === 1 && isMicOn && analyser) {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const visualBars = Array.from(dataArray.slice(0, 8));
        setFrequencyData((prev) => ({ ...prev, 1: visualBars }));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [currentSpeaker, isMicOn, analyser]);

  let remainingGov = 3 - (team === "Government" ? 1 : 0);
  const teamSel = () => (remainingGov-- > 0 ? "Government" : "Opposition");

  const participants = [
    { id: 1, name: user?.username || "Human", role: "Prime Minister", team: team, isAI: !isHumanMode, muted: true, videoOn: true },
    { id: 2, name: "Bob Smith", role: "Deputy PM", team: teamSel(), isAI: true, muted: true, videoOn: true },
    { id: 3, name: "Carol Davis", role: "Gov Whip", team: teamSel(), isAI: true, muted: true, videoOn: true },
    { id: 4, name: "David Wilson", role: "Opposition Leader", team: teamSel(), isAI: true, muted: true, videoOn: true },
    { id: 5, name: "Eva Brown", role: "Deputy Opposition", team: teamSel(), isAI: true, muted: true, videoOn: true },
    { id: 6, name: "Frank Miller", role: "Opposition Whip", team: teamSel(), isAI: true, muted: false, videoOn: true },
  ];

  const governmentTeam = participants.filter(p => p.team === "Government");
  const oppositionTeam = participants.filter(p => p.team === "Opposition");

  useEffect(() => {
    if (!isActive || timeRemaining === 0) return;
    const interval = setInterval(() => setTimeRemaining(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  const FrequencyVisualizer = ({ participantId, isActive }) => {
    const data = frequencyData[participantId] || Array(8).fill(0);
    return (
      <div className="flex items-end justify-center h-8 space-x-1">
        {data.map((height, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-100 ${isActive ? "bg-green-400" : "bg-gray-300"}`}
            style={{ height: isActive ? `${Math.max(height * 0.3, 4)}px` : "4px" }}
          />
        ))}
      </div>
    );
  };

  const ParticipantCard = ({ participant, isCurrentSpeaker, isMicOn, toggleMic }) => (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${isCurrentSpeaker ? 'ring-4 ring-green-400 shadow-lg' : 'ring-1 ring-gray-600'}`}>
      <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
        {participant.videoOn ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full text-2xl font-bold text-gray-800 flex items-center justify-center">
              {participant.name.split(" ").map(n => n[0]).join("")}
            </div>
          </div>
        ) : (
          <VideoOff size={32} className="text-gray-400" />
        )}
        {isCurrentSpeaker && <div className="absolute inset-0 bg-green-400 bg-opacity-20 animate-pulse" />}
      </div>

      <div className="p-3 bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-white font-medium text-sm">{participant.name}</h3>
            <p className="text-gray-400 text-xs">{participant.role}</p>
          </div>
          <div className="flex items-center space-x-1">
            {participant.isAI && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">AI</span>}
            <span className={`text-xs px-2 py-1 rounded text-white ${participant.team === "Government" ? "bg-green-500" : "bg-red-500"}`}>
              {participant.team}
            </span>
          </div>
        </div>

        <FrequencyVisualizer participantId={participant.id} isActive={isCurrentSpeaker} />

        <div className="flex items-center justify-between mt-2">
          <div className="flex space-x-2">
            {participant.id === 1 ? (
              <button className={`p-1 rounded ${isMicOn ? "bg-green-500" : "bg-red-500"} text-white`} onClick={toggleMic}>
                {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
            ) : (
              <button className="p-1 rounded bg-gray-600 text-gray-300" disabled>
                {participant.muted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
            <button className={`p-1 rounded ${!participant.videoOn ? "bg-red-500 text-white" : "bg-gray-600 text-gray-300"}`}>
              {participant.videoOn ? <Video size={16} /> : <VideoOff size={16} />}
            </button>
          </div>
          <button
            className={`px-3 py-1 rounded text-xs font-medium ${isCurrentSpeaker ? "bg-red-500" : "bg-green-500 hover:bg-green-600"} text-white`}
            onClick={() => setCurrentSpeaker(isCurrentSpeaker ? null : participant.id)}>
            {isCurrentSpeaker ? "Stop" : "Speak"}
          </button>
        </div>

        {participant.id === 1 && transcript && (
          <p className="text-green-300 text-xs mt-2">Transcript: {transcript}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Parliamentary Debate</h1>
            <p className="text-gray-400">Motion: {topic}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded">
              <Timer size={20} />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              <button onClick={() => setIsActive(!isActive)} className={`px-3 py-1 rounded text-sm ${isActive ? "bg-red-500" : "bg-green-500"} text-white`}>
                {isActive ? "Pause" : "Start"}
              </button>
            </div>
            <button className="p-2 bg-gray-700 rounded hover:bg-gray-600"><Users size={20} /></button>
            <button className="p-2 bg-gray-700 rounded hover:bg-gray-600"><Settings size={20} /></button>
            <button onClick={() => navigate("/home")} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Leave Debate</button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-center mb-6"><div className="bg-green-500 px-6 py-2 rounded-full text-xl font-bold">Government</div></div>
          <div className="space-y-4">
            {governmentTeam.map(p => (
              <ParticipantCard key={p.id} participant={p} isCurrentSpeaker={currentSpeaker === p.id} isMicOn={isMicOn} toggleMic={toggleMic} />
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-center mb-6"><div className="bg-red-500 px-6 py-2 rounded-full text-xl font-bold">Opposition</div></div>
          <div className="space-y-4">
            {oppositionTeam.map(p => (
              <ParticipantCard key={p.id} participant={p} isCurrentSpeaker={currentSpeaker === p.id} isMicOn={isMicOn} toggleMic={toggleMic} />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Current Speaker: {currentSpeaker ? participants.find(p => p.id === currentSpeaker)?.name : "None"}
            </div>
            {currentSpeaker && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Speaking</span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-400">
            {participants.filter(p => !p.muted).length} of {participants.length} unmuted
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebateRoom;
