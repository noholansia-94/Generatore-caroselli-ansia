import React, { useState } from 'react';
import { CarouselData, Slide } from '../types';
import { Copy, Check, Image as ImageIcon, Layers } from 'lucide-react';

interface ScriptDisplayProps {
  data: CarouselData | null;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
      title="Copia testo"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
};

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ data }) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!data) return null;

  // Helper to create safe filenames from titles
  const getSafeFilename = (title: string, suffix: string) => {
    const safeTitle = title
      .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
      .toLowerCase()
      .slice(0, 30); // Limit length
    return `${safeTitle}-${suffix}.png`;
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCompositeImage = async (imageUrl: string, text: string, filenameSuffix: string) => {
    if (!imageUrl) return;
    
    setProcessingId(`composite-${filenameSuffix}`);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // TikTok vertical resolution
      canvas.width = 1080;
      canvas.height = 1920;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // 1. Draw Image (Cover logic)
      // Need to preserve aspect ratio and cover the canvas
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const xOffset = (canvas.width - img.width * scale) / 2;
      const yOffset = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, xOffset, yOffset, img.width * scale, img.height * scale);

      // 2. PROFESSIONAL OVERLAY
      // Graphic Design Rule: Apply a subtle 20% black overlay over the whole image
      // to ensure white text pops against any background brightness.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Additional Gradient for Bottom (Anchor) and Top
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0,0,0,0.4)'); // Darker top for visibility
      gradient.addColorStop(0.2, 'rgba(0,0,0,0.0)'); // Clear middle
      gradient.addColorStop(0.6, 'rgba(0,0,0,0.1)'); 
      gradient.addColorStop(1, 'rgba(0,0,0,0.6)'); // Dark bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 4. Typography Setup
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Professional Soft Drop Shadow (Not harsh black)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      // Font configuration - Playfair Display for that emotional feel
      const fontSize = 72;
      ctx.font = `600 ${fontSize}px "Playfair Display", serif`;

      const x = canvas.width / 2;
      const maxWidth = canvas.width * 0.82; // Leave margins
      const lineHeight = fontSize * 1.35; // Breathing room between lines

      // Text Wrapping Logic
      const words = text.split(' ');
      let line = '';
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      // Vertical Centering
      const totalHeight = lines.length * lineHeight;
      let startY = (canvas.height - totalHeight) / 2;
      
      // Visual adjustment: slightly higher than center looks better on phone screens
      startY -= 50; 

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, startY + (i * lineHeight) + (lineHeight / 2));
      }

      // Export
      const dataUrl = canvas.toDataURL('image/png');
      const filename = getSafeFilename(data.title, filenameSuffix);
      downloadImage(dataUrl, filename);

    } catch (error) {
      console.error("Error generating image", error);
      alert("Impossibile generare l'immagine composta. Riprova.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6 pb-12">
      {/* Title & Description */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold uppercase text-rose-400 tracking-wider">Titolo TikTok</span>
          <CopyButton text={data.title} />
        </div>
        <h2 className="text-xl font-serif text-gray-800 mb-4">{data.title}</h2>
        
        <div className="flex justify-between items-start mb-2 border-t border-rose-50 pt-4">
          <span className="text-xs font-bold uppercase text-rose-400 tracking-wider">Descrizione (Caption)</span>
          <CopyButton text={data.description} />
        </div>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{data.description}</p>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif text-rose-950 px-2">Anteprima Slide</h3>
        
        {data.slides.map((slide, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 group transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="inline-block bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
                Slide {slide.slideNumber} {index === 0 ? '- GANCIO (Hook)' : '- VALORE'}
              </span>
            </div>

            {/* Text Content */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-1">
                <label className="text-xs text-gray-400 uppercase tracking-wide">Testo sulla Slide</label>
                <CopyButton text={slide.text} />
              </div>
              <p className="text-lg text-gray-800 font-medium font-serif">{slide.text}</p>
            </div>

            {/* Downloads Section */}
            {slide.imageUrl ? (
               <div className="flex flex-wrap gap-3 mb-6 pt-4 border-t border-rose-50">
                  <button 
                    onClick={() => generateCompositeImage(slide.imageUrl!, slide.text, `slide-${slide.slideNumber}-completa`)}
                    disabled={processingId === `composite-slide-${slide.slideNumber}-completa`}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-950 text-white rounded-lg text-sm font-medium hover:bg-rose-800 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {processingId === `composite-slide-${slide.slideNumber}-completa` ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> : <Layers size={16} />}
                    Scarica Completa (Testo + Immagine)
                  </button>
                  
                  <button 
                    onClick={() => downloadImage(slide.imageUrl!, getSafeFilename(data.title, `slide-${slide.slideNumber}-sfondo`))}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-900 rounded-lg text-sm font-medium hover:bg-rose-50 transition-colors"
                  >
                    <ImageIcon size={16} />
                    Scarica Solo Sfondo (No Testo)
                  </button>
               </div>
            ) : (
               <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500 italic mb-4">
                 Immagine in fase di generazione...
               </div>
            )}

            {/* Image Prompt Details (Collapsible/Secondary) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <label className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  Prompt (Tecnico)
                </label>
                <CopyButton text={slide.imagePrompt} />
              </div>
              <p className="text-xs text-slate-500 font-mono leading-relaxed line-clamp-1 hover:line-clamp-none transition-all cursor-help">
                {slide.imagePrompt}
              </p>
            </div>
          </div>
        ))}

        {/* Final Slide */}
        <div className="bg-rose-50 p-6 rounded-2xl shadow-sm border border-rose-200">
            <div className="flex justify-between items-center mb-4">
              <span className="inline-block bg-rose-200 text-rose-900 text-xs font-bold px-3 py-1 rounded-full">
                Slide 3 - CTA (Finale)
              </span>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-start mb-1">
                  <label className="text-xs text-rose-400 uppercase tracking-wide">Testo per il Libro</label>
                  <CopyButton text={data.finalSlideSentence} />
              </div>
              <p className="text-xl text-rose-900 font-serif italic">"{data.finalSlideSentence}"</p>
            </div>

            {/* Download Mockup + Text */}
             {data.finalSlideImageUrl ? (
               <div className="flex flex-wrap gap-3 pt-4 border-t border-rose-200/50">
                  <button 
                    onClick={() => generateCompositeImage(data.finalSlideImageUrl!, data.finalSlideSentence, `slide-3-libro`)}
                    disabled={processingId === `composite-slide-3-libro`}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-900 text-white rounded-lg text-sm font-medium hover:bg-rose-800 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {processingId === `composite-slide-3-libro` ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> : <Layers size={16} />}
                    Scarica Slide 3 (Mockup + Testo)
                  </button>
               </div>
             ) : (
               <p className="text-xs text-rose-500 mt-4 italic flex items-center gap-2">
                 <span>ℹ️</span>
                 Carica le foto del mockup nel menu a sinistra per creare automaticamente questa slide.
               </p>
             )}
        </div>
      </div>
    </div>
  );
};

export default ScriptDisplay;
