import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Send, CheckCircle } from 'lucide-react';

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1438301596453965915/Ukx_xWHm2mnzGVcQkejY7_ndecvqI0uM9ZL1kecbzGjiOeyZ5zr5XylTmBBlLpbW-VhM';

const FeedbackForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  // Debug: log webhook URL on component mount
  React.useEffect(() => {
    console.log('FeedbackForm mounted. WEBHOOK_URL:', WEBHOOK_URL ? 'configured' : 'NOT CONFIGURED');
    }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validazione
    if (!message.trim()) {
      setError(t('feedback.error.general'));
      setLoading(false);
      return;
    }

    try {
      console.log('Submit clicked. WEBHOOK_URL exists:', !!WEBHOOK_URL);
      
      // Se il webhook URL non è configurato, mostra un avviso in console
      if (!WEBHOOK_URL) {
        console.warn('DISCORD_WEBHOOK_URL non configurato. Feedback non sarà inviato.');
        setSuccess(true);
        setEmail('');
        setMessage('');
        setLoading(false);
        return;
      }

      console.log('Sending feedback to webhook...');

      const content = email ? `**Email:** ${email}\n\n${message}` : message;
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          username: 'Jeopardy Feedback',
          avatar_url: 'https://jeopardyonline.it/earth.png'
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setEmail('');
        setMessage('');
      } else {
        setError(t('feedback.error.general'));
      }
    } catch (err) {
      console.error('Feedback error:', err);
      setError(t('feedback.error.network'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-16 px-4">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Mail className="text-yellow-400" size={28} />
            <h2 className="text-3xl font-bold text-white">{t('feedback.title')}</h2>
          </div>
          <p className="text-gray-300">{t('feedback.subtitle')}</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
            <p className="text-green-400 text-lg font-semibold">{t('feedback.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-yellow-300 mb-2">
                {t('feedback.emailLabel')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('feedback.emailPlaceholder')}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50 focus:bg-white/15 transition-all"
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-yellow-300 mb-2">
                {t('feedback.messageLabel')} *
              </label>
              <textarea
                id="message"
                name="message"
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t('feedback.messagePlaceholder')}
                maxLength={500}
                rows={5}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50 focus:bg-white/15 transition-all resize-none"
              />
              <div className="text-sm text-gray-400 mt-2 text-right">
                {message.length}/500 {t('feedback.characters')}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-bold transition-all transform flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 hover:scale-105 hover:shadow-lg hover:from-yellow-300 hover:to-yellow-400'
              }`}
            >
              <Send size={18} />
              {loading ? t('feedback.sending') : t('feedback.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
