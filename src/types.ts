export interface Question {
  id: string;
  text: string;
  answer: string;
  points: number;
  isAnswered: boolean;
  type?: 'secca' | 'aperta' | 'margine_errore';
}

export interface Category {
  id: string;
  title: string;
  questions: Question[];
}

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

export interface GameState {
  categories: Category[];
  currentScore: number;
  selectedQuestion: Question | null;
  selectedCategory: Category | null;
  isEditMode: boolean;
  showLandingPage: boolean;
  showAISetup: boolean;
  showTeamSetup: boolean;
  teams: Team[];
  currentTeamIndex: number;
} 