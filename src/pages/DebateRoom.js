import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, Settings, Users, Timer, WindIcon, CodeSquare } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import { submitSpeech, evaluateDebate } from "../services/debateservice";
import { speakText, loadVoices } from "../utils/speech";

const DebateRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const { team, topic, mode } = location.state || {};
  const isHumanMode = mode === "Human vs AI";

  const { transcript, listening, startListening, stopListening } = useSpeechRecognition();
  const [hasStarted,setHasStarted]=useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [frequencyData, setFrequencyData] = useState({});
  const [mediaStream, setMediaStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [aiResponses, setAIResponses] = useState({});
  const [speechIndex, setSpeechIndex] = useState(0);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [judgement, setJudgement] = useState(null);
  const [voiceMap, setVoiceMap] = useState({});
  const [micStatus, setMicStatus] = useState({});

  const aiResponsesRef=useRef(aiResponses);
  // New state for alternating team logic
  const [lastSpeakerTeam, setLastSpeakerTeam] = useState(null);
  const [nextSpeakerTeam, setNextSpeakerTeam] = useState(null);


  let remainingGov = 3 - (team === "Government" ? 1 : 0);
  const teamSel = () => (remainingGov-- > 0 ? "Government" : "Opposition");

  const participants = [
    { id: 1, name: user?.username || "Human", role: "Prime Minister", team: team, isAI: false, muted: !micStatus[1], videoOn: true },
    { id: 2, name: "Bob Smith", role: "Deputy PM", team: teamSel(), isAI: true, muted: !micStatus[2], videoOn: true },
    { id: 3, name: "Carol Davis", role: "Gov Whip", team: teamSel(), isAI: true, muted: !micStatus[3], videoOn: true },
    { id: 4, name: "David Wilson", role: "Opposition Leader", team: teamSel(), isAI: true, muted: !micStatus[4], videoOn: true },
    { id: 5, name: "Eva Brown", role: "Deputy Opposition", team: teamSel(), isAI: true, muted: !micStatus[5], videoOn: true },
    { id: 6, name: "Frank Miller", role: "Opposition Whip", team: teamSel(), isAI: true, muted: !micStatus[6], videoOn: true },
  ];

  const governmentTeam = participants.filter((p) => p.team === "Government");
  const oppositionTeam = participants.filter((p) => p.team === "Opposition");

  // Function to get next speaker from opposite team
  const getNextSpeakerFromOppositeTeam = (currentTeam) => {
    const oppositeTeam = currentTeam === "Government" ? "Opposition" : "Government";
    const teamParticipants = participants.filter(p => p.team === oppositeTeam);
    
    // Find AI participants from opposite team who haven't spoken yet
    const availableAI = teamParticipants.filter(p => p.isAI && !aiResponsesRef.current[p.id]);
    
    if (availableAI.length > 0) {
      return availableAI[0]; // Return first available AI from opposite team
    }
    // If no AI available from opposite team, return null
    return null;
  };
  // Initialize micStatus after participants is defined
  useEffect(() => {
    setMicStatus(Object.fromEntries(participants.map((p) => [p.id, false])));
  }, []);

  // Load voices for AI participants
  useEffect(() => {
    loadVoices()
      .then((voices) => {
        const aiVoiceMap = {
          "Bob Smith": voices.find((v) => v.name.includes("Google UK English Male"))?.name || voices[0]?.name,
          "Carol Davis": voices.find((v) => v.name.includes("Google UK English Female"))?.name || voices[1]?.name,
          "David Wilson": voices.find((v) => v.name.includes("Google US English"))?.name || voices[2]?.name,
          "Eva Brown": voices.find((v) => v.name.includes("Microsoft"))?.name || voices[3]?.name,
          "Frank Miller": voices.find((v) => v.name.includes("Google"))?.name || voices[4]?.name,
        };
        setVoiceMap(aiVoiceMap);
        console.log("Voice Map:", aiVoiceMap);
      })
      .catch((err) => {
        console.error("Failed to load voices:", err.message);
        alert("Speech synthesis voices failed to load. AI voices may not work.");
      });
  }, []);

  useEffect(()=>{
      aiResponsesRef.current=aiResponses;
    },[aiResponses]);

  // Handle human speech recognition
  useEffect(() => {
    if (currentSpeaker === 1 && micStatus[1] && !listening) {
      startListening();
    } else if (listening && (currentSpeaker !== 1 || !micStatus[1])) {
      stopListening();
    }
  }, [currentSpeaker, micStatus, listening, startListening, stopListening]);

  // Log transcript changes
  useEffect(() => {
    if (transcript) {
      console.log("Transcript Output:", transcript);
    }
  }, [transcript]);

  // Handle human mic toggle
  const toggleMic = async () => {
    try {
      if (!micStatus[1]) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;
        source.connect(analyserNode);

        setMediaStream(stream);
        setAudioContext(audioCtx);
        setAnalyser(analyserNode);
        setMicStatus((prev) => ({ ...prev, 1: true }));
        setCurrentSpeaker(1);
      } else {
        stopListening();
        setTimeout(() => {
          mediaStream?.getTracks().forEach((track) => track.stop());
          audioContext?.close();
          setMediaStream(null);
          setAudioContext(null);
          setAnalyser(null);
          setMicStatus((prev) => ({ ...prev, 1: false }));
          setCurrentSpeaker(null);
        }, 300);

        if (transcript.trim()) {
          try {
            //await submitSpeech(user?.username || "Human", transcript, topic);
            console.log("Speech submitted");
            alert("Human speech submitted successfully!");
            if (isActive) {
              // Update last speaker team and trigger next speaker from opposite team
              const humanParticipant = participants.find(p => p.id === 1);
              setLastSpeakerTeam(humanParticipant.team);
              setNextSpeakerTeam(humanParticipant.team === "Government" ? "Opposition" : "Government");
              
              // Trigger next AI speaker from opposite team
              const nextSpeaker = getNextSpeakerFromOppositeTeam(humanParticipant.team);
              if (nextSpeaker) {
                setTimeout(() => {
                  handleSpecificAISpeaking(nextSpeaker);
                }, 1000); // Small delay for better UX
              }
            }
          } catch (err) {
            console.error("Speech submission failed:", err.message);
            alert("Failed to submit speech. Please try again.");
          }
        }
      }
    } catch (err) {
      console.error("Microphone toggle error:", err.name, err.message);
      alert("Microphone access failed. Check browser permissions.");
    }
  };

  // Update frequency data for human participant
  useEffect(() => {
    if (currentSpeaker === 1 && micStatus[1] && analyser) {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const visualBars = Array.from(dataArray.slice(0, 8));
        setFrequencyData((prev) => ({ ...prev, 1: visualBars }));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [currentSpeaker, micStatus, analyser]);

  // Simulate AI mic activity
  const simulateAIMicActivity = (participantId, duration) => {
    setMicStatus((prev) => {
      console.log("Mic status update:", { ...prev, [participantId]: true });
      return { ...prev, [participantId]: true };
    });

    const simulateFrequency = () => {
      const fakeData = Array.from({ length: 8 }, () => Math.random() * 100);
      setFrequencyData((prev) => ({ ...prev, [participantId]: fakeData }));
    };

    simulateFrequency();
    const interval = setInterval(simulateFrequency, 100);

    setTimeout(() => {
      clearInterval(interval);
      setMicStatus((prev) => ({ ...prev, [participantId]: false }));
      setFrequencyData((prev) => {
        const newData = { ...prev };
        delete newData[participantId];
        return newData;
      });
    }, duration);
  };

  // Handle specific AI speaking (new function for alternating team logic)
  const handleSpecificAISpeaking = async (participant) => {
    if (!participant || !participant.isAI) return;

    try {
      // Use sample text instead of backend call
      const aiSpeech =
        participant.name === "Bob Smith"
          ? "I support AI regulation to ensure ethical development."
          : participant.name === "Carol Davis"
          ? "Regulation could hinder AI innovation and progress."
          : participant.name === "David Wilson"
          ? "A balanced approach to AI regulation is necessary."
          : participant.name === "Eva Brown"
          ? "AI safety must be prioritized to protect society."
          : "We should foster AI growth with minimal restrictions.";

      console.log(`${participant.name} (AI) spoke:`, aiSpeech);

      const voiceName = voiceMap[participant.name];
      console.log(`Speaking with voice: ${voiceName}`);
      const estimatedDuration = (aiSpeech.length / 5 / 150) * 60 * 1000; // chars to words to ms
      const minDuration = 5000;
      const speechDuration = Math.max(estimatedDuration, minDuration);

      setCurrentSpeaker(participant.id);
      simulateAIMicActivity(participant.id, speechDuration);
      const utterance = await speakText(aiSpeech, voiceName);
      
      if (utterance) {
        utterance.onend = () => {
          setCurrentSpeaker(null);
          setMicStatus((prev) => ({ ...prev, [participant.id]: false }));
          setFrequencyData((prev) => {
            const newData = { ...prev };
            delete newData[participant.id];
            return newData;
          });
          
          setAIResponses((prev) => {
              const updated = { ...prev, [participant.id]: aiSpeech };
              aiResponsesRef.current = updated; 
              return updated;
          });
          console.log(aiResponses);
          // Update last speaker team and find next speaker from opposite team
          setLastSpeakerTeam(participant.team);
          const oppositeTeam = participant.team === "Government" ? "Opposition" : "Government";
          setNextSpeakerTeam(oppositeTeam);
          
          // Find next AI speaker from opposite team
          const nextSpeaker = getNextSpeakerFromOppositeTeam(participant.team);
          if (nextSpeaker) {
            setTimeout(() => {
              handleSpecificAISpeaking(nextSpeaker);
            }, 2000); // 2 second delay between speakers
          }
        };
      } else {
        // Fallback if speech fails
        setTimeout(() => {
          setCurrentSpeaker(null);
          setLastSpeakerTeam(participant.team);
          const oppositeTeam = participant.team === "Government" ? "Opposition" : "Government";
          setNextSpeakerTeam(oppositeTeam);
          
          const nextSpeaker = getNextSpeakerFromOppositeTeam(participant.team);
          if (nextSpeaker) {
            setTimeout(() => {
              handleSpecificAISpeaking(nextSpeaker);
            }, 2000);
          }
        }, speechDuration);
      }
    } catch (err) {
      console.error("Error in AI speech:", err);
      alert("Failed to process AI speech.");
    }
  };

  // Handle AI speaking with voice and mic simulation (kept for backward compatibility)
  const handleAISpeaking = async () => {
    if (speechIndex >= participants.length) return;

    const participant = participants[speechIndex];
    if (participant.isAI) {
      await handleSpecificAISpeaking(participant);
    }
  };

  const handleLeaveDebate=()=>{
    stopListening();
    window.speechSynthesis.cancel();
    setIsActive(false);
    setCurrentSpeaker(null);
    setMicStatus((prev)=>({...prev,1:false}));
    setFrequencyData({});
    navigate("/home");
  }
  const handleControlToggle=()=>{
    if(!hasStarted)
    {
      setMicStatus((prev)=>({...prev,1:false}));
      setFrequencyData({});
      setIsActive(true);
      setHasStarted(true);
    }
    else if(isActive)
    {
      stopListening();
      window.speechSynthesis.cancel();
      setIsActive(false);
      console.log("Debate paused");
    }
    else
    {
      setIsActive(true);
      console.log("Debate resumed");
      if (currentSpeaker==1 && micStatus[1])
      {
        startListening();
      }

      const nextSpeaker=getNextSpeakerFromOppositeTeam(lastSpeakerTeam);
      if (nextSpeaker)
      {
        setTimeout(() => {
          handleSpecificAISpeaking(nextSpeaker);
        }, 1000);
      }
    }
  }
  // Trigger AI speaking when active (modified to work with new logic)
  useEffect(() => {
    if (isActive && speechIndex > 0) handleAISpeaking();
  }, [speechIndex, isActive]);

  // Prompt PM to speak first
  useEffect(() => {
    if (isActive && speechIndex === 0) {
      setCurrentSpeaker(1);
      const humanParticipant = participants.find(p => p.id === 1);
      setLastSpeakerTeam(null); // No previous speaker
      setNextSpeakerTeam(humanParticipant.team === "Government" ? "Opposition" : "Government");
      alert("Debate started! Prime Minister, please toggle your mic to speak.");
    }
  }, [isActive]);

  // Timer for debate
  useEffect(() => {
    if (!isActive || timeRemaining === 0) return;
    const interval = setInterval(() => setTimeRemaining((t) => t - 1), 1000);
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

  const ParticipantCard = ({ participant, isCurrentSpeaker }) => (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${isCurrentSpeaker ? "ring-4 ring-green-400 shadow-lg" : "ring-1 ring-gray-600"}`}>
      <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
        {participant.videoOn ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full text-2xl font-bold text-gray-800 flex items-center justify-center">
              {participant.name.split(" ").map((n) => n[0]).join("")}
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
              <button
                className={`p-1 rounded ${micStatus[participant.id] ? "bg-green-500" : "bg-red-500"} text-white`}
                onClick={toggleMic}
              >
                {micStatus[participant.id] ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
            ) : (
              <button
                className={`p-1 rounded ${micStatus[participant.id] ? "bg-green-500" : "bg-gray-600"} text-white`}
                disabled
              >
                {micStatus[participant.id] ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
            )}
            <button
              className={`p-1 rounded ${!participant.videoOn ? "bg-red-500 text-white" : "bg-gray-600 text-gray-300"}`}
              disabled
            >
              {participant.videoOn ? <Video size={16} /> : <VideoOff size={16} />}
            </button>
          </div>
          <button
            className={`px-3 py-1 rounded text-xs font-medium ${isCurrentSpeaker ? "bg-red-500" : "bg-green-500 hover:bg-green-600"} text-white`}
            onClick={() => setCurrentSpeaker(isCurrentSpeaker ? null : participant.id)}
          >
            {isCurrentSpeaker ? "Stop" : "Speak"}
          </button>
        </div>

        {participant.id === 1 && transcript && (
          <p className="text-green-300 text-xs mt-2">Transcript: {transcript}</p>
        )}
        {participant.isAI && aiResponses[participant.id] && (
          <p className="text-blue-300 text-xs mt-2">AI Speech: {aiResponses[participant.id]}</p>
        )}
      </div>
    </div>
  );

  const handleEvaluate = async () => {
    try {
      const result = await evaluateDebate(topic);
      setJudgement(result);
      setIsEvaluated(true);
      alert("Debate evaluation completed!");
    } catch (err) {
      console.error("Evaluation failed:", err.message);
      alert("Failed to evaluate debate.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Parliamentary Debate</h1>
            <p className="text-gray-400">Motion: {topic}</p>
            {/* New indicator for next speaker team */}
            {nextSpeakerTeam && (
              <p className="text-yellow-400 text-sm mt-1">
                Next speaker should be from: {nextSpeakerTeam} team
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded">
              <Timer size={20} />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              <button
                onClick={handleControlToggle}
                className={`px-3 py-1 rounded text-sm ${isActive ? "bg-red-500" : "bg-green-500"} text-white`}
              >
                {!hasStarted ? "Start" : isActive ? "Pause":"Resume"}
              </button>
            </div>
            <button onClick={handleEvaluate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Evaluate
            </button>
            <button className="p-2 bg-gray-700 rounded hover:bg-gray-600">
              <Users size={20} />
            </button>
            <button className="p-2 bg-gray-700 rounded hover:bg-gray-600">
              <Settings size={20} />
            </button>
            <button
              onClick={handleLeaveDebate}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Leave Debate
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-center mb-6">
            <div className="bg-green-500 px-6 py-2 rounded-full text-xl font-bold">Government</div>
          </div>
          <div className="space-y-4">
            {governmentTeam.map((p) => (
              <ParticipantCard key={p.id} participant={p} isCurrentSpeaker={currentSpeaker === p.id} />
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-center mb-6">
            <div className="bg-red-500 px-6 py-2 rounded-full text-xl font-bold">Opposition</div>
          </div>
          <div className="space-y-4">
            {oppositionTeam.map((p) => (
              <ParticipantCard key={p.id} participant={p} isCurrentSpeaker={currentSpeaker === p.id} />
            ))}
          </div>
        </div>
      </div>

      {isEvaluated && (
        <div className="max-w-4xl mx-auto bg-gray-800 p-6 mt-4 rounded-lg border border-gray-600">
          <h2 className="text-xl font-bold mb-2">Judgement:</h2>
          <pre className="text-sm text-gray-200 whitespace-pre-wrap">{judgement}</pre>
        </div>
      )}
    </div>
  );
};

export default DebateRoom;