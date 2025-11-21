import React, { useState } from 'react';
import { CarouselData } from '../types';
import { ChevronLeft, ChevronRight, Battery, Wifi, Signal } from 'lucide-react';

interface PhonePreviewProps {
  data: CarouselData | null;
  isLoading: boolean;
}

const PhonePreview: React.FC<PhonePreviewProps> = ({ data, isLoading }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (isLoading) {
    return (
      <div className="w-[320px] h-[640px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 w-40 h-6 bg-gray-800 rounded-b-xl z-20"></div>
        <div className="text-rose-200 animate-pulse flex flex-col items-center gap-4 p-6 text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif italic text-lg">Creo magia...</p>
          <p className="text-sm opacity-75">Dipingo e scrivo per te</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-[320px] h-[640px] bg-white/50 backdrop-blur-sm rounded-[3rem] border-8 border-gray-200 shadow-xl flex items-center justify-center relative">
        <div className="text-gray-400 text-center p-8">
          <p>Seleziona un tema e clicca Genera per vedere l'anteprima qui.</p>
        </div>
      </div>
    );
  }

  // Combine regular slides (Slide 1, Slide 2) and the final slide (Slide 3)
  const totalSlides = data.slides.length + 1;

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Helper to get background style
  const getBackgroundStyle = (index: number) => {
    // For regular slides (0 and 1)
    if (index < data.slides.length) {
      const slide = data.slides[index];
      if (slide.imageUrl) {
        return {
          backgroundImage: `url(${slide.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
    } else if (index === data.slides.length) {
      // Final Slide (Slide 3)
      if (data.finalSlideImageUrl) {
        return {
          backgroundImage: `url(${data.finalSlideImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
      // Fallback if no mockup uploaded
      return { backgroundColor: '#FFF1F2' }; // Rose-50
    }
    
    // Default watercolor fallback
    return {
      backgroundImage: `
        radial-gradient(circle at 20% 30%, rgba(254, 205, 211, 0.6) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(225, 29, 72, 0.1) 0%, transparent 50%),
        url('https://picsum.photos/600/1000?blur=10')
      `
    };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[320px] h-[640px] bg-white rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden select-none">
        {/* Phone Notch & Status Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-800 rounded-b-2xl z-50"></div>
        <div className="absolute top-2 right-6 z-50 flex gap-2 text-white drop-shadow-md">
          <Signal size={14} />
          <Wifi size={14} />
          <Battery size={14} />
        </div>

        {/* Screen Content */}
        <div className="w-full h-full relative bg-[#FDF2F2]">
           {/* Background Layer */}
           <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={getBackgroundStyle(currentSlide)}
           ></div>

           {/* PROFESSIONAL OVERLAY: Matches ScriptDisplay Canvas logic */}
           {/* 1. Global Dimmer */}
           <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
           {/* 2. Gradients top/bottom */}
           <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none"></div>
           
           <div className="absolute inset-0 flex flex-col justify-center items-center p-6 h-full z-10">
             {currentSlide < data.slides.length ? (
               // Regular Slide (Hook or Value)
               <div className="flex flex-col h-full justify-center animate-fade-in w-full text-center mt-[-20px]">
                 {/* Text placed directly on image with strong shadow */}
                 <h3 className="text-3xl font-serif text-white leading-relaxed whitespace-pre-wrap drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-semibold">
                   {data.slides[currentSlide].text}
                 </h3>
                 
                 <div className="absolute bottom-24 left-0 right-0 text-center">
                   <p className="text-xs text-white/90 uppercase tracking-widest font-bold drop-shadow-md">
                     Slide {currentSlide + 1}
                   </p>
                 </div>
               </div>
             ) : (
               // Final Slide (CTA / Book)
               <div className="flex flex-col h-full justify-center items-center w-full text-center animate-fade-in mt-[-20px]">
                 {data.finalSlideImageUrl ? (
                    // New Style: Text over Mockup Image
                    <>
                      <h3 className="text-3xl font-serif text-white leading-relaxed whitespace-pre-wrap drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-semibold">
                        {data.finalSlideSentence}
                      </h3>
                    </>
                 ) : (
                    // Fallback Style (Sticker)
                    <div className="bg-white/90 px-6 py-4 shadow-lg rotate-[-1deg] max-w-[260px] backdrop-blur-sm">
                        <h3 className="text-xl font-serif font-semibold text-rose-900 italic leading-relaxed">
                        "{data.finalSlideSentence}"
                        </h3>
                        <p className="text-xs text-gray-400 mt-2 not-italic">[Manca foto libro]</p>
                    </div>
                 )}

                 <div className="absolute bottom-24 left-0 right-0 text-center">
                   <p className="text-xs text-white/90 uppercase tracking-widest font-bold drop-shadow-md">
                     Slide 3
                   </p>
                 </div>
               </div>
             )}
           </div>

           {/* Overlay UI Controls (TikTok style side buttons simulation) */}
           <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-20">
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20">
                 <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white"></div>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20"></div>
              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20"></div>
           </div>
           
           {/* Bottom Description Overlay */}
           <div className="absolute bottom-0 left-0 right-0 p-4 text-white pt-12 z-20">
             <p className="text-xs opacity-90 line-clamp-2 leading-relaxed drop-shadow-md text-shadow-sm">
               {data.description}
             </p>
           </div>
        </div>
      </div>

      {/* External Controls */}
      <div className="flex items-center gap-8 text-rose-900">
        <button 
          onClick={handlePrev}
          className="p-2 rounded-full hover:bg-rose-100 transition-colors"
        >
          <ChevronLeft size={32} />
        </button>
        <span className="font-serif text-lg font-medium">
          {currentSlide + 1} / {totalSlides}
        </span>
        <button 
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-rose-100 transition-colors"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default PhonePreview;
