import { useState, useEffect } from 'react';
import { GameState, Question, Category, Team } from '../types';
import { defaultCategories } from '../constants/defaultCategories';
import { v4 as uuidv4 } from 'uuid';

// Squadre di default
const defaultTeams: Team[] = [
  { id: '1', name: 'Squadra 1', color: '#ef4444', score: 0 },
  { id: '2', name: 'Squadra 2', color: '#3b82f6', score: 0 }
];

const useGameState = () => {
  // Try to load from localStorage first
  const loadSavedState = (): GameState => {
    try {
      const savedState = localStorage.getItem('jeopardyGameState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Errore nel caricamento dello stato del gioco:', error);
    }
    return {
      categories: defaultCategories,
      currentScore: 0,
      selectedQuestion: null,
      selectedCategory: null,
      isEditMode: false,
      showLandingPage: true,
      showAISetup: false,
      showTeamSetup: false,
      teams: defaultTeams,
      currentTeamIndex: 0
    };
  };

  const [gameState, setGameState] = useState<GameState>(loadSavedState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('jeopardyGameState', JSON.stringify(gameState));
    } catch (error) {
      console.error('Errore nel salvataggio dello stato del gioco:', error);
    }
  }, [gameState]);

  // Avvia il gioco normale
  const startGame = () => {
    setGameState({
      ...gameState,
      showLandingPage: false,
      showTeamSetup: true,
      showAISetup: false,
    });
  };

  // Mostra setup AI
  const showAISetup = () => {
    setGameState({
      ...gameState,
      showLandingPage: false,
      showAISetup: true,
      showTeamSetup: false,
    });
  };

  // Crea un nuovo gioco con categorie generate dall'AI
  const createAIGame = (aiCategories: Category[]) => {
    setGameState({
      ...gameState,
      categories: aiCategories,
      currentScore: 0,
      selectedQuestion: null,
      selectedCategory: null,
      isEditMode: false,
      showLandingPage: false,
      showAISetup: false,
      showTeamSetup: true,
    });
  };

  // Imposta le squadre e avvia il gioco
  const setTeamsAndStartGame = (teams: Team[]) => {
    setGameState({
      ...gameState,
      teams,
      currentTeamIndex: 0,
      showTeamSetup: false,
    });
  };

  // Seleziona una domanda
  const selectQuestion = (categoryId: string, questionId: string) => {
    const category = gameState.categories.find(c => c.id === categoryId);
    if (!category) return;

    const question = category.questions.find(q => q.id === questionId);
    if (!question || question.isAnswered) return;

    setGameState({
      ...gameState,
      selectedQuestion: question,
      selectedCategory: category,
    });
  };

  // Gestisci la risposta alla domanda
  const answerQuestion = (isCorrect: boolean) => {
    if (!gameState.selectedQuestion || !gameState.selectedCategory) return;

    const pointChange = isCorrect 
      ? gameState.selectedQuestion.points 
      : -gameState.selectedQuestion.points; // Sottrai punti per risposte errate

    const updatedCategories = gameState.categories.map(category => {
      if (category.id === gameState.selectedCategory?.id) {
        return {
          ...category,
          questions: category.questions.map(question => {
            if (question.id === gameState.selectedQuestion?.id) {
              return { ...question, isAnswered: true };
            }
            return question;
          }),
        };
      }
      return category;
    });

    // Aggiorna il punteggio della squadra corrente
    const updatedTeams = [...gameState.teams];
    // Applica la modifica di punteggio (positiva o negativa)
    updatedTeams[gameState.currentTeamIndex].score += pointChange;

    // Passa sempre al turno della squadra successiva
    const nextTeamIndex = (gameState.currentTeamIndex + 1) % gameState.teams.length;

    setGameState({
      ...gameState,
      categories: updatedCategories,
      currentScore: isCorrect ? gameState.currentScore + pointChange : gameState.currentScore,
      selectedQuestion: null,
      selectedCategory: null,
      teams: updatedTeams,
      currentTeamIndex: nextTeamIndex,
    });
  };

  // Chiudi la domanda senza rispondere
  const closeQuestion = () => {
    setGameState({
      ...gameState,
      selectedQuestion: null,
      selectedCategory: null,
    });
  };

  // Attiva/disattiva la modalità di modifica
  const toggleEditMode = () => {
    setGameState({
      ...gameState,
      isEditMode: !gameState.isEditMode,
      selectedQuestion: null,
      selectedCategory: null,
    });
  };

  // Aggiorna il titolo di una categoria
  const updateCategory = (categoryId: string, newTitle: string) => {
    const updatedCategories = gameState.categories.map(category => {
      if (category.id === categoryId) {
        return { ...category, title: newTitle };
      }
      return category;
    });

    setGameState({
      ...gameState,
      categories: updatedCategories,
    });
  };

  // Aggiorna una domanda
  const updateQuestion = (
    categoryId: string,
    questionId: string,
    updates: Partial<Question>
  ) => {
    const updatedCategories = gameState.categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          questions: category.questions.map(question => {
            if (question.id === questionId) {
              return { ...question, ...updates };
            }
            return question;
          }),
        };
      }
      return category;
    });

    setGameState({
      ...gameState,
      categories: updatedCategories,
    });
  };

  // Resetta il gioco
  const resetGame = () => {
    setGameState({
      ...gameState,
      categories: defaultCategories,
      currentScore: 0,
      selectedQuestion: null,
      selectedCategory: null,
      isEditMode: false,
      teams: defaultTeams,
      currentTeamIndex: 0,
    });
  };

  // Resetta solo i punteggi
  const resetScore = () => {
    // Resetta il punteggio di tutte le squadre
    const resetTeams = gameState.teams.map(team => ({
      ...team,
      score: 0
    }));

    setGameState({
      ...gameState,
      currentScore: 0,
      teams: resetTeams,
    });
  };

  // Passa manualmente al turno della squadra successiva
  const nextTeamTurn = () => {
    setGameState({
      ...gameState,
      currentTeamIndex: (gameState.currentTeamIndex + 1) % gameState.teams.length
    });
  };

  // Crea un nuovo gioco vuoto
  const createNewGame = () => {
    const emptyCategories: Category[] = Array(5).fill(null).map(() => {
      return {
        id: uuidv4(),
        title: 'Nuova Categoria',
        questions: [100, 200, 300, 400, 500].map(points => ({
          id: uuidv4(),
          text: 'Nuova Domanda',
          answer: 'Nuova Risposta',
          points,
          isAnswered: false,
        })),
      };
    });

    setGameState({
      ...gameState,
      categories: emptyCategories,
      currentScore: 0,
      selectedQuestion: null,
      selectedCategory: null,
      isEditMode: true,
    });
  };

  // Torna alla landing page
  const backToLanding = () => {
    setGameState({
      ...gameState,
      showLandingPage: true,
      showAISetup: false,
      showTeamSetup: false,
    });
  };

  // Torna alla configurazione delle squadre
  const backToTeamSetup = () => {
    setGameState({
      ...gameState,
      showTeamSetup: true,
    });
  };

  return {
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
  };
};

export default useGameState;