let cachedVoices = [];

export const loadVoices = () => {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();

    if (voices.length > 0) {
      cachedVoices = voices;
      resolve(voices);
    } else {
      const handleVoicesChanged = () => {
        const newVoices = synth.getVoices();
        cachedVoices = newVoices;
        resolve(newVoices);
        synth.removeEventListener("voiceschanged", handleVoicesChanged);
      };

      synth.addEventListener("voiceschanged", handleVoicesChanged);

      setTimeout(() => {
        const fallbackVoices = synth.getVoices();
        if (fallbackVoices.length > 0) {
          cachedVoices = fallbackVoices;
          resolve(fallbackVoices);
          synth.removeEventListener("voiceschanged", handleVoicesChanged);
        }
      }, 500);
    }
  });
};

export const speakText = async (text, voiceName = null) => {
  const synth = window.speechSynthesis;
  if (!synth) {
    console.warn("Speech synthesis not supported");
    return;
  }

  if (!cachedVoices.length) {
    await loadVoices();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";

  if (voiceName) {
    const voice = cachedVoices.find((v) => v.name === voiceName);
    if (voice) {
      utterance.voice = voice;
    } else {
      console.warn(`Voice "${voiceName}" not found`);
    }
  }

  synth.speak(utterance);
};
