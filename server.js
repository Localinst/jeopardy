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
  origin: ['https://jeopard.netlify.app', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Log informativo all'avvio del server
console.log('CORS configurato per:', corsOptions.origin.join(', '));

// Configura un pool di API key
const API_KEYS = [
  process.env.OPENROUTER_API_KEY ,
  process.env.OPENROUTER_API_KEY_2  ,
  process.env.OPENROUTER_API_KEY_3 
];

// Stato di ogni API key (true = funzionante, false = non funzionante)
const apiKeyStatus = API_KEYS.map(() => true);

// Contatore per tenere traccia dell'ultima API key usata
let currentKeyIndex = 0;

// Funzione per ottenere la prossima API key funzionante
const getNextWorkingApiKey = () => {
  // Verifica se c'è almeno una chiave funzionante
  if (!apiKeyStatus.some(status => status)) {
    console.log('Tutte le API key sembrano non funzionare. Resettiamo lo stato e riproviamo.');
    // Reset dello stato di tutte le chiavi
    apiKeyStatus.fill(true);
  }
  
  // Trova la prossima chiave funzionante
  let attempts = 0;
  while (attempts < API_KEYS.length) {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    if (apiKeyStatus[currentKeyIndex]) {
      return {
        key: API_KEYS[currentKeyIndex],
        index: currentKeyIndex
      };
    }
    attempts++;
  }
  
  // Fallback all'ultima chiave
  return {
    key: API_KEYS[0],
    index: 0
  };
};

// Stampa informazioni sulle API key disponibili
console.log(`Pool di ${API_KEYS.length} API key disponibili`);

// Utilizza la variabile d'ambiente per la chiave API di OpenRouter
console.log('OpenRouter API Token iniziale (primi 10 caratteri):', API_KEYS[0].substring(0, 10) + '...');

// Endpoint per mantenere il server sveglio attraverso cron job
app.get('/ping', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`Ping ricevuto alle ${timestamp}`);
  res.status(200).json({ 
    status: 'online', 
    timestamp: timestamp,
    message: 'Il server è attivo'
  });
});

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

  // Inizia con la prima API key disponibile
  let apiKeyInfo = getNextWorkingApiKey();
  let attempts = 0;
  const maxAttempts = API_KEYS.length;
  
  while (attempts < maxAttempts) {
    try {
      // Utilizziamo OpenRouter API con gli header corretti
      console.log(`Tentativo ${attempts+1}/${maxAttempts} con API Key ${apiKeyInfo.index+1}`);
      
      const headers = {
        "Authorization": `Bearer ${apiKeyInfo.key}`,
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
        { headers: headers, timeout: 30000 }
      );

      console.log('Risposta API ricevuta:', response.status);
      
      // Se arriviamo qui, la richiesta è andata a buon fine
      console.log(`API Key ${apiKeyInfo.index+1} funzionante!`);
      
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
      return; // Usciamo dalla funzione se la richiesta ha avuto successo
    } catch (error) {
      console.error(`Errore con API Key ${apiKeyInfo.index+1}:`, error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        console.error('ERRORE DI AUTENTICAZIONE: La chiave API potrebbe non essere invalida.');
        // Segna questa chiave come non funzionante
        apiKeyStatus[apiKeyInfo.index] = false;
      }
      
      // Prova con la prossima chiave
      apiKeyInfo = getNextWorkingApiKey();
      attempts++;
      
      if (attempts < maxAttempts) {
        console.log(`Provo con la prossima API Key: ${apiKeyInfo.index+1}`);
      } else {
        console.error('Esauriti tutti i tentativi con le API key disponibili');
      }
    }
  }
  
  // Tutte le API key hanno fallito, restituisci categorie di fallback
  console.error('Tutte le API key hanno fallito, restituisco categorie di fallback');
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