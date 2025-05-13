import React from 'react';
import { Home, Users } from 'lucide-react';

interface GameControlsProps {
  score: number;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onResetGame: () => void;
  onResetScore: () => void;
  onCreateNewGame: () => void;
  onBackToLanding: () => void;
  onConfigureTeams: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  score,
  isEditMode,
  onToggleEditMode,
  onResetGame,
  onResetScore,
  onCreateNewGame,
  onBackToLanding,
  onConfigureTeams,
}) => {
  return (
    <div className="bg-blue-950 text-white p-4 rounded-md shadow-md mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="text-lg mr-4">
            <span className="font-bold">Punteggio Totale:</span>
            <span className={`ml-2 font-bold text-2xl ${score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {score}
            </span>
          </div>
          <button 
            onClick={onResetScore}
            className="bg-blue-800 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
          >
            Azzera Punteggio
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={onBackToLanding}
            className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition flex items-center"
          >
            <Home className="h-4 w-4 mr-1" />
            Menu Principale
          </button>
          
          <button
            onClick={onConfigureTeams}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-semibold transition flex items-center"
          >
            <Users className="h-4 w-4 mr-1" />
            Configura Squadre
          </button>
          
          <button
            onClick={onToggleEditMode}
            className={`
              px-4 py-2 rounded font-semibold transition
              ${isEditMode 
                ? 'bg-green-600 hover:bg-green-500 text-white' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-blue-900'}
            `}
          >
            {isEditMode ? 'Salva e Gioca' : 'Modifica Domande'}
          </button>
          
          <button
            onClick={onCreateNewGame}
            className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition"
          >
            Nuovo Gioco
          </button>
          
          <button
            onClick={onResetGame}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition"
          >
            Ripristina Predefiniti
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;