import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../config';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // update URL to include language prefix for better indexing
    try {
      const path = window.location.pathname.replace(/^(\/it|\/en)/, '');
      const newPath = `/${lng}${path}`;
      window.history.replaceState({}, '', newPath);
      document.documentElement.lang = lng;
    } catch (e) {
      // ignore
    }
  };

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
    <div className="relative min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white flex flex-col items-center justify-center px-4 text-center">
      <Helmet>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en/`} />
        <link rel="alternate" hrefLang="it" href={`${SITE_URL}/it/`} />
      </Helmet>

      {/* Language picker: top-right with flags */}
      <div className="absolute top-4 right-4 flex items-center gap-2" role="navigation" aria-label="Language selector">
        <button
          onClick={() => changeLanguage('en')}
          title="English"
          aria-label="English"
          className="px-4 py-2 rounded-md bg-black/30 hover:bg-black/40 text-sm"
        >
          <span className="mr-2">🇬🇧</span> EN
        </button>
        <button
          onClick={() => changeLanguage('it')}
          title="Italiano"
          aria-label="Italiano"
          className="px-4 py-2 rounded-md bg-black/30 hover:bg-black/40 text-sm"
        >
          <span className="mr-2">🇮🇹</span> IT
        </button>
      </div>

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
      
      <h1 className="text-5xl font-bold text-yellow-400 mb-4">{t('title')}</h1>
      <p className="text-blue-300 text-xl max-w-2xl mb-12">{t('subtitle')}</p>
      
      <div className="space-y-4 w-full max-w-md">
       

        <button
          onClick={handleStartGame}
          disabled={isLoading}
          className={`w-full bg-yellow-500 hover:bg-yellow-400 text-blue-900 py-4 px-6 rounded-lg text-xl font-bold transition-all transform hover:scale-105 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? t('loading') : t('start_random')}
        </button>
        
        <button
          onClick={handleCreateAIGame}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-lg text-xl font-bold transition-all transform hover:scale-105 relative group"
        >
          <span className="flex items-center justify-center">
            {t('create_ai')}
          </span>
          <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity"></span>
        </button>

      </div>
      
      <p className="mt-12 text-blue-300 text-sm max-w-lg">{t('description')}</p>
      
     
    </div>
  );
};

export default LandingPage; 