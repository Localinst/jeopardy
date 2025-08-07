import React, { useState, useEffect } from 'react';
import { Brain, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface LandingPageProps {
  onStartGame: () => void;
  onCreateAIGame: () => void;
}



const LandingPage: React.FC<LandingPageProps> = ({ onStartGame, onCreateAIGame }) => {
  const [sparklePosition, setSparklePosition] = useState({ top: 0, left: 0, size: 0 });
  const [showSparkle, setShowSparkle] = useState(false);
  const [sparkleCount, setSparkleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = async () => {
    setIsLoading(true);
    try {
      if (window.gtag) {
        window.gtag('event', 'start_random_quiz', {
          event_category: 'Quiz',
          event_label: 'Quiz con categorie casuali'
        });
      }
      onStartGame();
    } catch (error) {
      console.error('Error starting game:', error);
      // In caso di errore, mostra un messaggio all'utente o gestisci l'errore come preferisci
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreateAIGame = () => {
  if (window.gtag) {
    window.gtag('event', 'create_ai_quiz', {
      event_category: 'Quiz',
      event_label: 'Quiz creato con IA'
    });
  }
  onCreateAIGame();
};
  // Crea un effetto brillante casuale intorno al cervello
  useEffect(() => {
    const interval = setInterval(() => {
      if (sparkleCount > 15) {
        setShowSparkle(false);
        setTimeout(() => {
          setSparkleCount(0);
        }, 1000);
      } else {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 30;
        const top = Math.sin(angle) * distance;
        const left = Math.cos(angle) * distance;
        const size = 12 + Math.random() * 10;
        
        setSparklePosition({ top, left, size });
        setShowSparkle(true);
        
        setTimeout(() => {
          setShowSparkle(false);
        }, 700);
        
        setSparkleCount(prev => prev + 1);
      }
    }, 300);
    
    return () => clearInterval(interval);
  }, [sparkleCount]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8">
        <Brain className="h-16 w-16 text-yellow-400 animate-pulse" />
        
        {showSparkle && (
          <Sparkles 
            className="absolute text-yellow-400 animate-ping"
            style={{ 
              top: `calc(50% + ${sparklePosition.top}px)`, 
              left: `calc(50% + ${sparklePosition.left}px)`,
              height: `${sparklePosition.size}px`,
              width: `${sparklePosition.size}px`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </div>
      
      <h1 className="text-5xl font-bold text-yellow-400 mb-4">Quiz Jeopardy</h1>
      <p className="text-blue-300 text-xl max-w-2xl mb-12">
        Metti alla prova le tue conoscenze con questo classico gioco di quiz!
      </p>
      
      <div className="space-y-4 w-full max-w-md">
        <button
          onClick={handleStartGame}
          disabled={isLoading}
          className={`w-full bg-yellow-500 hover:bg-yellow-400 text-blue-900 py-4 px-6 rounded-lg text-xl font-bold transition-all transform hover:scale-105 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Caricamento...' : 'Gioca con Categorie Casuali'}
        </button>
        
        <button
          onClick={handleCreateAIGame}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-lg text-xl font-bold transition-all transform hover:scale-105 relative group"
        >
          <span className="flex items-center justify-center">
            Crea Quiz con IA
          </span>
          <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity"></span>
        </button>

      </div>
      
      <p className="mt-12 text-blue-300 text-sm max-w-lg">
        La funzionalità AI genera automaticamente domande e risposte personalizzate basate sulle categorie che scegli!
      </p>
      
     
    </div>
  );
};

export default LandingPage; 