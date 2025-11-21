export interface Slide {
  slideNumber: number;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface CarouselData {
  title: string;
  description: string;
  slides: Slide[];
  finalSlideSentence: string;
  finalSlideImageUrl?: string;
}

export interface MockupImage {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export const THEMES = [
  "Attacchi di Panico", "Overthinking (Pensiero Eccessivo)", "Ruminazione Mentale",
  "People-Pleasing", "Esaurimento Emotivo", "Sovraccarico Sensoriale",
  "Paure Inconsce", "Ansia Somatica", "Perfezionismo", "Paura del Giudizio",
  "Ansia Mattutina", "Spirali Notturne", "Confini Emotivi",
  "Dialogo Interiore Critico", "Risposte da Trauma", "Sensibilità del Bambino Interiore"
];
