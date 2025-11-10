import { useState, useEffect } from 'react';
import { GameState, Question, Category, Team } from '../types';
import { defaultCategories } from '../constants/defaultCategories';
import { v4 as uuidv4 } from 'uuid';
import { getRandomQuiz } from '../services/quizService';

// Squadre di default
const defaultTeams: Team[] = [
  { id: '1', name: 'Squadra 1', color: '#ef4444', score: 0 },
  { id: '2', name: 'Squadra 2', color: '#3b82f6', score: 0 }
];

const useGameState = () => {
  // Flag per controllare se salvare o no nello storage
  const [shouldSaveToStorage, setShouldSaveToStorage] = useState(true);

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
    // Default initial state
    const initial: GameState = {
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

    // If the app is opened directly on a client-side route, initialize accordingly
    try {
      const path = typeof window !== 'undefined' ? (window.location.pathname || '/') : '/';
      const langMatch = path.match(/^\/(en|it)(?:\/|$)/);
      const prefix = langMatch ? `/${langMatch[1]}` : '';
      const route = path.replace(prefix, '') || '/';

      if (route.startsWith('/team-setup')) {
        initial.showLandingPage = false;
        initial.showTeamSetup = true;
      } else if (route.startsWith('/ai-setup')) {
        initial.showLandingPage = false;
        initial.showAISetup = true;
      } else if (route.startsWith('/game')) {
        initial.showLandingPage = false;
      }
    } catch (e) {
      // ignore
    }

    return initial;
  };

  const [gameState, setGameState] = useState<GameState>(loadSavedState);

  // Helper: get current language prefix from pathname (e.g. /en or /it)
  const getLangPrefix = () => {
    try {
      const m = window.location.pathname.match(/^\/(en|it)(?:\/|$)/);
      return m ? `/${m[1]}` : '';
    } catch (e) {
      return '';
    }
  };

  const pushPath = (path: string) => {
    try {
      const prefix = getLangPrefix();
      const newPath = prefix + path;
      window.history.pushState({}, '', newPath);
    } catch (e) {
      // ignore
    }
  };

  // Save state to localStorage only when shouldSaveToStorage is true
  useEffect(() => {
    if (shouldSaveToStorage) {
      try {
        localStorage.setItem('jeopardyGameState', JSON.stringify(gameState));
      } catch (error) {
        console.error('Errore nel salvataggio dello stato del gioco:', error);
      }
    }
  }, [gameState, shouldSaveToStorage]);

  // On mount: if URL contains ?quizId=, fetch the quiz data and initialize state for team setup
  useEffect(() => {
    // If the user loaded a client-side route directly (e.g. /team-setup, /game, /ai-setup)
    // we should initialize the corresponding view instead of showing the landing page.
    try {
      const path = window.location.pathname || '/';
      const langMatch = path.match(/^\/(en|it)(?:\/|$)/);
      const prefix = langMatch ? `/${langMatch[1]}` : '';
      const route = path.replace(prefix, '') || '/';

      if (route.startsWith('/team-setup')) {
        setGameState(prev => ({ ...prev, showLandingPage: false, showTeamSetup: true } as any));
      } else if (route.startsWith('/ai-setup')) {
        setGameState(prev => ({ ...prev, showLandingPage: false, showAISetup: true } as any));
      } else if (route.startsWith('/game')) {
        setGameState(prev => ({ ...prev, showLandingPage: false } as any));
      }
    } catch (e) {
      // ignore
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const quizId = params.get('quizId');
      if (quizId) {
        (async () => {
          try {
            const res = await fetch(`/api/quiz-data/${quizId}`);
            if (res.ok) {
              const json = await res.json();
              const loadedCategories = json.categories.map((c: any) => ({
                ...c,
                // ensure each question has an id and isAnswered flag
                questions: c.questions.map((q: any) => ({ ...q, isAnswered: false }))
              }));

              const stateFromQuiz = {
                ...gameState,
                categories: loadedCategories,
                showLandingPage: false,
                showAISetup: false,
                showTeamSetup: true,
                currentQuizId: quizId
              };
              setGameState(stateFromQuiz as unknown as GameState);
              // clean the query param to keep URL tidy
              const prefix = getLangPrefix();
              window.history.replaceState({}, '', `${prefix}/team-setup`);
            }
          } catch (e) {
            console.error('Error loading quiz by id from URL', e);
          }
        })();
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Avvia il gioco normale con un quiz casuale dal database
  const startGame = async () => {
    try {
      const randomCategories = await getRandomQuiz();
      setGameState({
        ...gameState,
        categories: randomCategories,
        showLandingPage: false,
        showTeamSetup: true,
        showAISetup: false,
        // Ensure teams are reset when starting a fresh game
        teams: defaultTeams.map(t => ({ ...t, score: 0 })),
        currentTeamIndex: 0,
      });
      // Update URL to team-setup/game flow
      pushPath('/team-setup');
    } catch (error) {
      console.error('Error loading random quiz:', error);
      // In caso di errore, usa le categorie di default
      setGameState({
        ...gameState,
        categories: defaultCategories,
        showLandingPage: false,
        showTeamSetup: true,
        showAISetup: false,
        teams: defaultTeams.map(t => ({ ...t, score: 0 })),
        currentTeamIndex: 0,
      });
      pushPath('/team-setup');
    }
  };

  // Mostra setup AI
  const showAISetup = () => {
    setGameState({
      ...gameState,
      showLandingPage: false,
      showAISetup: true,
      showTeamSetup: false,
    });
    pushPath('/ai-setup');
  };

  // Crea un nuovo gioco con categorie generate dall'AI
  const createAIGame = (aiCategories: Category[], quizId?: string | null) => {
    const newState: any = {
      ...gameState,
      categories: aiCategories,
      currentScore: 0,
      selectedQuestion: null,
      selectedCategory: null,
      isEditMode: false,
      showLandingPage: false,
      showAISetup: false,
      showTeamSetup: true,
      currentQuizId: quizId || null,
    };
    setGameState(newState as unknown as GameState);
    // After AI created, go to team setup (or push public quiz URL if saved)
    if (quizId) {
      // push public quiz url so it becomes shareable and indexable
      try {
        const prefix = getLangPrefix();
        window.history.pushState({}, '', `${prefix}/quiz/${quizId}`);
      } catch (e) {
        // fallback to team-setup
        pushPath('/team-setup');
      }
    } else {
      pushPath('/team-setup');
    }
  };

  // Imposta le squadre e avvia il gioco
  const setTeamsAndStartGame = (teams: Team[]) => {
    // Ensure incoming teams have scores reset (start fresh)
    const sanitizedTeams = teams.map(t => ({ ...t, score: 0 }));
    setGameState({
      ...gameState,
      teams: sanitizedTeams,
      currentTeamIndex: 0,
      showTeamSetup: false,
    });
    // Now entering the game board
    pushPath('/game');
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

  // Rimuove i dati del gioco dal localStorage
  const clearGameStorage = () => {
    try {
      localStorage.removeItem('jeopardyGameState');
    } catch (error) {
      console.error('Errore nella rimozione dello stato del gioco:', error);
    }
  };

  // Resetta il gioco
  const resetGame = () => {
    clearGameStorage();
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
      // Reset teams when creating a new empty game
      teams: defaultTeams.map(t => ({ ...t, score: 0 })),
      currentTeamIndex: 0,
    });
  };

  // Torna alla landing page
  const backToLanding = () => {
    // Disabilita temporaneamente il salvataggio nello storage
    setShouldSaveToStorage(false);
    
    // Rimuovi i dati dal localStorage
    clearGameStorage();
    
    // Reset di tutti i punteggi delle squadre e ritorno al menu principale
    const resetTeams = gameState.teams.map(team => ({
      ...team,
      score: 0
    }));
    
    const newState = {
      categories: defaultCategories,
      currentScore: 0,
      selectedQuestion: null,
      selectedCategory: null,
      isEditMode: false,
      showLandingPage: true,
      showAISetup: false,
      showTeamSetup: false,
      teams: resetTeams,
      currentTeamIndex: 0
    };
    
    // Aggiorna lo stato con un reset completo
    setGameState(newState);
    
    // Riabilita il salvataggio nello storage dopo un breve ritardo
    setTimeout(() => {
      setShouldSaveToStorage(true);
    }, 100);
    pushPath('/');
  };

  // Torna alla configurazione delle squadre
  const backToTeamSetup = () => {
    setGameState({
      ...gameState,
      showTeamSetup: true,
    });
    pushPath('/team-setup');
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