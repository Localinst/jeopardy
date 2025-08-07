import { Category } from '../types';
import { v4 as uuidv4 } from 'uuid';

const SERVER_URL = 'https://jeopardy-b937.onrender.com';

export const getRandomQuiz = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${SERVER_URL}/random-quiz`);
    if (!response.ok) {
      throw new Error('Failed to fetch random quiz');
    }
    
    const data = await response.json();
    
    // Trasforma i dati dal database nel formato richiesto dall'applicazione
    return data.categories.map((category: any) => ({
      id: uuidv4(),
      title: category.title,
      questions: category.questions.map((q: any) => ({
        id: uuidv4(),
        text: q.text,
        answer: q.answer,
        points: q.points,
        isAnswered: false
      }))
    }));
  } catch (error) {
    console.error('Error fetching random quiz:', error);
    throw error;
  }
};
