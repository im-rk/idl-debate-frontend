import axios from "axios";
const API_BASE="http://127.0.0.1:8000";

export const submitSpeech=async(speaker,context,motion)=>{
    const res=await axios.post(`${API_BASE}/submit_speech`,null,{
        params : {speaker,context,motion},
    });
    return res.data;
}

export const generateAIResponse = async( motion,speakerRole,draft="")=>{
    const res=await axios.post(`${API_BASE}/generate_ai_response`,null,{
        params :{motion , speaker_role:speakerRole,draft}
    });
    return res.data.speech;
}

export const evaluateDebate = async (motion)=>{
    const res=await axios.post(`${API_BASE}/evaluate_debate/`,null,{
        params:{motion},
    });
    return res.data.judgement;
}