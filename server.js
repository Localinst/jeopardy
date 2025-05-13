import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Ottieni il percorso corrente per configurare dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica le variabili d'ambiente dai file .env e .env.local
dotenv.config();

const app = express();

// Configura CORS in modo più permissivo
const corsOptions = {
  origin: ['https://jeopard.netlify.app', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Log informativo all'avvio del server
console.log('CORS configurato per:', corsOptions.origin.join(', '));

// Rotta di test per verificare che il server risponda correttamente
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Il server è attivo e funzionante',
    timestamp: new Date().toISOString(),
    corsEnabled: true,
    origins: corsOptions.origin
  });
});

// Utilizza la variabile d'ambiente per la chiave API di OpenRouter
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
console.log('OpenRouter API Token presente:', OPENROUTER_API_KEY ? 'Sì' : 'No');
console.log('OpenRouter API Token (primi 10 caratteri):', OPENROUTER_API_KEY ? OPENROUTER_API_KEY.substring(0, 10) + '...' : 'Nessuna chiave');
console.log('Lunghezza token:', OPENROUTER_API_KEY ? OPENROUTER_API_KEY.length : 0);
console.log('Variabili d\'ambiente disponibili:', Object.keys(process.env).join(', '));

app.post('/generate-quiz', async (req, res) => {
  const { categories } = req.body; // array da 5 categorie

  const prompt = `
L'utente ha inserito le seguenti 5 categorie per un quiz in stile Jeopardy!: ${categories.join(", ")}.
Genera un quiz Jeopardy con queste 5 categorie. Ogni categoria deve contenere 5 domande, ciascuna con punteggi da 100 a 500.
Le domande da 100 devono essere facili, quelle da 500 molto difficili.
Restituisci il risultato in formato JSON, con questa struttura esatta:
{
  "categories": [
    {
      "title": "Nome Categoria 1",
      "questions": [
        {"points": 100, "text": "Domanda da 100 punti", "answer": "Risposta alla domanda da 100 punti"},
        {"points": 200, "text": "Domanda da 200 punti", "answer": "Risposta alla domanda da 200 punti"},
        {"points": 300, "text": "Domanda da 300 punti", "answer": "Risposta alla domanda da 300 punti"},
        {"points": 400, "text": "Domanda da 400 punti", "answer": "Risposta alla domanda da 400 punti"},
        {"points": 500, "text": "Domanda da 500 punti", "answer": "Risposta alla domanda da 500 punti"}
      ]
    },
    // ... altre 4 categorie con lo stesso formato
  ]
}
`;

  try {
    // Utilizziamo OpenRouter API con gli header corretti
    console.log('Preparazione richiesta API OpenRouter...');
    
    const headers = {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://jeopard.netlify.app",
      "X-Title": "Jeopardy Quiz App",
      "Content-Type": "application/json"
    };
    
    console.log('Headers configurati:', Object.keys(headers).join(', '));
    console.log('Header Authorization (primi 20 caratteri):', headers.Authorization.substring(0, 20) + '...');
    
    const requestBody = {
      "model": "deepseek/deepseek-r1:free", // Modello gratuito di OpenRouter
      "messages": [
        {
          "role": "system",
          "content": "Sei un assistente specializzato nella creazione di quiz in stile Jeopardy. Rispondi solo con JSON valido."
        },
        {
          "role": "user",
          "content": prompt
        }
      ]
    };
    
    console.log('Corpo richiesta preparato');
    console.log('Modello utilizzato:', requestBody.model);
    console.log('Invio richiesta a OpenRouter...');
    
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions", 
      requestBody,
      { headers: headers }
    );

    console.log('Risposta API ricevuta:', response.status);
    
    // Estrai il contenuto dal messaggio di completamento
    const generatedText = response.data.choices[0].message.content || '';
    
    if (!generatedText) {
      console.error('Risposta vuota o in formato non riconosciuto dall\'API');
      throw new Error('Risposta vuota o in formato non riconosciuto dall\'API');
    }
    
    console.log('Testo generato:', generatedText.substring(0, 100) + '...');
    
    // Estrae il JSON dalla risposta
    let parsedData;
    try {
      // Cerca di trovare la struttura JSON nella risposta
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        try {
          // Prova a parsare direttamente la risposta come JSON
          parsedData = JSON.parse(generatedText.trim());
        } catch (error) {
          throw new Error('Formato JSON non trovato nella risposta');
        }
      }
    } catch (parseError) {
      console.error('Errore nel parsing della risposta:', parseError.message);
      
      // Se non riusciamo a estrarre JSON valido, creiamo un formato di fallback
      parsedData = {
        categories: categories.map((categoryName) => {
          return {
            title: categoryName,
            questions: [100, 200, 300, 400, 500].map(points => {
              return {
                points,
                text: `Domanda di esempio per ${categoryName} da ${points} punti`,
                answer: `Risposta di esempio per ${categoryName}`
              };
            })
          };
        })
      };
    }

    res.json(parsedData);
  } catch (error) {
    console.error('Errore nella chiamata a OpenRouter API:', error.response?.data || error.message);
    console.error('Codice di stato:', error.response?.status || 'N/A');
    console.error('Dettagli errore:', JSON.stringify(error.response?.data || {}, null, 2));
    console.error('Stack trace:', error.stack || 'N/A');
    
    if (error.response?.status === 401) {
      console.error('ERRORE DI AUTENTICAZIONE: La chiave API potrebbe non essere valida o mancante.');
      console.error('Controlla che la variabile d\'ambiente OPENROUTER_API_KEY sia impostata correttamente su Render.');
    }
    
    // In caso di errore, restituisce categorie di fallback
    const fallbackData = {
      categories: categories.map((categoryName) => {
        return {
          title: categoryName,
          questions: [100, 200, 300, 400, 500].map(points => {
            return {
              points,
              text: `Domanda di esempio per ${categoryName} da ${points} punti`,
              answer: `Risposta di esempio per ${categoryName}`
            };
          })
        };
      })
    };
    
    res.json(fallbackData);
  }
});

// Gestione errore per JSON malformato
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: 'JSON malformato',
      message: err.message 
    });
  }
  next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
}); 