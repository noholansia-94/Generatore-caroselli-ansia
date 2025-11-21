import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CarouselData } from "../types";

const SYSTEM_INSTRUCTION = `
You are "TikTok Anxiety Carousel Generator", an autonomous agent that produces complete 3-slide TikTok sequences for a female audience who struggles with anxiety.

LANGUAGE RULE: 
- All visible text MUST be in **ITALIAN**.
- Image prompts must be in **ENGLISH**.

Your task is to ALWAYS generate exactly 3 slides:

SLIDE 1 — HOOK
Short, emotional, high-impact. Italian feminine grammar.
Tone: intimate, empathetic.

SLIDE 2 — VALUE
Short insight (2–4 lines). Makes the viewer feel understood.
Tone: warm, practical.

SLIDE 3 — CTA (Text Only)
A single emotional sentence in Italian.
NO image prompt for this slide.

RULES
1. ALWAYS exactly 3 slides.
2. Never use the word "carousel".
3. Speak to a female audience.
4. Image prompts for Slide 1 & 2 ONLY:
   • Woman early 30s, soft features, wavy hair
   • Style: "Fluid silhouettes on artistic watercolor backgrounds. Minimalist composition with NEGATIVE SPACE for text."
   • NO references to previous slides.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          slideNumber: { type: Type.INTEGER },
          text: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
        },
        required: ["slideNumber", "text", "imagePrompt"],
      },
    },
    finalSlideSentence: { type: Type.STRING },
  },
  required: ["title", "description", "slides", "finalSlideSentence"],
};

const generateImageForSlide = async (ai: GoogleGenAI, prompt: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "9:16" } },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
};

export const generateCarouselContent = async (theme: string): Promise<CarouselData> => {
  try {
    const apiKey = process.env.REACT_APP_API_KEY || process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });

    const scriptResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Genera sequenza TikTok su: ${theme}. Output JSON.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const carouselData = JSON.parse(scriptResponse.text!) as CarouselData;

    const slidesWithImages = await Promise.all(
      carouselData.slides.map(async (slide) => {
        if (slide.imagePrompt) {
          const imageUrl = await generateImageForSlide(ai, slide.imagePrompt);
          return { ...slide, imageUrl };
        }
        return slide;
      })
    );

    return { ...carouselData, slides: slidesWithImages };
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
};
