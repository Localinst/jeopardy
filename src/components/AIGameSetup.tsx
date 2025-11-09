import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { SITE_URL } from '../config';
import { Loader2, RefreshCw } from 'lucide-react';
import { generateCategoriesWithAI } from '../services/aiService';

interface AIGameSetupProps {
  onGameCreated: (categories: any[], quizId?: string | null) => void;
  onCancel: () => void;
}

// Componente per l'icona dell'IA
const AIIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M15.5 15.5L8.5 8.5M15.5 8.5L8.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const AIGameSetup: React.FC<AIGameSetupProps> = ({ onGameCreated, onCancel }) => {
  const { t, i18n } = useTranslation();
  const [topics, setTopics] = useState<string[]>(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const generateQuiz = async () => {
    setIsLoading(true);
    setError('');
    setErrorDetails('');
    
    // Simuliamo un progresso di caricamento
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 500);

    try {
  // Chiamata all'API tramite il nostro servizio (passiamo la lingua corrente)
  const currentLang = i18n?.language || 'it';
  const result = await generateCategoriesWithAI(topics, currentLang);
  const categoriesData = result.categories;
  const quizId = result.quizId || null;
      
      // Completiamo il progresso al 100%
      clearInterval(progressInterval);
      setProgress(100);
      
      // Piccolo ritardo per mostrare il 100% prima di procedere
      setTimeout(() => {
        onGameCreated(categoriesData, quizId);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      
      const errorMessage = (err as Error).message;
      const errorStack = (err as Error).stack || '';
      
      setError(`Si è verificato un errore durante la generazione delle domande: ${errorMessage}`);
      setErrorDetails(errorStack);
      
      console.error('Errore completo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all topics are filled
    if (topics.some(topic => !topic.trim())) {
      setError('Per favore inserisci tutte e 5 le categorie.');
      return;
    }

    // Reset retry count on new submission
    setRetryCount(0);
    await generateQuiz();
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await generateQuiz();
  };

  const exampleTopics = [
    'Storia Italiana', 'Musica Rock', 'Videogiochi', 'Scienza', 'Cinema', 
    'Cultura Pop', 'Sport', 'Geografia', 'Arte', 'Cibo e Cucina',
    'Astronomia', 'Letteratura', 'Tecnologia', 'Animali', 'Serie TV'
  ];

  const getRandomTopics = () => {
    const shuffled = [...exampleTopics].sort(() => 0.5 - Math.random());
    setTopics(shuffled.slice(0, 5));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white flex flex-col items-center justify-center p-4">
      <Helmet>
        <link rel="canonical" href={`${SITE_URL}/ai-setup`} />
        <title>{t ? t('create_ai') : 'Create AI Quiz'}</title>
        <meta name="description" content={t ? t('description') : 'Generate custom quizzes using AI.'} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en/ai-setup`} />
        <link rel="alternate" hrefLang="it" href={`${SITE_URL}/it/ai-setup`} />
      </Helmet>
      <div className="bg-blue-900 border border-blue-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-center mb-4">
          <AIIcon />
          <h2 className="text-3xl font-bold text-white text-center ml-3">
            {t('ai_generator_title')}
          </h2>
        </div>
        
        <p className="text-blue-300 mb-6 text-center">
          {t('ai_instructions')}
        </p>

        {error && (
          <div className="bg-red-900 text-white p-3 rounded-md mb-4">
            <div className="flex items-center justify-between">
                <p>{error}</p>
              {retryCount < 3 && (
                <button 
                  onClick={handleRetry}
                  className="ml-3 bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                    {t('try_again')}
                </button>
              )}
            </div>
            {errorDetails && (
              <div className="mt-2 p-2 bg-red-950 rounded text-xs overflow-auto max-h-32">
                <pre>{errorDetails}</pre>
              </div>
            )}
            {retryCount >= 3 && (
              <p className="text-sm mt-2">
                {t('tried_multiple')}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <button
              type="button"
              onClick={getRandomTopics}
              className="w-full px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded transition"
              disabled={isLoading}
            >
              {t('suggest_random')}
            </button>
          </div>
        
          {topics.map((topic, index) => (
            <div key={index} className="mb-3">
              <label className="block text-blue-300 mb-1">
                {t('category_placeholder', { n: index + 1 })}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => handleTopicChange(index, e.target.value)}
                placeholder={t('category_placeholder', { n: index + 1 })}
                className="w-full p-3 rounded-md bg-blue-800 border border-blue-700 text-white placeholder-blue-400"
                disabled={isLoading}
              />
            </div>
          ))}

          {isLoading && (
            <div className="mt-4">
              <div className="w-full h-4 bg-blue-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-blue-300 mt-2">
                {t('generating_in_progress')} {progress}%
              </p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
              disabled={isLoading}
            >
              {t('cancel')}
            </button>
            
            <button
              type="submit"
              className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 transition font-bold flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t('generating_in_progress')}</span>
                </>
              ) : (
                <span>{t('generate_quiz')}</span>
              )}
            </button>
          </div>
        </form>

        </div>
    </div>
  );
};

export default AIGameSetup; 