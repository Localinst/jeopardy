import { v4 as uuidv4 } from 'uuid';
import { Category, Question } from '../types';

// Stampa tutte le variabili d'ambiente disponibili per debug
console.log('Tutte le variabili in import.meta.env:', import.meta.env);

// URL del server backend
const SERVER_URL ='https://jeopardy-b937.onrender.com';

/**
 * Estrae il JSON valido da una stringa di testo
 */
const extractValidJson = (text: string): any => {
  // Cerca le parentesi graffe di apertura e chiusura per trovare il JSON
  const startIndex = text.indexOf('{');
  if (startIndex === -1) return null;

  // Traccia il livello di nidificazione delle parentesi graffe per trovare la chiusura corretta
  let openBraces = 0;
  let jsonEndIndex = -1;

  for (let i = startIndex; i < text.length; i++) {
    if (text[i] === '{') openBraces++;
    else if (text[i] === '}') {
      openBraces--;
      if (openBraces === 0) {
        jsonEndIndex = i;
        break;
      }
    }
  }

  if (jsonEndIndex === -1) return null;

  // Estrai la parte che dovrebbe contenere JSON valido
  const jsonStr = text.substring(startIndex, jsonEndIndex + 1);
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Errore nel parsing del JSON estratto:', e);
    return null;
  }
};

/**
 * Trasforma i temi forniti dall'utente in categorie complete utilizzando il backend
 */
export const generateCategoriesWithAI = async (topics: string[], lang?: string, difficulty?: 'easy' | 'medium' | 'hard'): Promise<{ categories: Category[]; quizId?: string | null }> => {
  try {
    console.log('Chiamata al server backend per generazione quiz in corso...');
    
    try {
      // Chiamata al nostro server backend
      console.log('Preparazione richiesta API...');
      console.log('Server URL:', SERVER_URL);
      
      const response = await fetch(`${SERVER_URL}/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ categories: topics, lang: lang || 'it', difficulty: difficulty || 'medium' })
      });

      console.log('Stato risposta API:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        console.error('Errore nella chiamata al server:', errorData);
        throw new Error(`Errore nella chiamata al server: ${response.status} ${response.statusText}`);
      }

  const parsedData = await response.json();
      console.log('Risposta API ricevuta:', parsedData);
      
      if (!parsedData || !parsedData.categories) {
        console.error('Risposta vuota o in formato non riconosciuto dal server');
        throw new Error('Risposta vuota o in formato non riconosciuto dal server');
      }
      
  // Convertiamo i dati nel formato richiesto dalla nostra applicazione
  const categories = mapApiResponseToCategories(parsedData, topics);
  return { categories, quizId: parsedData.quizId || null };
    } catch (error) {
      console.error('Errore nella chiamata al server:', error);
  return { categories: createFallbackCategories(topics), quizId: null };
    }
  } catch (error) {
    console.error('Errore nella generazione con AI:', (error as Error).message);
    // In caso di errore, ritorniamo categorie di fallback
    return { categories: createFallbackCategories(topics), quizId: null };
  }
};

/**
 * Converte la risposta dell'API in oggetti Category utilizzabili dall'applicazione
 */
const mapApiResponseToCategories = (apiResponse: any, fallbackTopics: string[]): Category[] => {
  try {
    console.log('Conversione dati API in categorie...', apiResponse);
    
    // Verifichiamo se la risposta ha il formato atteso
    if (apiResponse && apiResponse.categories && Array.isArray(apiResponse.categories)) {
      const categories = apiResponse.categories.map((category: any) => {
        // Verifichiamo che il formato della categoria sia corretto
        if (category.title && Array.isArray(category.questions)) {
          // Assicuriamoci di avere esattamente 5 domande per categoria
          let questions = category.questions || [];
          
          // Se abbiamo meno di 5 domande, aggiungiamo quelle mancanti
          if (questions.length < 5) {
            const missingPointValues = [100, 200, 300, 400, 500].filter(
              p => !questions.some((q: any) => q.points === p)
            );
            
            for (const points of missingPointValues) {
              questions.push({
                points,
                text: `Domanda aggiuntiva da ${points} punti per ${category.title}`,
                answer: `Risposta per la domanda da ${points} punti`,
                type: 'secca'
              });
            }
          }
          
          // Ordiniamo le domande per punteggio
          questions = questions.sort((a: any, b: any) => a.points - b.points);
          
          // Prendiamo solo le prime 5 domande se ne abbiamo di più
          questions = questions.slice(0, 5);
          
          // Mappiamo ogni domanda assicurandoci che i campi siano correttamente formattati
          const formattedQuestions = questions.map((q: any) => {
            // Verifichiamo e formattimo i campi della domanda
            let questionText = q.text || `Domanda da ${q.points} punti per ${category.title}`;
            let answerText = q.answer || 'Risposta mancante';
            
            // Rimuoviamo eventuali prefissi comuni nelle domande come "Domanda: "
            questionText = questionText.replace(/^(domanda|question)\s*[:.-]\s*/i, '');
            
            // Rimuoviamo eventuali prefissi nelle risposte come "Risposta: "
            answerText = answerText.replace(/^(risposta|answer)\s*[:.-]\s*/i, '');
            
            // Assicuriamoci che la prima lettera sia maiuscola
            questionText = questionText.charAt(0).toUpperCase() + questionText.slice(1);
            answerText = answerText.charAt(0).toUpperCase() + answerText.slice(1);
            
            return {
              id: uuidv4(),
              text: questionText,
              answer: answerText,
              points: q.points || 100,
              isAnswered: false,
              type: q.type || 'secca'
            };
          });
          
          return {
            id: uuidv4(),
            title: category.title,
            questions: formattedQuestions
          };
        } else {
          throw new Error('Formato categoria non valido');
        }
      });
      
      // Log per debug
      console.log('Categorie create:', categories);
      
      // Assicuriamoci di avere esattamente 5 categorie
      if (categories.length < 5) {
        const missingCategories = fallbackTopics.slice(categories.length);
        missingCategories.forEach(topic => {
          categories.push(createFallbackCategory(topic));
        });
      }
      
      // Prendiamo solo le prime 5 categorie se ne abbiamo di più
      return categories.slice(0, 5);
    } else {
      throw new Error('Formato risposta API non valido');
    }
  } catch (error) {
    console.error('Errore nella mappatura della risposta API:', (error as Error).message);
    return createFallbackCategories(fallbackTopics);
  }
};

/**
 * Crea una singola categoria di fallback
 */
const createFallbackCategory = (topic: string): Category => ({
  id: uuidv4(),
  title: topic,
  questions: [100, 200, 300, 400, 500].map(points => ({
    id: uuidv4(),
    text: `Domanda di esempio per ${topic} da ${points} punti`,
    answer: `Risposta di esempio per ${topic}`,
    points,
    isAnswered: false,
    type: 'secca'
  }))
});

/**
 * Crea categorie di fallback con domande di esempio nel caso in cui l'API fallisca
 */
const createFallbackCategories = (topics: string[]): Category[] => {
  return topics.map(topic => createFallbackCategory(topic));
}; 