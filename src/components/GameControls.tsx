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
          
         
          
          
          
         
        </div>
      </div>
    </div>
  );
};

export default GameControls;