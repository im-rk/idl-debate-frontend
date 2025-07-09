let cachedVoices = [];

export const loadVoices = () => {
  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    const voices = synth.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      console.log("Available voices:", voices.map((v) => v.name)); // Debug log
      resolve(voices);
      return;
    }

    const handleVoicesChanged = () => {
      const newVoices = synth.getVoices();
      cachedVoices = newVoices;
      console.log("Available voices:", newVoices.map((v) => v.name)); // Debug log
      resolve(newVoices);
      synth.removeEventListener("voiceschanged", handleVoicesChanged);
    };

    synth.addEventListener("voiceschanged", handleVoicesChanged);

    setTimeout(() => {
      const fallbackVoices = synth.getVoices();
      if (fallbackVoices.length > 0) {
        cachedVoices = fallbackVoices;
        console.log("Available voices (fallback):", fallbackVoices.map((v) => v.name)); // Debug log
        resolve(fallbackVoices);
      } else {
        reject(new Error("No voices available after timeout"));
      }
      synth.removeEventListener("voiceschanged", handleVoicesChanged);
    }, 1000); // Increased to 1000ms for slower devices
  });
};

export const speakText = async (text, voiceName = null) => {
  const synth = window.speechSynthesis;
  if (!synth) {
    console.warn("Speech synthesis not supported");
    return null;
  }

  // Cancel any ongoing speech
  synth.cancel();

  if (!cachedVoices.length) {
    try {
      await loadVoices();
    } catch (err) {
      console.error("Failed to load voices:", err.message);
      return null;
    }
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";

  if (voiceName) {
    const voice = cachedVoices.find((v) => v.name === voiceName);
    if (voice) {
      utterance.voice = voice;
    } else {
      console.warn(`Voice "${voiceName}" not found, using default`);
    }
  }

  synth.speak(utterance);
  return utterance; // Return utterance for onend event handling
};