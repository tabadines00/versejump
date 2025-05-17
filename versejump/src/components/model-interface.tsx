import {GoogleGenAI} from '@google/genai';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

async function aiChat(userChat: string) {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        contents: userChat,
    });
    return response.text
  }
  
  export default aiChat