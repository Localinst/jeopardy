import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { SITE_URL } from '../config';
import { Plus, Minus, Users, Check, Trophy } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

interface TeamSetupProps {
  onTeamsCreated: (teams: Team[]) => void;
  onCancel: () => void;
}

const TEAM_COLORS = [
  { name: 'Rosso', value: '#ef4444' },
  { name: 'Blu', value: '#3b82f6' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Giallo', value: '#eab308' },
  { name: 'Viola', value: '#a855f7' },
  { name: 'Arancione', value: '#f97316' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Ciano', value: '#06b6d4' }
];

const DEFAULT_TEAMS = [
  { id: '1', name: 'Squadra 1', color: '#ef4444', score: 0 },
  { id: '2', name: 'Squadra 2', color: '#3b82f6', score: 0 }
];

const TeamSetup: React.FC<TeamSetupProps> = ({ onTeamsCreated, onCancel }) => {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [error, setError] = useState('');

  const addTeam = () => {
    if (teams.length >= 5) {
      setError('Non puoi aggiungere più di 5 squadre');
      return;
    }
    
    setError('');
    const nextTeamId = (teams.length + 1).toString();
    const nextTeamColor = TEAM_COLORS[teams.length % TEAM_COLORS.length].value;
    
    setTeams([
      ...teams,
      {
        id: nextTeamId,
        name: `Squadra ${nextTeamId}`,
        color: nextTeamColor,
        score: 0
      }
    ]);
  };

  const removeTeam = () => {
    if (teams.length <= 2) {
      setError('Ci devono essere almeno 2 squadre');
      return;
    }
    
    setError('');
    setTeams(teams.slice(0, -1));
  };

  const updateTeamName = (index: number, newName: string) => {
    const updatedTeams = [...teams];
    updatedTeams[index].name = newName;
    setTeams(updatedTeams);
  };

  const updateTeamColor = (index: number, newColor: string) => {
    const updatedTeams = [...teams];
    updatedTeams[index].color = newColor;
    setTeams(updatedTeams);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = teams.every(team => team.name.trim().length > 0);
    if (!isValid) {
      setError('Ogni squadra deve avere un nome');
      return;
    }
    
    onTeamsCreated(teams);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white flex flex-col items-center justify-center p-4">
      <Helmet>
        <link rel="canonical" href={`${SITE_URL}/team-setup`} />
        <title>{t ? t('title') : 'Jeopardy AI Quiz'}</title>
        <meta name="description" content={t ? t('description') : 'Configure teams for the Jeopardy AI quiz.'} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en/team-setup`} />
        <link rel="alternate" hrefLang="it" href={`${SITE_URL}/it/team-setup`} />
      </Helmet>
      <div className="bg-blue-900 border border-blue-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-center mb-6">
          <Users className="h-8 w-8 text-yellow-400 mr-3" />
          <h2 className="text-3xl font-bold text-yellow-400 text-center">
            Configura le Squadre
          </h2>
        </div>
        
        <p className="text-blue-300 mb-6 text-center">
          Crea da 2 a 5 squadre che si sfideranno nel quiz Jeopardy!
        </p>

        {error && (
          <div className="bg-red-900 text-white p-3 rounded-md mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <button 
              type="button" 
              onClick={removeTeam}
              className="p-2 bg-blue-800 hover:bg-blue-700 rounded-full"
              aria-label="Rimuovi squadra"
            >
              <Minus size={20} />
            </button>
            
            <span className="text-xl font-bold">{teams.length} Squadre</span>
            
            <button 
              type="button" 
              onClick={addTeam}
              className="p-2 bg-blue-800 hover:bg-blue-700 rounded-full"
              aria-label="Aggiungi squadra"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {teams.map((team, index) => (
              <div 
                key={team.id} 
                className="flex items-center p-3 rounded-md border"
                style={{ borderColor: team.color }}
              >
                <div 
                  className="h-8 w-8 rounded-full flex-shrink-0 mr-3" 
                  style={{ backgroundColor: team.color }}
                ></div>

                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => updateTeamName(index, e.target.value)}
                  placeholder={`Nome Squadra ${index + 1}`}
                  className="w-40 p-2 rounded-md bg-blue-800 border border-blue-700 text-white"
                  required
                />
                <div className="ml-2 flex-shrink-0">
                  <select
                    value={team.color}
                    onChange={(e) => updateTeamColor(index, e.target.value)}
                    className="p-2 rounded-md bg-blue-800 border border-blue-700 text-white appearance-none cursor-pointer"
                    style={{ backgroundColor: team.color }}
                  >
                    {TEAM_COLORS.map((color) => (
                      <option 
                        key={color.value} 
                        value={color.value}
                        style={{ backgroundColor: color.value }}
                      >
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-yellow-500/10 p-4 rounded-md">
            <h3 className="text-yellow-400 flex items-center mb-2">
              <Trophy className="h-5 w-5 mr-2" />
              Come si gioca
            </h3>
            <ul className="text-blue-300 list-disc list-inside text-sm space-y-1">
              <li>Ogni squadra gioca a turno</li>
              <li>A ogni turno, una squadra sceglie una casella dalla griglia</li>
              <li>Se la risposta è corretta, il punteggio viene aggiunto alla squadra</li>
              <li>Se la risposta è sbagliata, il turno passa alla squadra successiva</li>
              <li>Vince la squadra con il punteggio più alto alla fine del gioco</li>
            </ul>
          </div>

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            >
              Indietro
            </button>
            
            <button
              type="submit"
              className="px-5 py-2 bg-yellow-500 text-blue-900 rounded-md hover:bg-yellow-400 transition font-bold flex items-center"
            >
              <Check className="h-5 w-5 mr-2" />
              Inizia il Gioco
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamSetup; 