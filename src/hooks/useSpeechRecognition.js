import { useState, useEffect, useRef } from "react";

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

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
      if (event.error === "not-allowed" || event.error === "network") {
        setListening(false);
      }
    };

    recognition.onend = () => {
      console.log("🎤 Recognition ended.");
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    if (listening) return;

    try {
      recognitionRef.current.start();
      setListening(true);
      console.log("✅ Started listening");
    } catch (error) {
      console.warn("Already listening or start failed", error.message);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setListening(false);
      console.log("🛑 Stopped listening");
    } catch (e) {
      console.error("Failed to stop", e);
    }
  };

  const resetTranscript = () => {
    setTranscript("");
  };

  return { transcript, listening, startListening, stopListening, resetTranscript };
};

export default useSpeechRecognition;
