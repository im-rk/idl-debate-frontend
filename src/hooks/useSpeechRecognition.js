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
    };

    recognition.onend = () => {
      console.log("🎤 Speech recognition ended.");
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      try {
        recognitionRef.current.start();
        setListening(true);
        console.log("✅ Started listening");
      } catch (e) {
        console.error("SpeechRecognition already started.");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop(); // Do NOT nullify it here
      console.log("🛑 Stopped listening");
    }
  };

  return { transcript, listening, startListening, stopListening };
};

export default useSpeechRecognition;
