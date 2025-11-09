export interface Question {
  id: string;
  text: string;
  answer: string;
  points: number;
  isAnswered: boolean;
}

export interface Category {
  id: string;
  title: string;
  questions: Question[];
}

export interface GameState {
  categories: Category[];
  currentScore: number;
  selectedQuestion: Question | null;
  selectedCategory: Category | null;
  isEditMode: boolean;
  showLandingPage: boolean;
  showAISetup: boolean;
  currentQuizId?: string | null;
}