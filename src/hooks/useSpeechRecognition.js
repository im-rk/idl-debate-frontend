import { useState, useEffect, useRef } from "react";

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false); // ✅ sync flag to prevent double start

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          const finalText = result[0].transcript;
          console.log("🗣️ Final:", finalText);
          setTranscript((prev) => prev + finalText + " ");
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      if (interimTranscript) {
        console.log("📝 Interim:", interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      console.log("🎤 Recognition ended.");
      setListening(false);
      recognition._isStarted=false;
      isListeningRef.current = false;
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListeningRef.current) {
      console.log("⚠️ Already listening. Skipping start.");
      return;
    }

    try {
      recognition.start();
      isListeningRef.current = true;
      setListening(true);
      console.log("✅ Started listening");
    } catch (error) {
      console.warn("❌ Could not start listening:", error.message);
    }
  };

  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      recognition.stop();
      isListeningRef.current = false;
      setListening(false);
      console.log("🛑 Stopped listening");
    } catch (e) {
      console.error("❌ Failed to stop recognition:", e);
    }
  };

  const resetTranscript = () => {
    setTranscript("");
  };

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
