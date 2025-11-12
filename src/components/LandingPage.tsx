import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { Brain, Sparkles } from 'lucide-react';
import FeedbackForm from './FeedbackForm';

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

      <div className="relative mb-8 pt-16">
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
      
      {/* SEO-rich landing content - Modern and beautiful design */}
      <main className="w-full mt-20 text-left">
        {/* About Section */}
        <section className="max-w-5xl mx-auto px-4 py-16 mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {t('landing.about_title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500">{t('landing.about_title_highlight')}</span>
              </h2>
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">{t('landing.about_p1')}</p>
              <p className="text-gray-300 text-lg leading-relaxed">{t('landing.about_p2')}</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-blue-400/20 rounded-2xl blur-2xl"></div>
              <div className="relative bg-gradient-to-br from-blue-800/40 to-purple-800/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-yellow-300 mb-3">{t('landing.instant_creation')}</h3>
                <p className="text-gray-200">{t('landing.instant_creation_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-5xl mx-auto px-4 py-16 mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">{t('landing.features_title')}</h2>
          <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">{t('landing.features_subtitle')}</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🤖", titleKey: "landing.feature_ai.title", descKey: "landing.feature_ai.desc" },
              { icon: "👥", titleKey: "landing.feature_teams.title", descKey: "landing.feature_teams.desc" },
              { icon: "🔗", titleKey: "landing.feature_sharing.title", descKey: "landing.feature_sharing.desc" },
              { icon: "🌍", titleKey: "landing.feature_multilang.title", descKey: "landing.feature_multilang.desc" },
              { icon: "📚", titleKey: "landing.feature_didactic.title", descKey: "landing.feature_didactic.desc" },
              { icon: "✨", titleKey: "landing.feature_quality.title", descKey: "landing.feature_quality.desc" }
            ].map((feature, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-blue-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                <div className="relative bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-yellow-300/30 transition-all duration-300 h-full hover:bg-white/10 hover:-translate-y-1">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-yellow-300 mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{t(feature.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto px-4 py-16 mb-20 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl border border-white/5 p-12">
          <h2 className="text-4xl font-bold text-white mb-4">{t('landing.how_works_title')}</h2>
          <p className="text-gray-300 text-lg mb-12 max-w-3xl">{t('landing.how_works_desc')}</p>
          
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { num: "1", key: "landing.step_1" },
              { num: "2", key: "landing.step_2" },
              { num: "3", key: "landing.step_3" },
              { num: "4", key: "landing.step_4" }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg">
                  {step.num}
                </div>
                <p className="text-center text-gray-200 font-medium">{t(step.key)}</p>
                {idx < 3 && <div className="hidden md:block mt-6 text-2xl text-yellow-400">→</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-5xl mx-auto px-4 py-16 mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 md:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-2xl blur-2xl"></div>
              <div className="relative bg-gradient-to-br from-purple-800/40 to-blue-800/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
                <div className="text-5xl mb-4">💡</div>
                <h3 className="text-xl font-bold text-yellow-300 mb-3">{t('landing.save_time')}</h3>
                <p className="text-gray-200 mb-4">{t('landing.save_time_desc')}</p>
                <p className="text-gray-300 text-sm">{t('landing.save_time_details')}</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {t('landing.benefits_title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500">{t('landing.benefits_title_highlight')}</span>
              </h2>
              <ul className="space-y-4">
                {[
                  'landing.benefit_1',
                  'landing.benefit_2',
                  'landing.benefit_3',
                  'landing.benefit_4',
                  'landing.benefit_5',
                  'landing.benefit_6'
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-yellow-400 font-bold mt-1">✓</span>
                    <span className="text-gray-200 text-lg">{t(benefit)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-5xl mx-auto px-4 py-16 mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">{t('landing.faq_title')}</h2>
          <p className="text-center text-gray-300 mb-12">{t('landing.faq_subtitle')}</p>
          
          <div className="space-y-4">
            {[
              { qKey: "landing.faq_1_q", aKey: "landing.faq_1_a" },
              { qKey: "landing.faq_2_q", aKey: "landing.faq_2_a" },
              { qKey: "landing.faq_3_q", aKey: "landing.faq_3_a" },
              { qKey: "landing.faq_4_q", aKey: "landing.faq_4_a" },
              { qKey: "landing.faq_5_q", aKey: "landing.faq_5_a" }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300 hover:border-yellow-300/20">
                <h3 className="text-lg font-bold text-yellow-300 mb-2 flex items-start gap-2">
                  <span>❓</span> {t(faq.qKey)}
                </h3>
                <p className="text-gray-300 ml-6">{t(faq.aKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="bg-gradient-to-r from-yellow-500/20 via-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.cta_title')}</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">{t('landing.cta_subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartGame}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                {t('landing.cta_button_1')}
              </button>
              <button
                onClick={handleCreateAIGame}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                {t('landing.cta_button_2')}
              </button>
            </div>
          </div>
        </section>

        {/* Feedback Form Section */}
        <FeedbackForm />

        {/* Footer Credits */}
        <section className="max-w-5xl mx-auto px-4 py-12 text-center border-t border-white/10">
          <p className="text-gray-400 text-sm">{t('landing.footer_text')}</p>
        </section>

      </main>

      {/* Structured data JSON-LD for FAQ */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Posso modificare le domande generate dall'IA?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sì. Dopo la generazione puoi modificare testi, risposte e punteggi tramite l'editor integrato."
              }
            },
            {
              "@type": "Question",
              "name": "È gratuito?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "L'app offre funzionalità di base gratuite. Alcune funzionalità avanzate o integrazioni possono richiedere servizi esterni."
              }
            },
            {
              "@type": "Question",
              "name": "Posso esportare o salvare i quiz?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sì: ogni quiz può essere salvato sul server e condiviso tramite link permanente per rigiocarlo o consentire ad altri di partecipare."
              }
            }
          ]
        })}
      </script>
    </div>
  );
};

export default LandingPage; 