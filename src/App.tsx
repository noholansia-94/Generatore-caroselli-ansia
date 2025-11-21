import React, { useState, useRef, useEffect } from 'react';
import { generateCarouselContent } from './services/geminiService';
import { saveMockup, getMockups, deleteMockup } from './services/storageService';
import { CarouselData, THEMES, MockupImage } from './types';
import PhonePreview from './components/PhonePreview';
import ScriptDisplay from './components/ScriptDisplay';
import { Sparkles, Loader2, BookHeart, Upload, X, Image as ImageIcon } from 'lucide-react';

function App() {
  const [selectedTheme, setSelectedTheme] = useState<string>(THEMES[0]);
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for Book Mockups (Persisted)
  const [bookMockups, setBookMockups] = useState<MockupImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load mockups from database on startup
  useEffect(() => {
    const loadSavedMockups = async () => {
      try {
        const saved = await getMockups();
        setBookMockups(saved);
      } catch (e) {
        console.error("Failed to load mockups", e);
      }
    };
    loadSavedMockups();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newMockups: MockupImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      await new Promise<void>((resolve) => {
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          try {
            const savedMockup = await saveMockup(base64);
            newMockups.push(savedMockup);
          } catch (e) {
            console.error("Error saving mockup", e);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Update UI
    setBookMockups(prev => [...newMockups, ...prev]);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveMockup = async (id: string) => {
    try {
      await deleteMockup(id);
      setBookMockups(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error("Error deleting mockup", e);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateCarouselContent(selectedTheme);
      
      // Pick a random mockup if available
      let finalData = data;
      if (bookMockups.length > 0) {
        const randomIndex = Math.floor(Math.random() * bookMockups.length);
        finalData = {
          ...data,
          finalSlideImageUrl: bookMockups[randomIndex].dataUrl
        };
      }

      setCarouselData(finalData);
    } catch (err) {
      setError("Errore durante la generazione. Controlla la chiave API su Netlify.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F5] text-gray-800 font-sans selection:bg-rose-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-rose-950">
            <div className="p-2 bg-rose-100 rounded-lg">
              <BookHeart size={24} />
            </div>
            <h1 className="text-xl font-serif font-semibold tracking-tight">Generatore Caroselli Ansia</h1>
          </div>
          <div className="text-xs font-medium text-rose-400 uppercase tracking-widest hidden sm:block">
            TikTok Edition
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Controls & Script Output */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Control Panel */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-rose-100 space-y-8">
              
              {/* Theme Selection */}
              <div>
                <h2 className="text-3xl font-serif text-rose-950 mb-2">Crea Nuova Sequenza</h2>
                <p className="text-gray-500 mb-6">Scegli un tema emotivo per generare testo, script e immagini automaticamente.</p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-grow relative">
                    <select
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      disabled={isLoading}
                      className="w-full h-14 pl-6 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-gray-700 text-lg appearance-none focus:outline-none focus:ring-2 focus:ring-rose-200 transition-shadow cursor-pointer disabled:opacity-70"
                    >
                      {THEMES.map((theme) => (
                        <option key={theme} value={theme}>
                          {theme}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="h-14 px-8 bg-rose-950 text-rose-50 rounded-xl font-medium hover:bg-rose-900 focus:ring-4 focus:ring-rose-200 transition-all flex items-center justify-center gap-2 min-w-[180px] disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Sognando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>Genera</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Book Mockup Library */}
              <div className="pt-6 border-t border-rose-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase text-rose-400 tracking-wider flex items-center gap-2">
                    <ImageIcon size={16} />
                    Libreria Mockup Libro (Slide 3)
                  </h3>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-rose-50 text-rose-800 px-3 py-1.5 rounded-lg font-medium hover:bg-rose-100 transition-colors flex items-center gap-2"
                  >
                    <Upload size={14} />
                    Carica Foto
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    multiple 
                    accept="image/*" 
                  />
                </div>
                
                {bookMockups.length === 0 ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-rose-100 rounded-xl p-6 text-center cursor-pointer hover:bg-rose-50/50 transition-colors"
                  >
                    <p className="text-sm text-rose-300 font-medium">
                      Nessun mockup salvato.
                      <br/>
                      <span className="text-xs opacity-70 font-normal">Le foto che carichi qui verranno salvate per sempre su questo dispositivo.</span>
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {bookMockups.map((mockup) => (
                      <div key={mockup.id} className="relative group aspect-[9/16] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img src={mockup.dataUrl} alt="Saved Mockup" className="w-full h-full object-cover" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveMockup(mockup.id); }}
                          className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[9/16] rounded-lg border-2 border-dashed border-rose-200 flex items-center justify-center text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Upload size={20} />
                    </button>
                  </div>
                )}
                {bookMockups.length > 0 && (
                  <p className="text-xs text-gray-400 mt-3 italic">
                    Queste foto sono salvate sul tuo dispositivo. L'app ne sceglierà una a caso per la Slide 3 ad ogni generazione.
                  </p>
                )}
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Generated Content Display */}
            {carouselData && (
              <div className="animate-fade-in-up">
                <ScriptDisplay data={carouselData} />
              </div>
            )}
          </div>

          {/* Right Column: Phone Preview (Sticky) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 flex flex-col items-center">
              <div className="mb-6 text-center lg:text-left w-full">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Anteprima Live</h3>
              </div>
              <PhonePreview data={carouselData} isLoading={isLoading} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
