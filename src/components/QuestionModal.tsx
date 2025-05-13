import React, { useState, useEffect } from 'react';
import { Question, Category, Team } from '../types';

interface QuestionModalProps {
  question: Question | null;
  category: Category | null;
  currentTeam: Team | null;
  onClose: () => void;
  onAnswer: (isCorrect: boolean) => void;
  isEditMode: boolean;
  onSaveQuestion?: (
    categoryId: string,
    questionId: string,
    updates: Partial<Question>
  ) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  category,
  currentTeam,
  onClose,
  onAnswer,
  isEditMode,
  onSaveQuestion,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Partial<Question>>(
    question || { text: '', answer: '', points: 100, type: 'secca' }
  );
  const [timeLeft, setTimeLeft] = useState(60); // 60 secondi = 1 minuto
  const [timerActive, setTimerActive] = useState(true);

  // Effetto per gestire il timer
  useEffect(() => {
    if (isEditMode || !timerActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Tempo scaduto, contrassegna la risposta come errata
          if (!showAnswer) {
            handleTimeUp();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, isEditMode, showAnswer]);

  // Reset timer quando si apre una nuova domanda
  useEffect(() => {
    if (!isEditMode) {
      setTimeLeft(60);
      setTimerActive(true);
    }
  }, [question, isEditMode]);

  if (!question || !category) return null;

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setTimerActive(false); // Ferma il timer quando si mostra la risposta
  };

  const handleAnswer = (isCorrect: boolean) => {
    onAnswer(isCorrect);
    setShowAnswer(false);
    setTimerActive(false);
  };

  const handleTimeUp = () => {
    // Tempo scaduto, mostra la risposta e poi contrassegna come errata
    setShowAnswer(true);
    setTimerActive(false);
    
    // Piccolo ritardo per mostrare la risposta prima di chiudere
    setTimeout(() => {
      onAnswer(false);
      setShowAnswer(false);
    }, 1500);
  };

  const handleSave = () => {
    if (onSaveQuestion && category) {
      onSaveQuestion(category.id, question.id, editedQuestion);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedQuestion({
      ...editedQuestion,
      [name]: name === 'points' ? parseInt(value, 10) : value,
    });
  };

  // Formatta il tempo in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Determina il colore del timer in base al tempo rimanente
  const getTimerColor = () => {
    if (timeLeft > 30) return 'text-green-500';
    if (timeLeft > 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Determina il messaggio in base al tipo di domanda
  const getTypeDescription = () => {
    switch(question.type) {
      case 'secca': 
        return 'Questa è una domanda a risposta secca, la risposta deve essere esatta.';
      case 'aperta':
        return 'Questa è una domanda a risposta aperta, può esserci una certa flessibilità.';
      case 'margine_errore':
        return 'Questa è una domanda con margine di errore, accetta risposte approssimate.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-blue-900 rounded-lg shadow-2xl max-w-2xl w-full mx-auto overflow-hidden transform transition-all animate-fadeIn">
        <div className="p-6">
          {isEditMode ? (
            // Edit Mode
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">Modifica Domanda</h2>
              
              <div>
                <label className="block text-yellow-400 mb-2">Categoria</label>
                <input
                  type="text"
                  value={category.title}
                  disabled
                  className="w-full p-2 rounded bg-blue-800 text-yellow-400 border border-blue-700"
                />
              </div>
              
              <div>
                <label className="block text-yellow-400 mb-2">Punti</label>
                <select
                  name="points"
                  value={editedQuestion.points}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-blue-800 text-yellow-400 border border-blue-700"
                >
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={300}>300</option>
                  <option value={400}>400</option>
                  <option value={500}>500</option>
                </select>
              </div>
              
              <div>
                <label className="block text-yellow-400 mb-2">Tipo di Domanda</label>
                <select
                  name="type"
                  value={editedQuestion.type || 'secca'}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-blue-800 text-yellow-400 border border-blue-700"
                >
                  <option value="secca">Risposta Secca (Esatta)</option>
                  <option value="aperta">Risposta Aperta (Flessibile)</option>
                  <option value="margine_errore">Margine di Errore (Approssimata)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-yellow-400 mb-2">Domanda</label>
                <textarea
                  name="text"
                  value={editedQuestion.text}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 rounded bg-blue-800 text-yellow-400 border border-blue-700"
                />
              </div>
              
              <div>
                <label className="block text-yellow-400 mb-2">Risposta</label>
                <textarea
                  name="answer"
                  value={editedQuestion.answer}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-2 rounded bg-blue-800 text-yellow-400 border border-blue-700"
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-yellow-500 text-blue-900 rounded hover:bg-yellow-400 transition font-bold"
                >
                  Salva Domanda
                </button>
              </div>
            </div>
          ) : (
            // Game Mode
            <div>
              {/* Team Information */}
              {currentTeam && (
                <div 
                  className="flex items-center gap-2 mb-4 p-2 rounded-md"
                  style={{ backgroundColor: `${currentTeam.color}20`, borderColor: currentTeam.color, borderWidth: '1px' }}
                >
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ backgroundColor: currentTeam.color }}
                  ></div>
                  <span className="font-bold">{currentTeam.name}</span>
                  <span className="ml-auto text-sm opacity-80">
                    {question.type === 'secca' ? 'Risposta Esatta' : 
                     question.type === 'aperta' ? 'Risposta Flessibile' : 
                     'Margine di Errore'}
                  </span>
                </div>
              )}
              
              {/* Timer display */}
              <div className={`text-center mb-2 font-bold text-xl ${getTimerColor()}`}>
                Tempo: {formatTime(timeLeft)}
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">
                  {category.title} - {question.points}
                </h3>
                <div className="text-2xl md:text-3xl text-white font-medium py-4">
                  {question.text}
                </div>
                
               
              </div>

              {showAnswer ? (
                <div className="mt-8 mb-6">
                  <h4 className="text-yellow-400 font-bold text-lg mb-2">Risposta:</h4>
                  <div className="text-xl md:text-2xl text-white py-4 bg-blue-800 p-4 rounded">
                    {question.answer}
                  </div>
                  
                  <div className="flex justify-center space-x-4 mt-6">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-500 transition font-bold"
                    >
                      Errata
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-500 transition font-bold"
                    >
                      Corretta
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleShowAnswer}
                    className="px-6 py-3 bg-yellow-500 text-blue-900 rounded-md hover:bg-yellow-400 transition font-bold"
                  >
                    Mostra Risposta
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Close button outside card */}
      <button 
        className="absolute top-4 right-4 text-white hover:text-yellow-400 transition" 
        onClick={onClose}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

export default QuestionModal;