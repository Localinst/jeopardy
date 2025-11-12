import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import LandingPage from './components/LandingPage';
import AIGameSetup from './components/AIGameSetup';
import TeamSetup from './components/TeamSetup';
import FeedbackForm from './components/FeedbackForm';
import useGameState from './hooks/useGameState';
import { Gamepad2, Users, ChevronRight } from 'lucide-react';

function App() {
  const { t } = useTranslation();
  const {
    gameState,
    selectQuestion,
    answerQuestion,
    closeQuestion,
    toggleEditMode,
    updateCategory,
    updateQuestion,
    resetGame,
    resetScore,
    nextTeamTurn,
    createNewGame,
    startGame,
    showAISetup,
    createAIGame,
    setTeamsAndStartGame,
    backToLanding,
    backToTeamSetup,
  } = useGameState();

  const { 
  categories, 
    selectedQuestion, 
    selectedCategory, 
    isEditMode,
    showLandingPage,
    showAISetup: isAISetupVisible,
    showTeamSetup: isTeamSetupVisible,
    teams,
    currentTeamIndex
  } = gameState;

  // Render la landing page
  if (showLandingPage) {
    return <LandingPage onStartGame={startGame} onCreateAIGame={showAISetup} />;
  }

  // Render la configurazione AI
  if (isAISetupVisible) {
    return <AIGameSetup onGameCreated={createAIGame} onCancel={backToLanding} />;
  }

  // Render la configurazione delle squadre
  if (isTeamSetupVisible) {
    return <TeamSetup onTeamsCreated={setTeamsAndStartGame} onCancel={backToLanding} />;
  }

  // Calcola il punteggio totale (somma dei punteggi di tutte le squadre)
  const totalScore = teams && Array.isArray(teams) ? teams.reduce((sum, team) => sum + team.score, 0) : 0;
  
  // Ottieni la squadra corrente
  const currentTeam = teams && Array.isArray(teams) && teams.length > 0 ? teams[currentTeamIndex] : { id: '0', name: 'Nessuna squadra', color: '#cccccc', score: 0 };

  // Render il gioco
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white">
      <Helmet>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
        <meta property="og:title" content={t('title')} />
        <meta property="og:description" content={t('description')} />
      </Helmet>
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center mb-2">
            <Gamepad2 className="h-8 w-8 mr-2 text-yellow-400" />
            <h1 className="text-4xl font-bold text-yellow-400">Quiz Jeopardy</h1>
          </div>
          <p className="text-blue-300">Metti alla prova le tue conoscenze con questo classico gioco di quiz!</p>
        </header>

        {/* Game Controls */}
        

        {/* Team Information */}
        {!isEditMode && teams && Array.isArray(teams) && teams.length > 0 && (
          <div className="mb-6">
            <div className="bg-blue-800 p-4 rounded-md shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold flex items-center">
                  <Users className="h-5 w-5 mr-2 text-yellow-400" />
                  <span>Turno di Gioco</span>
                </h3>
                <button 
                  onClick={nextTeamTurn}
                  className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded-md flex items-center text-sm"
                >
                  Prossima Squadra
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {teams.map((team, index) => (
                  <div 
                    key={team.id} 
                    className={`flex-1 p-3 rounded-md border-2 transition-all duration-200 ${
                      index === currentTeamIndex 
                        ? 'border-yellow-400 bg-blue-700' 
                        : 'border-transparent bg-blue-900/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div 
                        className="h-6 w-6 rounded-full mr-2" 
                        style={{ backgroundColor: team.color }}
                      ></div>
                      <div className="font-medium">{team.name}</div>
                    </div>
                    <div className="text-xl font-bold text-right mt-1">
                      {team.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode Banner */}
        {isEditMode && (
          <div className="bg-yellow-500 text-blue-900 p-3 rounded-md mb-6 text-center font-bold">
            Modalità Modifica: Personalizza le tue categorie e domande, poi clicca "Salva e Gioca" quando hai finito.
          </div>
        )}

        {/* Game Board */}
        <div className="w-full" style={{ minHeight: '600px', height: 'auto' }}>
          <GameBoard
            categories={categories}
            onSelectQuestion={selectQuestion}
            selectedQuestion={selectedQuestion}
            selectedCategory={selectedCategory}
            onCloseQuestion={closeQuestion}
            onAnswerQuestion={answerQuestion}
            isEditMode={isEditMode}
            currentTeam={currentTeam}
            onUpdateCategory={updateCategory}
            onUpdateQuestion={updateQuestion}
          />
        </div>

        {/* Feedback Form */}
        <div className="mt-20 mb-12">
          <FeedbackForm />
        </div>

        {/* Instructions */}
        
      </div>
      <GameControls
          score={totalScore}
          isEditMode={isEditMode}
          onToggleEditMode={toggleEditMode}
          onResetGame={resetGame}
          onResetScore={resetScore}
          onCreateNewGame={createNewGame}
          onBackToLanding={backToLanding}
          onConfigureTeams={backToTeamSetup}
        />
    </div>
  );
}

export default App;